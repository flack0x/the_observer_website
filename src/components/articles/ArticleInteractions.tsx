'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Share2, Loader2, Bookmark } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
  const pathname = usePathname();

  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

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

      // Get user interactions if logged in
      if (user) {
        // Vote
        const { data: voteData } = await supabase
          .from('article_interactions')
          .select('interaction_type')
          .eq('article_id', articleId)
          .eq('user_id', user.id)
          .single();
        
        // Bookmark
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

    if (isBookmarking) return;
    setIsBookmarking(true);

    // Optimistic update
    const previousState = isBookmarked;
    setIsBookmarked(!previousState);

    try {
      if (previousState) {
        // Remove bookmark
        await supabase
          .from('bookmarks')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', user!.id);
      } else {
        // Add bookmark
        await supabase
          .from('bookmarks')
          .insert({
            article_id: articleId,
            user_id: user!.id
          });
      }
    } catch (error) {
      // Revert on error
      console.error('Bookmark failed:', error);
      setIsBookmarked(previousState);
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }

    if (isVoting) return;
    setIsVoting(true);

    // Optimistic update
    const previousVote = userVote;
    const previousLikes = likes;
    const previousDislikes = dislikes;

    // Toggle logic
    if (userVote === type) {
      // Remove vote
      setUserVote(null);
      if (type === 'like') setLikes(prev => prev - 1);
      else setDislikes(prev => prev - 1);
    } else {
      // Change vote
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
      if (previousVote === type) {
        // Delete interaction
        await supabase
          .from('article_interactions')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', user!.id);
      } else {
        // Upsert interaction
        await supabase
          .from('article_interactions')
          .upsert({
            article_id: articleId,
            user_id: user!.id,
            interaction_type: type
          }, { onConflict: 'article_id,user_id' });
      }
    } catch (error) {
      // Revert on error
      console.error('Vote failed:', error);
      setUserVote(previousVote);
      setLikes(previousLikes);
      setDislikes(previousDislikes);
    } finally {
      setIsVoting(false);
    }
  };

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
  );
}
