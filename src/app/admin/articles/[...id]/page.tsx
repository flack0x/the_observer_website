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
  Plus,
  X,
  MapPin,
  Building2,
  Tag,
  FileText,
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

  // Custom input state
  const [customCountry, setCustomCountry] = useState('');
  const [customOrganization, setCustomOrganization] = useState('');

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

  const addCustomCountry = () => {
    const trimmed = customCountry.trim();
    if (trimmed && !countries.includes(trimmed)) {
      setCountries(prev => [...prev, trimmed]);
      setCustomCountry('');
    }
  };

  const removeCountry = (country: string) => {
    setCountries(prev => prev.filter(c => c !== country));
  };

  const toggleOrganization = (org: string) => {
    setOrganizations(prev =>
      prev.includes(org)
        ? prev.filter(o => o !== org)
        : [...prev, org]
    );
  };

  const addCustomOrganization = () => {
    const trimmed = customOrganization.trim();
    if (trimmed && !organizations.includes(trimmed)) {
      setOrganizations(prev => [...prev, trimmed]);
      setCustomOrganization('');
    }
  };

  const removeOrganization = (org: string) => {
    setOrganizations(prev => prev.filter(o => o !== org));
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
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-midnight-700/30 border-b border-midnight-700">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light flex items-center gap-2">
            <FileText className="h-4 w-4 text-tactical-red" />
            Article Metadata
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-medium mb-2 uppercase tracking-wider">
                <Tag className="h-3.5 w-3.5" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-midnight-700 border border-midnight-600 rounded-lg px-3 py-2.5
                         text-slate-light text-sm
                         focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none
                         transition-colors"
              >
                {Object.values(CATEGORIES).filter(c => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-medium mb-2 uppercase tracking-wider">
                <Eye className="h-3.5 w-3.5" />
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-midnight-700 border border-midnight-600 rounded-lg px-3 py-2.5
                         text-slate-light text-sm
                         focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none
                         transition-colors"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Featured Image */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-medium mb-2 uppercase tracking-wider">
                <ImageIcon className="h-3.5 w-3.5" />
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-midnight-700 border border-midnight-600 rounded-lg px-3 py-2.5
                         text-slate-light placeholder:text-slate-dark text-sm
                         focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none
                         transition-colors"
              />
            </div>

            {/* Video URL */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-medium mb-2 uppercase tracking-wider">
                <Video className="h-3.5 w-3.5" />
                Video URL
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-midnight-700 border border-midnight-600 rounded-lg px-3 py-2.5
                         text-slate-light placeholder:text-slate-dark text-sm
                         focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none
                         transition-colors"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-midnight-700" />

          {/* Countries Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-medium uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5 text-tactical-red" />
                Countries
                {countries.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-tactical-red/20 text-tactical-red text-xs">
                    {countries.length}
                  </span>
                )}
              </label>
            </div>

            {/* Selected Countries */}
            {countries.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-midnight-700/30 rounded-lg border border-midnight-600">
                {countries.map((country) => (
                  <span
                    key={country}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tactical-red text-white text-xs font-medium"
                  >
                    {country}
                    <button
                      type="button"
                      onClick={() => removeCountry(country)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick Select */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_COUNTRIES.map((country) => (
                <button
                  key={country}
                  type="button"
                  onClick={() => toggleCountry(country)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                    countries.includes(country)
                      ? 'bg-tactical-red/20 text-tactical-red border border-tactical-red/30'
                      : 'bg-midnight-700 text-slate-medium hover:bg-midnight-600 hover:text-slate-light border border-transparent'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>

            {/* Add Custom Country */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customCountry}
                onChange={(e) => setCustomCountry(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCountry())}
                placeholder="Add custom country..."
                className="flex-1 bg-midnight-700 border border-midnight-600 rounded-lg px-3 py-2
                         text-slate-light placeholder:text-slate-dark text-sm
                         focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none
                         transition-colors"
              />
              <button
                type="button"
                onClick={addCustomCountry}
                disabled={!customCountry.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-midnight-700 border border-midnight-600
                         text-slate-medium hover:text-slate-light hover:border-tactical-red
                         disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-midnight-700" />

          {/* Organizations Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-medium uppercase tracking-wider">
                <Building2 className="h-3.5 w-3.5 text-tactical-amber" />
                Organizations
                {organizations.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-tactical-amber/20 text-tactical-amber text-xs">
                    {organizations.length}
                  </span>
                )}
              </label>
            </div>

            {/* Selected Organizations */}
            {organizations.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-midnight-700/30 rounded-lg border border-midnight-600">
                {organizations.map((org) => (
                  <span
                    key={org}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tactical-amber text-white text-xs font-medium"
                  >
                    {org}
                    <button
                      type="button"
                      onClick={() => removeOrganization(org)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick Select */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_ORGANIZATIONS.map((org) => (
                <button
                  key={org}
                  type="button"
                  onClick={() => toggleOrganization(org)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                    organizations.includes(org)
                      ? 'bg-tactical-amber/20 text-tactical-amber border border-tactical-amber/30'
                      : 'bg-midnight-700 text-slate-medium hover:bg-midnight-600 hover:text-slate-light border border-transparent'
                  }`}
                >
                  {org}
                </button>
              ))}
            </div>

            {/* Add Custom Organization */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customOrganization}
                onChange={(e) => setCustomOrganization(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomOrganization())}
                placeholder="Add custom organization..."
                className="flex-1 bg-midnight-700 border border-midnight-600 rounded-lg px-3 py-2
                         text-slate-light placeholder:text-slate-dark text-sm
                         focus:border-tactical-amber focus:ring-1 focus:ring-tactical-amber focus:outline-none
                         transition-colors"
              />
              <button
                type="button"
                onClick={addCustomOrganization}
                disabled={!customOrganization.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-midnight-700 border border-midnight-600
                         text-slate-medium hover:text-slate-light hover:border-tactical-amber
                         disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
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
