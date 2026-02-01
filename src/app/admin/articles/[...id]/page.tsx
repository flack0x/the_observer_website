'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
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
  Settings2,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TipTapEditor } from '@/components/admin/editor';
import { ArticlePreviewModal } from '@/components/admin/articles';
import { CATEGORIES } from '@/lib/categories';
import { ShowForAdmin } from '@/lib/auth';
import { normalizeContent } from '@/lib/content';

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
  const [customCountry, setCustomCountry] = useState('');
  const [customOrganization, setCustomOrganization] = useState('');

  // Collapsible sections for mobile
  const [showCountries, setShowCountries] = useState(true);
  const [showOrganizations, setShowOrganizations] = useState(true);

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
          const enData = result.data.en;
          const arData = result.data.ar;
          setEnArticle(enData);
          setArArticle(arData);

          if (enData) {
            setTitleEn(enData.title || '');
            setExcerptEn(enData.excerpt || '');
            setContentEn(normalizeContent(enData.content || ''));
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
            setContentAr(normalizeContent(arData.content || ''));
          }
        } else {
          const article = result.data;
          if (article.channel === 'en') {
            setEnArticle(article);
            setTitleEn(article.title || '');
            setExcerptEn(article.excerpt || '');
            setContentEn(normalizeContent(article.content || ''));
          } else {
            setArArticle(article);
            setTitleAr(article.title || '');
            setExcerptAr(article.excerpt || '');
            setContentAr(normalizeContent(article.content || ''));
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
    <div className="min-h-screen">
      {/* Fixed Header */}
      <div className="sticky top-0 z-20 bg-midnight-900/95 backdrop-blur-sm border-b border-midnight-700 -mx-6 px-6 py-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/articles"
              className="p-2 rounded-lg hover:bg-midnight-700 text-slate-medium hover:text-slate-light transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-heading text-xl font-bold uppercase tracking-wider text-slate-light">
                Edit Article
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  status === 'published' ? 'bg-earth-olive/20 text-earth-olive' :
                  status === 'draft' ? 'bg-tactical-amber/20 text-tactical-amber' :
                  'bg-slate-dark/20 text-slate-dark'
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
                    View live
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShowForAdmin>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400
                         hover:bg-red-500/20 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </ShowForAdmin>

            <button
              onClick={() => setShowPreview(true)}
              className="p-2 rounded-lg bg-midnight-700 border border-midnight-600 text-slate-light
                       hover:border-tactical-amber hover:text-tactical-amber transition-colors"
              title="Preview"
            >
              <Monitor className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleSave()}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-midnight-700 border border-midnight-600
                       text-slate-light hover:border-tactical-red hover:text-tactical-red
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span className="hidden sm:inline">Save</span>
            </button>

            {status !== 'published' && (
              <button
                onClick={() => handleSave('published')}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-tactical-red text-white font-heading font-bold uppercase tracking-wider
                         px-4 py-2 rounded-lg hover:bg-tactical-red-hover
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Publish
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* Main Layout: Content + Sidebar */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left: Content Editor */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* English Editor */}
          {(enArticle || isWebsiteArticle) && (
            <div className="bg-midnight-800 rounded-xl border border-midnight-700 overflow-hidden">
              <div className="px-4 py-3 bg-midnight-700/30 border-b border-midnight-700 flex items-center justify-between">
                <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-400" />
                  English
                </h2>
                <span className="text-xs text-slate-dark bg-midnight-700 px-2 py-0.5 rounded">LTR</span>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-medium mb-1.5 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="Article title..."
                    className="w-full bg-midnight-700 border border-midnight-600 rounded-lg px-3 py-2.5
                             text-slate-light placeholder:text-slate-dark
                             focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-medium mb-1.5 uppercase tracking-wider">Excerpt</label>
                  <textarea
                    value={excerptEn}
                    onChange={(e) => setExcerptEn(e.target.value)}
                    placeholder="Brief summary..."
                    rows={2}
                    className="w-full bg-midnight-700 border border-midnight-600 rounded-lg px-3 py-2.5
                             text-slate-light placeholder:text-slate-dark resize-none
                             focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-medium mb-1.5 uppercase tracking-wider">Content</label>
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

          {/* Arabic Editor */}
          {(arArticle || isWebsiteArticle) && (
            <div className="bg-midnight-800 rounded-xl border border-midnight-700 overflow-hidden">
              <div className="px-4 py-3 bg-midnight-700/30 border-b border-midnight-700 flex items-center justify-between">
                <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-light flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-400" />
                  العربية (Arabic)
                </h2>
                <span className="text-xs text-slate-dark bg-midnight-700 px-2 py-0.5 rounded">RTL</span>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-medium mb-1.5 uppercase tracking-wider text-right">العنوان</label>
                  <input
                    type="text"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="عنوان المقال..."
                    dir="rtl"
                    className="w-full bg-midnight-700 border border-midnight-600 rounded-lg px-3 py-2.5
                             text-slate-light placeholder:text-slate-dark text-right
                             focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-medium mb-1.5 uppercase tracking-wider text-right">المقتطف</label>
                  <textarea
                    value={excerptAr}
                    onChange={(e) => setExcerptAr(e.target.value)}
                    placeholder="ملخص موجز..."
                    rows={2}
                    dir="rtl"
                    className="w-full bg-midnight-700 border border-midnight-600 rounded-lg px-3 py-2.5
                             text-slate-light placeholder:text-slate-dark resize-none text-right
                             focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-medium mb-1.5 uppercase tracking-wider text-right">المحتوى</label>
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

        {/* Right: Sticky Sidebar */}
        <div className="xl:w-80 xl:flex-shrink-0">
          <div className="xl:sticky xl:top-24 space-y-4">
            {/* Settings Card */}
            <div className="bg-midnight-800 rounded-xl border border-midnight-700 overflow-hidden">
              <div className="px-4 py-3 bg-midnight-700/30 border-b border-midnight-700">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-light flex items-center gap-2">
                  <Settings2 className="h-3.5 w-3.5 text-tactical-red" />
                  Settings
                </h3>
              </div>

              <div className="p-4 space-y-4">
                {/* Category */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-medium mb-1.5 uppercase tracking-wider">
                    <Tag className="h-3 w-3" />
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-midnight-700 border border-midnight-600 rounded-lg px-3 py-2
                             text-slate-light text-sm
                             focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
                  >
                    {Object.values(CATEGORIES).filter(c => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-medium mb-1.5 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-midnight-700 border border-midnight-600 rounded-lg px-3 py-2
                             text-slate-light text-sm
                             focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Media Card */}
            <div className="bg-midnight-800 rounded-xl border border-midnight-700 overflow-hidden">
              <div className="px-4 py-3 bg-midnight-700/30 border-b border-midnight-700">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-light flex items-center gap-2">
                  <ImageIcon className="h-3.5 w-3.5 text-tactical-red" />
                  Media
                </h3>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-medium mb-1.5 uppercase tracking-wider">
                    <ImageIcon className="h-3 w-3" />
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-midnight-700 border border-midnight-600 rounded-lg px-3 py-2
                             text-slate-light placeholder:text-slate-dark text-sm
                             focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-medium mb-1.5 uppercase tracking-wider">
                    <Video className="h-3 w-3" />
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-midnight-700 border border-midnight-600 rounded-lg px-3 py-2
                             text-slate-light placeholder:text-slate-dark text-sm
                             focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
                  />
                </div>

                {/* Image Preview */}
                {imageUrl && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-midnight-700">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Countries Card */}
            <div className="bg-midnight-800 rounded-xl border border-midnight-700 overflow-hidden">
              <button
                onClick={() => setShowCountries(!showCountries)}
                className="w-full px-4 py-3 bg-midnight-700/30 border-b border-midnight-700 flex items-center justify-between hover:bg-midnight-700/50 transition-colors"
              >
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-light flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-tactical-red" />
                  Countries
                  {countries.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-tactical-red/20 text-tactical-red text-xs">
                      {countries.length}
                    </span>
                  )}
                </h3>
                {showCountries ? <ChevronUp className="h-4 w-4 text-slate-dark" /> : <ChevronDown className="h-4 w-4 text-slate-dark" />}
              </button>

              {showCountries && (
                <div className="p-4 space-y-3">
                  {/* Selected */}
                  {countries.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {countries.map((country) => (
                        <span
                          key={country}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tactical-red text-white text-xs"
                        >
                          {country}
                          <button
                            type="button"
                            onClick={() => removeCountry(country)}
                            className="hover:bg-white/20 rounded-full transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick Select */}
                  <div className="flex flex-wrap gap-1">
                    {COMMON_COUNTRIES.map((country) => (
                      <button
                        key={country}
                        type="button"
                        onClick={() => toggleCountry(country)}
                        className={`px-2 py-0.5 rounded text-xs transition-all ${
                          countries.includes(country)
                            ? 'bg-tactical-red/20 text-tactical-red'
                            : 'bg-midnight-700 text-slate-medium hover:bg-midnight-600 hover:text-slate-light'
                        }`}
                      >
                        {country}
                      </button>
                    ))}
                  </div>

                  {/* Custom Input */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={customCountry}
                      onChange={(e) => setCustomCountry(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCountry())}
                      placeholder="Add custom..."
                      className="flex-1 bg-midnight-700 border border-midnight-600 rounded px-2 py-1.5
                               text-slate-light placeholder:text-slate-dark text-xs
                               focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomCountry}
                      disabled={!customCountry.trim()}
                      className="p-1.5 rounded bg-midnight-700 border border-midnight-600
                               text-slate-medium hover:text-slate-light hover:border-tactical-red
                               disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Organizations Card */}
            <div className="bg-midnight-800 rounded-xl border border-midnight-700 overflow-hidden">
              <button
                onClick={() => setShowOrganizations(!showOrganizations)}
                className="w-full px-4 py-3 bg-midnight-700/30 border-b border-midnight-700 flex items-center justify-between hover:bg-midnight-700/50 transition-colors"
              >
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-light flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-tactical-amber" />
                  Organizations
                  {organizations.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-tactical-amber/20 text-tactical-amber text-xs">
                      {organizations.length}
                    </span>
                  )}
                </h3>
                {showOrganizations ? <ChevronUp className="h-4 w-4 text-slate-dark" /> : <ChevronDown className="h-4 w-4 text-slate-dark" />}
              </button>

              {showOrganizations && (
                <div className="p-4 space-y-3">
                  {/* Selected */}
                  {organizations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {organizations.map((org) => (
                        <span
                          key={org}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tactical-amber text-white text-xs"
                        >
                          {org}
                          <button
                            type="button"
                            onClick={() => removeOrganization(org)}
                            className="hover:bg-white/20 rounded-full transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick Select */}
                  <div className="flex flex-wrap gap-1">
                    {COMMON_ORGANIZATIONS.map((org) => (
                      <button
                        key={org}
                        type="button"
                        onClick={() => toggleOrganization(org)}
                        className={`px-2 py-0.5 rounded text-xs transition-all ${
                          organizations.includes(org)
                            ? 'bg-tactical-amber/20 text-tactical-amber'
                            : 'bg-midnight-700 text-slate-medium hover:bg-midnight-600 hover:text-slate-light'
                        }`}
                      >
                        {org}
                      </button>
                    ))}
                  </div>

                  {/* Custom Input */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={customOrganization}
                      onChange={(e) => setCustomOrganization(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomOrganization())}
                      placeholder="Add custom..."
                      className="flex-1 bg-midnight-700 border border-midnight-600 rounded px-2 py-1.5
                               text-slate-light placeholder:text-slate-dark text-xs
                               focus:border-tactical-amber focus:ring-1 focus:ring-tactical-amber focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomOrganization}
                      disabled={!customOrganization.trim()}
                      className="p-1.5 rounded bg-midnight-700 border border-midnight-600
                               text-slate-medium hover:text-slate-light hover:border-tactical-amber
                               disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
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
