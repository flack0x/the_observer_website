'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Loader2,
  Image as ImageIcon,
  Star,
  Plus,
  X,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';
import { TipTapEditor } from '@/components/admin/editor';

interface BookReview {
  id: number;
  review_id: string;
  channel: 'en' | 'ar';
  book_title: string;
  author: string;
  cover_image_url: string | null;
  excerpt: string | null;
  description: string;
  key_points: string[] | null;
  rating: number | null;
  recommendation_level: string | null;
  telegram_link: string | null;
  status: string;
}

export default function EditBookReviewPage() {
  const router = useRouter();
  const params = useParams();
  const reviewId = Array.isArray(params.id) ? params.id.join('/') : params.id;

  // Form state
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [description, setDescription] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [recommendationLevel, setRecommendationLevel] = useState<string>('');
  const [telegramLink, setTelegramLink] = useState('');
  const [status, setStatus] = useState('draft');
  const [channel, setChannel] = useState<'en' | 'ar'>('en');

  // Key points input
  const [newKeyPoint, setNewKeyPoint] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Load book review data
  useEffect(() => {
    async function loadBookReview() {
      try {
        const response = await fetch(`/api/admin/books/${encodeURIComponent(reviewId)}`);

        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true);
            return;
          }
          throw new Error('Failed to load book review');
        }

        const { data } = await response.json();

        setBookTitle(data.book_title);
        setAuthor(data.author);
        setExcerpt(data.excerpt || '');
        setDescription(data.description || '');
        setKeyPoints(data.key_points || []);
        setCoverImageUrl(data.cover_image_url || '');
        setRating(data.rating);
        setRecommendationLevel(data.recommendation_level || '');
        setTelegramLink(data.telegram_link || '');
        setStatus(data.status);
        setChannel(data.channel);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    loadBookReview();
  }, [reviewId]);

  const handleSubmit = async (newStatus?: string) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/books/${encodeURIComponent(reviewId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_title: bookTitle,
          author,
          excerpt,
          description,
          key_points: keyPoints,
          cover_image_url: coverImageUrl || null,
          rating,
          recommendation_level: recommendationLevel || null,
          telegram_link: telegramLink || null,
          status: newStatus || status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update book review');
      }

      if (newStatus) {
        setStatus(newStatus);
      }

      router.push('/admin/books');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setKeyPoints([...keyPoints, newKeyPoint.trim()]);
      setNewKeyPoint('');
    }
  };

  const removeKeyPoint = (index: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== index));
  };

  const isArabic = channel === 'ar';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-tactical-red" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle className="h-12 w-12 text-tactical-amber mb-4" />
        <h1 className="font-heading text-xl font-bold text-slate-light mb-2">Book Review Not Found</h1>
        <p className="text-slate-medium mb-6">This book review may have been deleted.</p>
        <Link
          href="/admin/books"
          className="flex items-center gap-2 px-4 py-2 bg-tactical-red text-white rounded-lg font-heading text-sm font-bold uppercase tracking-wider hover:bg-tactical-red-hover transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Books
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/books"
            className="p-2 rounded-lg hover:bg-midnight-700 text-slate-medium hover:text-slate-light transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-tactical-red" />
            <div>
              <h1 className="font-heading text-xl font-bold uppercase tracking-wider text-slate-light">
                Edit Book Review
              </h1>
              <p className="text-xs text-slate-dark uppercase">{channel} version</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-1 rounded-full ${
            status === 'published' ? 'bg-earth-olive/10 text-earth-olive' :
            status === 'draft' ? 'bg-tactical-amber/10 text-tactical-amber' :
            'bg-slate-dark/10 text-slate-dark'
          }`}>
            {status}
          </span>
          <button
            onClick={() => handleSubmit()}
            disabled={isSubmitting || !bookTitle}
            className="flex items-center gap-2 bg-midnight-700 border border-midnight-500 text-slate-light
                     px-4 py-2 rounded-lg hover:border-tactical-red hover:text-tactical-red
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
          {status !== 'published' && (
            <button
              onClick={() => handleSubmit('published')}
              disabled={isSubmitting || !bookTitle || !description}
              className="flex items-center gap-2 bg-tactical-red text-white font-heading font-bold uppercase tracking-wider
                       px-4 py-2 rounded-lg hover:bg-tactical-red-hover
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {/* Book Info Section */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-6 space-y-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
          Book Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Author */}
          <div>
            <label className="block text-sm text-slate-medium mb-2">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name"
              className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                       text-slate-light placeholder:text-slate-dark
                       focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
            />
          </div>

          {/* Recommendation Level */}
          <div>
            <label className="block text-sm text-slate-medium mb-2">Recommendation Level</label>
            <select
              value={recommendationLevel}
              onChange={(e) => setRecommendationLevel(e.target.value)}
              className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                       text-slate-light
                       focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
            >
              <option value="">Select level...</option>
              <option value="essential">Essential</option>
              <option value="recommended">Recommended</option>
              <option value="optional">Optional</option>
            </select>
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm text-slate-medium mb-2">
            <ImageIcon className="h-4 w-4 inline mr-1" />
            Cover Image URL
          </label>
          <input
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://example.com/cover.jpg"
            className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                     text-slate-light placeholder:text-slate-dark
                     focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm text-slate-medium mb-3">Rating</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(rating === star ? null : star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    rating && star <= rating
                      ? 'text-tactical-amber fill-tactical-amber'
                      : 'text-slate-dark hover:text-slate-medium'
                  }`}
                />
              </button>
            ))}
            {rating && (
              <span className="ml-2 text-sm text-slate-medium">({rating}/5)</span>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-6 space-y-4" dir={isArabic ? 'rtl' : 'ltr'}>
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
          {isArabic ? 'المحتوى' : 'Content'} ({channel.toUpperCase()})
        </h2>

        <div>
          <label className="block text-sm text-slate-medium mb-2">{isArabic ? 'عنوان الكتاب' : 'Book Title'}</label>
          <input
            type="text"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder={isArabic ? 'عنوان الكتاب' : 'Book title'}
            dir={isArabic ? 'rtl' : 'ltr'}
            className={`w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                     text-slate-light placeholder:text-slate-dark ${isArabic ? 'text-right' : ''}
                     focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none`}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-medium mb-2">{isArabic ? 'المقتطف' : 'Excerpt'}</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder={isArabic ? 'ملخص موجز' : 'Brief summary'}
            rows={2}
            dir={isArabic ? 'rtl' : 'ltr'}
            className={`w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                     text-slate-light placeholder:text-slate-dark resize-none ${isArabic ? 'text-right' : ''}
                     focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none`}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-medium mb-2">{isArabic ? 'الوصف' : 'Description'}</label>
          <TipTapEditor
            content={description}
            onChange={setDescription}
            placeholder={isArabic ? 'اكتب مراجعة الكتاب هنا...' : 'Write your book review here...'}
            dir={isArabic ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Key Points */}
        <div>
          <label className="block text-sm text-slate-medium mb-2">{isArabic ? 'النقاط الرئيسية' : 'Key Points'}</label>
          <div className="space-y-2">
            {keyPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-2 bg-midnight-700 rounded-lg px-3 py-2">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-tactical-red/10 text-xs font-bold text-tactical-red">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm text-slate-light">{point}</span>
                <button
                  type="button"
                  onClick={() => removeKeyPoint(index)}
                  className="p-1 text-slate-dark hover:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyPoint}
                onChange={(e) => setNewKeyPoint(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyPoint())}
                placeholder={isArabic ? 'أضف نقطة رئيسية...' : 'Add a key point...'}
                dir={isArabic ? 'rtl' : 'ltr'}
                className={`flex-1 bg-midnight-700 border border-midnight-500 rounded-lg px-3 py-2
                         text-slate-light placeholder:text-slate-dark text-sm ${isArabic ? 'text-right' : ''}
                         focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none`}
              />
              <button
                type="button"
                onClick={addKeyPoint}
                className="p-2 bg-midnight-700 border border-midnight-500 rounded-lg text-slate-medium hover:text-tactical-red hover:border-tactical-red transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-medium mb-2">{isArabic ? 'رابط تيليجرام' : 'Telegram Link'}</label>
          <input
            type="url"
            value={telegramLink}
            onChange={(e) => setTelegramLink(e.target.value)}
            placeholder={isArabic ? 'https://t.me/almuraqb/123' : 'https://t.me/observer_5/123'}
            dir="ltr"
            className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                     text-slate-light placeholder:text-slate-dark
                     focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
