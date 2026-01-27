'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Share2, Loader2, Bookmark } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to get/set guest session ID
const getGuestSessionId = () => {
  if (typeof window === 'undefined') return null;
  let sessionId = localStorage.getItem('guest_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('guest_session_id', sessionId);
  }
  return sessionId;
};

interface ArticleInteractionsProps {
  articleId: number; // Articles are BIGINT/number
  initialLikes?: number;
  initialDislikes?: number;
  locale: string;
}

export default function ArticleInteractions({ 
  articleId, 
  initialLikes = 0, 
  initialDislikes = 0,
  locale
}: ArticleInteractionsProps) {
  const { user, isAuthenticated } = useAuth();
  const supabase = getClient();
  const router = useRouter();

  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [guestMessage, setGuestMessage] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      // Get counts
      const { count: likeCount } = await supabase
        .from('article_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', articleId)
        .eq('interaction_type', 'like');

      const { count: dislikeCount } = await supabase
        .from('article_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', articleId)
        .eq('interaction_type', 'dislike');

      if (mounted) {
        setLikes(likeCount || 0);
        setDislikes(dislikeCount || 0);
      }

      // Check for user or guest vote
      if (user) {
        // Logged in user
        const { data: voteData } = await supabase
          .from('article_interactions')
          .select('interaction_type')
          .eq('article_id', articleId)
          .eq('user_id', user.id)
          .single();
        
        const { data: bookmarkData } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('article_id', articleId)
          .eq('user_id', user.id)
          .single();

        if (mounted) {
          if (voteData) setUserVote(voteData.interaction_type as 'like' | 'dislike');
          setIsBookmarked(!!bookmarkData);
        }
      } else {
        // Guest user
        const sessionId = getGuestSessionId();
        if (sessionId) {
          const { data: voteData } = await supabase
            .from('article_interactions')
            .select('interaction_type')
            .eq('article_id', articleId)
            .eq('session_id', sessionId)
            .single();
          
          if (mounted && voteData) {
            setUserVote(voteData.interaction_type as 'like' | 'dislike');
          }
        }
      }
      
      if (mounted) setIsLoading(false);
    };

    fetchData();

    return () => { mounted = false; };
  }, [articleId, user, supabase]);

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    // ... existing bookmark logic ...
    if (isBookmarking) return;
    setIsBookmarking(true);

    const previousState = isBookmarked;
    setIsBookmarked(!previousState);

    try {
      if (previousState) {
        await supabase.from('bookmarks').delete().eq('article_id', articleId).eq('user_id', user!.id);
      } else {
        await supabase.from('bookmarks').insert({ article_id: articleId, user_id: user!.id });
      }
    } catch (error) {
      console.error('Bookmark failed:', error);
      setIsBookmarked(previousState);
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleVote = async (type: 'like' | 'dislike') => {
    if (isVoting) return;
    setIsVoting(true);

    // Show guest message if not logged in
    if (!isAuthenticated) {
      setGuestMessage(locale === 'ar' ? 'تصويت كزائر' : 'Voting as guest');
      setTimeout(() => setGuestMessage(null), 3000);
    }

    const previousVote = userVote;
    const previousLikes = likes;
    const previousDislikes = dislikes;
    const sessionId = !isAuthenticated ? getGuestSessionId() : null;

    // Toggle logic
    if (userVote === type) {
      setUserVote(null);
      if (type === 'like') setLikes(prev => prev - 1);
      else setDislikes(prev => prev - 1);
    } else {
      setUserVote(type);
      if (type === 'like') {
        setLikes(prev => prev + 1);
        if (previousVote === 'dislike') setDislikes(prev => prev - 1);
      } else {
        setDislikes(prev => prev + 1);
        if (previousVote === 'like') setLikes(prev => prev - 1);
      }
    }

    try {
      if (isAuthenticated) {
        // Authenticated user: use direct table operations
        if (previousVote === type) {
          // Toggle off
          await supabase
            .from('article_interactions')
            .delete()
            .eq('article_id', articleId)
            .eq('user_id', user!.id);
        } else {
          // Delete existing vote first, then insert new
          await supabase
            .from('article_interactions')
            .delete()
            .eq('article_id', articleId)
            .eq('user_id', user!.id);

          await supabase
            .from('article_interactions')
            .insert({
              article_id: articleId,
              user_id: user!.id,
              interaction_type: type,
            });
        }
      } else {
        // Guest user: use RPC functions for secure operations
        if (previousVote === type) {
          // Toggle off - use guest_unvote RPC
          await supabase.rpc('guest_unvote', {
            p_article_id: articleId,
            p_session_id: sessionId!,
          });
        } else {
          // Add or change vote - use guest_vote RPC
          await supabase.rpc('guest_vote', {
            p_article_id: articleId,
            p_session_id: sessionId!,
            p_interaction_type: type,
          });
        }
      }
    } catch (error) {
      console.error('Vote failed:', error);
      setUserVote(previousVote);
      setLikes(previousLikes);
      setDislikes(previousDislikes);
    } finally {
      setIsVoting(false);
    }
  };
  
  // ... rest of component


  const handleShare = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);

    // Log share
    await supabase.from('article_shares').insert({
      article_id: articleId,
      user_id: user?.id || null, // Allow anonymous shares
      platform: 'copy_link'
    });
  };

  if (isLoading) return <div className="h-10" />; // Placeholder

  return (
    <div className="flex flex-col">
      {guestMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="self-start mb-2 text-xs text-tactical-amber bg-tactical-amber/10 px-2 py-1 rounded"
        >
          {guestMessage}
        </motion.div>
      )}
      <div className="flex items-center gap-4 py-4 border-t border-midnight-700 mt-8">
        {/* Like Button */}
      <button
        onClick={() => handleVote('like')}
        disabled={isVoting}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
          userVote === 'like' 
            ? 'bg-earth-olive/10 text-earth-olive' 
            : 'text-slate-medium hover:bg-midnight-700 hover:text-earth-olive'
        }`}
      >
        <ThumbsUp className={`h-5 w-5 ${userVote === 'like' ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium">{likes}</span>
      </button>

      {/* Dislike Button */}
      <button
        onClick={() => handleVote('dislike')}
        disabled={isVoting}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
          userVote === 'dislike' 
            ? 'bg-tactical-red/10 text-tactical-red' 
            : 'text-slate-medium hover:bg-midnight-700 hover:text-tactical-red'
        }`}
      >
        <ThumbsDown className={`h-5 w-5 ${userVote === 'dislike' ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium">{dislikes}</span>
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-midnight-700 mx-2" />

      {/* Bookmark Button */}
      <button
        onClick={handleBookmark}
        disabled={isBookmarking}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
          isBookmarked
            ? 'bg-tactical-amber/10 text-tactical-amber'
            : 'text-slate-medium hover:bg-midnight-700 hover:text-tactical-amber'
        }`}
        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Article'}
      >
        <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium hidden sm:inline">Save</span>
      </button>

      {/* Share Button */}
      <div className="relative">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-medium hover:bg-midnight-700 hover:text-slate-light transition-colors"
        >
          <Share2 className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">Share</span>
        </button>

        <AnimatePresence>
          {showShareTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-light text-midnight-900 text-xs rounded font-bold whitespace-nowrap"
            >
              Link Copied!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </div>
  );
}
