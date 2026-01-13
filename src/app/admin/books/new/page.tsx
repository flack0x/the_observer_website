'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Image as ImageIcon,
  Star,
  Plus,
  X,
  BookOpen,
} from 'lucide-react';
import { TipTapEditor } from '@/components/admin/editor';

export default function NewBookReviewPage() {
  const router = useRouter();

  // Form state
  const [bookTitleEn, setBookTitleEn] = useState('');
  const [bookTitleAr, setBookTitleAr] = useState('');
  const [author, setAuthor] = useState('');
  const [excerptEn, setExcerptEn] = useState('');
  const [excerptAr, setExcerptAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [keyPointsEn, setKeyPointsEn] = useState<string[]>([]);
  const [keyPointsAr, setKeyPointsAr] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [recommendationLevel, setRecommendationLevel] = useState<string>('');
  const [telegramLinkEn, setTelegramLinkEn] = useState('');
  const [telegramLinkAr, setTelegramLinkAr] = useState('');

  // Key points input
  const [newKeyPointEn, setNewKeyPointEn] = useState('');
  const [newKeyPointAr, setNewKeyPointAr] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (status: 'draft' | 'published') => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_title_en: bookTitleEn,
          book_title_ar: bookTitleAr,
          author,
          excerpt_en: excerptEn,
          excerpt_ar: excerptAr,
          description_en: descriptionEn,
          description_ar: descriptionAr,
          key_points_en: keyPointsEn,
          key_points_ar: keyPointsAr,
          cover_image_url: coverImageUrl || null,
          rating,
          recommendation_level: recommendationLevel || null,
          telegram_link_en: telegramLinkEn || null,
          telegram_link_ar: telegramLinkAr || null,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create book review');
      }

      router.push('/admin/books');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addKeyPointEn = () => {
    if (newKeyPointEn.trim()) {
      setKeyPointsEn([...keyPointsEn, newKeyPointEn.trim()]);
      setNewKeyPointEn('');
    }
  };

  const addKeyPointAr = () => {
    if (newKeyPointAr.trim()) {
      setKeyPointsAr([...keyPointsAr, newKeyPointAr.trim()]);
      setNewKeyPointAr('');
    }
  };

  const removeKeyPointEn = (index: number) => {
    setKeyPointsEn(keyPointsEn.filter((_, i) => i !== index));
  };

  const removeKeyPointAr = (index: number) => {
    setKeyPointsAr(keyPointsAr.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
            <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-slate-light">
              New Book Review
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting || !bookTitleEn}
            className="flex items-center gap-2 bg-midnight-700 border border-midnight-500 text-slate-light
                     px-4 py-2 rounded-lg hover:border-tactical-red hover:text-tactical-red
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting || !bookTitleEn || !descriptionEn}
            className="flex items-center gap-2 bg-tactical-red text-white font-heading font-bold uppercase tracking-wider
                     px-4 py-2 rounded-lg hover:bg-tactical-red-hover
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            Publish
          </button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Main editor area */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* English editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-medium">
              English
            </h2>
            <span className="text-xs text-slate-dark">LTR</span>
          </div>

          <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-4 space-y-4">
            <div>
              <label className="block text-sm text-slate-medium mb-2">Book Title</label>
              <input
                type="text"
                value={bookTitleEn}
                onChange={(e) => setBookTitleEn(e.target.value)}
                placeholder="Book title in English"
                className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                         text-slate-light placeholder:text-slate-dark
                         focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-medium mb-2">Excerpt</label>
              <textarea
                value={excerptEn}
                onChange={(e) => setExcerptEn(e.target.value)}
                placeholder="Brief summary (1-2 sentences)"
                rows={2}
                className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                         text-slate-light placeholder:text-slate-dark resize-none
                         focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-medium mb-2">Description</label>
              <TipTapEditor
                content={descriptionEn}
                onChange={setDescriptionEn}
                placeholder="Write your book review here..."
                dir="ltr"
              />
            </div>

            {/* Key Points EN */}
            <div>
              <label className="block text-sm text-slate-medium mb-2">Key Points</label>
              <div className="space-y-2">
                {keyPointsEn.map((point, index) => (
                  <div key={index} className="flex items-center gap-2 bg-midnight-700 rounded-lg px-3 py-2">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-tactical-red/10 text-xs font-bold text-tactical-red">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm text-slate-light">{point}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyPointEn(index)}
                      className="p-1 text-slate-dark hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyPointEn}
                    onChange={(e) => setNewKeyPointEn(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyPointEn())}
                    placeholder="Add a key point..."
                    className="flex-1 bg-midnight-700 border border-midnight-500 rounded-lg px-3 py-2
                             text-slate-light placeholder:text-slate-dark text-sm
                             focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addKeyPointEn}
                    className="p-2 bg-midnight-700 border border-midnight-500 rounded-lg text-slate-medium hover:text-tactical-red hover:border-tactical-red transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-medium mb-2">Telegram Link (EN)</label>
              <input
                type="url"
                value={telegramLinkEn}
                onChange={(e) => setTelegramLinkEn(e.target.value)}
                placeholder="https://t.me/observer_5/123"
                className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                         text-slate-light placeholder:text-slate-dark
                         focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Arabic editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-medium">
              Arabic (العربية)
            </h2>
            <span className="text-xs text-slate-dark">RTL</span>
          </div>

          <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-4 space-y-4">
            <div>
              <label className="block text-sm text-slate-medium mb-2 text-right">عنوان الكتاب</label>
              <input
                type="text"
                value={bookTitleAr}
                onChange={(e) => setBookTitleAr(e.target.value)}
                placeholder="عنوان الكتاب بالعربية"
                dir="rtl"
                className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                         text-slate-light placeholder:text-slate-dark text-right
                         focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-medium mb-2 text-right">المقتطف</label>
              <textarea
                value={excerptAr}
                onChange={(e) => setExcerptAr(e.target.value)}
                placeholder="ملخص موجز (جملة أو جملتين)"
                rows={2}
                dir="rtl"
                className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                         text-slate-light placeholder:text-slate-dark resize-none text-right
                         focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-medium mb-2 text-right">الوصف</label>
              <TipTapEditor
                content={descriptionAr}
                onChange={setDescriptionAr}
                placeholder="اكتب مراجعة الكتاب هنا..."
                dir="rtl"
              />
            </div>

            {/* Key Points AR */}
            <div>
              <label className="block text-sm text-slate-medium mb-2 text-right">النقاط الرئيسية</label>
              <div className="space-y-2">
                {keyPointsAr.map((point, index) => (
                  <div key={index} className="flex items-center gap-2 bg-midnight-700 rounded-lg px-3 py-2" dir="rtl">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-tactical-red/10 text-xs font-bold text-tactical-red">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm text-slate-light">{point}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyPointAr(index)}
                      className="p-1 text-slate-dark hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2" dir="rtl">
                  <input
                    type="text"
                    value={newKeyPointAr}
                    onChange={(e) => setNewKeyPointAr(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyPointAr())}
                    placeholder="أضف نقطة رئيسية..."
                    dir="rtl"
                    className="flex-1 bg-midnight-700 border border-midnight-500 rounded-lg px-3 py-2
                             text-slate-light placeholder:text-slate-dark text-sm text-right
                             focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addKeyPointAr}
                    className="p-2 bg-midnight-700 border border-midnight-500 rounded-lg text-slate-medium hover:text-tactical-red hover:border-tactical-red transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-medium mb-2 text-right">رابط تيليجرام</label>
              <input
                type="url"
                value={telegramLinkAr}
                onChange={(e) => setTelegramLinkAr(e.target.value)}
                placeholder="https://t.me/almuraqb/123"
                dir="ltr"
                className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                         text-slate-light placeholder:text-slate-dark
                         focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
