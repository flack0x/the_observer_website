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
  Video,
  X,
  Monitor,
  AlertCircle,
  Check,
  Upload,
  Send,
} from 'lucide-react';
import { TipTapEditor, MediaPickerModal } from '@/components/admin/editor';
import { ArticlePreviewModal } from '@/components/admin/articles';
import { CATEGORIES } from '@/lib/categories';

// Common countries and organizations for quick selection
const COMMON_COUNTRIES = [
  'Iran', 'Israel', 'USA', 'Palestine', 'Lebanon', 'Syria', 'Iraq',
  'Yemen', 'Saudi Arabia', 'UAE', 'Egypt', 'Turkey', 'Russia', 'China',
];

const COMMON_ORGANIZATIONS = [
  'IRGC', 'IDF', 'Hamas', 'Hezbollah', 'Houthis', 'Mossad', 'CIA',
  'UN', 'NATO', 'CENTCOM', 'PMF', 'SDF', 'YPG',
];

export default function NewArticlePage() {
  const router = useRouter();

  // Form state
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [excerptEn, setExcerptEn] = useState('');
  const [excerptAr, setExcerptAr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [category, setCategory] = useState('Analysis');
  const [countries, setCountries] = useState<string[]>([]);
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'en' | 'ar'>('en');
  const [showPreview, setShowPreview] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showVideoPicker, setShowVideoPicker] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Check if there's any content to save
  const hasContent = titleEn || titleAr || excerptEn || excerptAr || contentEn || contentAr;

  const handleSubmit = async (status: 'draft' | 'published') => {
    setError(null);
    setIsSubmitting(true);
    setSaveStatus('saving');

    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_en: titleEn,
          title_ar: titleAr,
          excerpt_en: excerptEn,
          excerpt_ar: excerptAr,
          content_en: contentEn,
          content_ar: contentAr,
          category,
          countries,
          organizations,
          image_url: imageUrl || null,
          video_url: videoUrl || null,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create article');
      }

      setSaveStatus('saved');
      router.push('/admin/articles');
    } catch (err: any) {
      setError(err.message);
      setSaveStatus('idle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCountry = (country: string) => {
    setCountries(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const toggleOrganization = (org: string) => {
    setOrganizations(prev =>
      prev.includes(org)
        ? prev.filter(o => o !== org)
        : [...prev, org]
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-3 sm:space-y-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/articles"
              className="p-2 rounded-lg hover:bg-midnight-700 text-slate-medium hover:text-slate-light transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-slate-light">
              New Article
            </h1>
          </div>

          {/* Save Status Indicator - desktop */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-midnight-700/50 text-sm">
            {hasContent && saveStatus === 'idle' && (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-tactical-amber" />
                <span className="text-tactical-amber">Unsaved</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="h-3.5 w-3.5 text-slate-medium animate-spin" />
                <span className="text-slate-medium">Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="h-3.5 w-3.5 text-earth-olive" />
                <span className="text-earth-olive">Saved</span>
              </>
            )}
          </div>
        </div>

        {/* Action buttons - always visible, wraps on mobile */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 bg-midnight-700 border border-midnight-500 text-slate-light
                     px-3 sm:px-4 py-2 rounded-lg hover:border-tactical-amber hover:text-tactical-amber
                     transition-colors text-sm font-medium"
          >
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          <button
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting || !titleEn}
            className="flex items-center gap-2 bg-midnight-700 border border-midnight-500 text-slate-light
                     px-3 sm:px-4 py-2 rounded-lg hover:border-tactical-red hover:text-tactical-red
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save Draft</span>
            <span className="sm:hidden">Draft</span>
          </button>

          <button
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting || !titleEn || !contentEn}
            className="flex items-center gap-2 bg-tactical-red text-white font-heading font-bold uppercase tracking-wider
                     px-4 sm:px-5 py-2 rounded-lg hover:bg-tactical-red-hover
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm ml-auto"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
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
              <label className="block text-sm text-slate-medium mb-2">Title</label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Article title in English"
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
              <label className="block text-sm text-slate-medium mb-2">Content</label>
              <TipTapEditor
                content={contentEn}
                onChange={setContentEn}
                placeholder="Write your article content here..."
                dir="ltr"
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
              <label className="block text-sm text-slate-medium mb-2 text-right">العنوان</label>
              <input
                type="text"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="عنوان المقال بالعربية"
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
              <label className="block text-sm text-slate-medium mb-2 text-right">المحتوى</label>
              <TipTapEditor
                content={contentAr}
                onChange={setContentAr}
                placeholder="اكتب محتوى المقال هنا..."
                dir="rtl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metadata section */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-6 space-y-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
          Article Metadata
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Category */}
          <div>
            <label className="block text-sm text-slate-medium mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                       text-slate-light
                       focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
            >
              {Object.values(CATEGORIES).filter(c => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm text-slate-medium mb-2">
              <ImageIcon className="h-4 w-4 inline mr-1" />
              Featured Image
            </label>
            {imageUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-midnight-500 bg-midnight-700">
                <img src={imageUrl} alt="Featured" className="w-full h-32 object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowImagePicker(true)}
                className="w-full flex items-center justify-center gap-2 bg-midnight-700 border-2 border-dashed border-midnight-500
                         rounded-lg px-4 py-6 text-slate-medium hover:border-tactical-red hover:text-tactical-red
                         transition-colors cursor-pointer"
              >
                <Upload className="h-5 w-5" />
                <span className="text-sm">Upload or browse images</span>
              </button>
            )}
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste image URL here"
              className="w-full mt-2 bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-2
                       text-slate-light placeholder:text-slate-dark text-sm
                       focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm text-slate-medium mb-2">
              <Video className="h-4 w-4 inline mr-1" />
              Video (optional)
            </label>
            {videoUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-midnight-500 bg-midnight-700 px-4 py-3 flex items-center gap-3">
                <Video className="h-5 w-5 text-slate-medium flex-shrink-0" />
                <span className="text-sm text-slate-light truncate flex-1">{videoUrl}</span>
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="p-1 rounded-full hover:bg-midnight-600 text-slate-medium hover:text-white transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowVideoPicker(true)}
                className="w-full flex items-center justify-center gap-2 bg-midnight-700 border-2 border-dashed border-midnight-500
                         rounded-lg px-4 py-6 text-slate-medium hover:border-tactical-red hover:text-tactical-red
                         transition-colors cursor-pointer"
              >
                <Upload className="h-5 w-5" />
                <span className="text-sm">Upload or browse videos</span>
              </button>
            )}
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Or paste video URL here"
              className="w-full mt-2 bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-2
                       text-slate-light placeholder:text-slate-dark text-sm
                       focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
            />
          </div>
        </div>

        {/* Countries */}
        <div>
          <label className="block text-sm text-slate-medium mb-3">Countries</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_COUNTRIES.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => toggleCountry(country)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  countries.includes(country)
                    ? 'bg-tactical-red text-white'
                    : 'bg-midnight-700 text-slate-medium hover:bg-midnight-600 hover:text-slate-light'
                }`}
              >
                {country}
              </button>
            ))}
          </div>
          {countries.length > 0 && (
            <div className="mt-2 text-sm text-slate-dark">
              Selected: {countries.join(', ')}
            </div>
          )}
        </div>

        {/* Organizations */}
        <div>
          <label className="block text-sm text-slate-medium mb-3">Organizations</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_ORGANIZATIONS.map((org) => (
              <button
                key={org}
                type="button"
                onClick={() => toggleOrganization(org)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  organizations.includes(org)
                    ? 'bg-tactical-amber text-white'
                    : 'bg-midnight-700 text-slate-medium hover:bg-midnight-600 hover:text-slate-light'
                }`}
              >
                {org}
              </button>
            ))}
          </div>
          {organizations.length > 0 && (
            <div className="mt-2 text-sm text-slate-dark">
              Selected: {organizations.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <ArticlePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        article={{
          titleEn,
          titleAr,
          excerptEn,
          excerptAr,
          contentEn,
          contentAr,
          category,
          countries,
          imageUrl,
          videoUrl,
        }}
      />

      {/* Media Picker Modals */}
      <MediaPickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(url) => setImageUrl(url)}
        mediaType="image"
      />
      <MediaPickerModal
        isOpen={showVideoPicker}
        onClose={() => setShowVideoPicker(false)}
        onSelect={(url) => setVideoUrl(url)}
        mediaType="video"
      />
    </div>
  );
}
