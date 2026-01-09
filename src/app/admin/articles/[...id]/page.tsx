'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Image as ImageIcon,
  Video,
  Trash2,
  ExternalLink,
  Monitor,
} from 'lucide-react';
import { TipTapEditor } from '@/components/admin/editor';
import { ArticlePreviewModal } from '@/components/admin/articles';
import { CATEGORIES } from '@/lib/categories';
import { ShowForAdmin } from '@/lib/auth';

const COMMON_COUNTRIES = [
  'Iran', 'Israel', 'USA', 'Palestine', 'Lebanon', 'Syria', 'Iraq',
  'Yemen', 'Saudi Arabia', 'UAE', 'Egypt', 'Turkey', 'Russia', 'China',
];

const COMMON_ORGANIZATIONS = [
  'IRGC', 'IDF', 'Hamas', 'Hezbollah', 'Houthis', 'Mossad', 'CIA',
  'UN', 'NATO', 'CENTCOM', 'PMF', 'SDF', 'YPG',
];

interface PageProps {
  params: Promise<{ id: string[] }>;
}

export default function EditArticlePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  // Join array segments back into a single ID (handles slashes in telegram_id)
  const decodedId = id.join('/');

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
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');

  // Original article data
  const [enArticle, setEnArticle] = useState<any>(null);
  const [arArticle, setArArticle] = useState<any>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Determine if this is a website article (bilingual) or Telegram article (single)
  const isWebsiteArticle = decodedId.startsWith('website/');

  // Load article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/admin/articles/${encodeURIComponent(decodedId)}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch article');
        }

        if (isWebsiteArticle) {
          // Bilingual article
          const enData = result.data.en;
          const arData = result.data.ar;

          setEnArticle(enData);
          setArArticle(arData);

          if (enData) {
            setTitleEn(enData.title || '');
            setExcerptEn(enData.excerpt || '');
            setContentEn(enData.content || '');
            setCategory(enData.category || 'Analysis');
            setCountries(enData.countries || []);
            setOrganizations(enData.organizations || []);
            setImageUrl(enData.image_url || '');
            setVideoUrl(enData.video_url || '');
            setStatus(enData.status || 'draft');
          }

          if (arData) {
            setTitleAr(arData.title || '');
            setExcerptAr(arData.excerpt || '');
            setContentAr(arData.content || '');
          }
        } else {
          // Single Telegram article
          const article = result.data;
          if (article.channel === 'en') {
            setEnArticle(article);
            setTitleEn(article.title || '');
            setExcerptEn(article.excerpt || '');
            setContentEn(article.content || '');
          } else {
            setArArticle(article);
            setTitleAr(article.title || '');
            setExcerptAr(article.excerpt || '');
            setContentAr(article.content || '');
          }
          setCategory(article.category || 'Analysis');
          setCountries(article.countries || []);
          setOrganizations(article.organizations || []);
          setImageUrl(article.image_url || '');
          setVideoUrl(article.video_url || '');
          setStatus(article.status || 'published');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [decodedId, isWebsiteArticle]);

  const handleSave = async (newStatus?: 'draft' | 'published' | 'archived') => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Update English article
      if (enArticle) {
        const enResponse = await fetch(`/api/admin/articles/${encodeURIComponent(enArticle.telegram_id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: titleEn,
            excerpt: excerptEn,
            content: contentEn,
            category,
            countries,
            organizations,
            image_url: imageUrl || null,
            video_url: videoUrl || null,
            status: newStatus || status,
          }),
        });

        if (!enResponse.ok) {
          const data = await enResponse.json();
          throw new Error(data.error || 'Failed to update English article');
        }
      }

      // Update Arabic article
      if (arArticle) {
        const arResponse = await fetch(`/api/admin/articles/${encodeURIComponent(arArticle.telegram_id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: titleAr,
            excerpt: excerptAr,
            content: contentAr,
            category,
            countries,
            organizations,
            image_url: imageUrl || null,
            video_url: videoUrl || null,
            status: newStatus || status,
          }),
        });

        if (!arResponse.ok) {
          const data = await arResponse.json();
          throw new Error(data.error || 'Failed to update Arabic article');
        }
      }

      if (newStatus) {
        setStatus(newStatus);
      }

      // Show success and stay on page
      alert('Article saved successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/articles/${encodeURIComponent(decodedId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete article');
      }

      router.push('/admin/articles');
    } catch (err: any) {
      setError(err.message);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-tactical-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/articles"
            className="p-2 rounded-lg hover:bg-midnight-700 text-slate-medium hover:text-slate-light transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-slate-light">
              Edit Article
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                status === 'published' ? 'bg-earth-olive/10 text-earth-olive' :
                status === 'draft' ? 'bg-tactical-amber/10 text-tactical-amber' :
                'bg-slate-dark/10 text-slate-dark'
              }`}>
                {status}
              </span>
              {enArticle && (
                <Link
                  href={`/en/frontline/${enArticle.telegram_id}`}
                  target="_blank"
                  className="text-xs text-slate-dark hover:text-tactical-red flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on site
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ShowForAdmin>
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400
                       px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </ShowForAdmin>

          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 bg-midnight-700 border border-midnight-500 text-slate-light
                     px-4 py-2 rounded-lg hover:border-tactical-amber hover:text-tactical-amber
                     transition-colors text-sm font-medium"
          >
            <Monitor className="h-4 w-4" />
            Preview
          </button>

          <button
            onClick={() => handleSave()}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-midnight-700 border border-midnight-500 text-slate-light
                     px-4 py-2 rounded-lg hover:border-tactical-red hover:text-tactical-red
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <Save className="h-4 w-4" />
            Save
          </button>

          {status !== 'published' && (
            <button
              onClick={() => handleSave('published')}
              disabled={isSubmitting}
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
          )}
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
        {(enArticle || isWebsiteArticle) && (
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
                  placeholder="Brief summary"
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
        )}

        {/* Arabic editor */}
        {(arArticle || isWebsiteArticle) && (
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
                  placeholder="ملخص موجز"
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
        )}
      </div>

      {/* Metadata section */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-6 space-y-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light">
          Article Metadata
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* Status */}
          <div>
            <label className="block text-sm text-slate-medium mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                       text-slate-light
                       focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm text-slate-medium mb-2">
              <ImageIcon className="h-4 w-4 inline mr-1" />
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                       text-slate-light placeholder:text-slate-dark
                       focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm text-slate-medium mb-2">
              <Video className="h-4 w-4 inline mr-1" />
              Video URL
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                       text-slate-light placeholder:text-slate-dark
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
                    : 'bg-midnight-700 text-slate-medium hover:bg-midnight-600'
                }`}
              >
                {country}
              </button>
            ))}
          </div>
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
                    : 'bg-midnight-700 text-slate-medium hover:bg-midnight-600'
                }`}
              >
                {org}
              </button>
            ))}
          </div>
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
    </div>
  );
}
