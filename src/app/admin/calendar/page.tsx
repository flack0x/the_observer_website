'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Loader2,
  Eye,
  Edit2,
} from 'lucide-react';

interface Article {
  id: number;
  telegram_id: string;
  channel: 'en' | 'ar';
  title: string;
  category: string;
  status: string;
  telegram_date: string;
  scheduled_at: string | null;
}

interface ArticlesResponse {
  data: Article[];
  total: number;
}

const fetchArticles = async (url: string): Promise<ArticlesResponse> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch articles');
  return response.json();
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get first and last day of month for API query
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch all articles (we'll filter client-side for the calendar view)
  const { data, isLoading } = useSWR<ArticlesResponse>(
    `/api/admin/articles?pageSize=500`,
    fetchArticles,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const articles = data?.data || [];

  // Group articles by date
  const articlesByDate = useMemo(() => {
    const grouped: Record<string, Article[]> = {};
    const articleList = data?.data || [];

    articleList.forEach(article => {
      // Use scheduled_at if it exists and article is draft, otherwise use telegram_date
      const dateStr = article.status === 'draft' && article.scheduled_at
        ? article.scheduled_at.split('T')[0]
        : article.telegram_date.split('T')[0];

      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(article);
    });

    return grouped;
  }, [data?.data]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [year, month]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const getArticlesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return articlesByDate[dateStr] || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-earth-olive';
      case 'draft':
        return 'bg-tactical-amber';
      default:
        return 'bg-slate-dark';
    }
  };

  const selectedDateArticles = selectedDate ? getArticlesForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-slate-light">
            Content Calendar
          </h1>
          <p className="text-slate-medium mt-1">
            Visual overview of published and scheduled articles
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 bg-tactical-red text-white font-heading font-bold uppercase tracking-wider
                   px-4 py-2.5 rounded-lg hover:bg-tactical-red-hover transition-colors text-sm w-fit"
        >
          <Plus className="h-4 w-4" />
          New Article
        </Link>
      </div>

      {/* Calendar navigation */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-midnight-700 text-slate-medium transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="font-heading text-xl font-bold text-slate-light">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-midnight-700 text-slate-medium transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="flex items-center gap-2 px-3 py-1.5 bg-midnight-700 text-slate-medium rounded-lg hover:bg-midnight-600 transition-colors text-sm"
          >
            <CalendarIcon className="h-4 w-4" />
            Today
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-tactical-red" />
          </div>
        ) : (
          <>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-midnight-700 rounded-lg overflow-hidden">
              {/* Day headers */}
              {DAYS.map(day => (
                <div
                  key={day}
                  className="bg-midnight-800 py-2 text-center text-xs font-heading uppercase tracking-wider text-slate-dark"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <div key={`empty-${index}`} className="bg-midnight-900/50 min-h-[100px]" />
                  );
                }

                const dayArticles = getArticlesForDate(date);
                const publishedCount = dayArticles.filter(a => a.status === 'published').length;
                const draftCount = dayArticles.filter(a => a.status === 'draft').length;

                return (
                  <motion.button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`bg-midnight-800 min-h-[100px] p-2 text-left transition-colors relative
                      ${isToday(date) ? 'ring-2 ring-tactical-red ring-inset' : ''}
                      ${isSelected(date) ? 'bg-midnight-700' : 'hover:bg-midnight-700/50'}
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className={`text-sm font-medium ${
                      isToday(date) ? 'text-tactical-red' : 'text-slate-medium'
                    }`}>
                      {date.getDate()}
                    </span>

                    {dayArticles.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {/* Show up to 3 article indicators */}
                        {dayArticles.slice(0, 3).map(article => (
                          <div
                            key={article.telegram_id}
                            className={`text-xs px-1.5 py-0.5 rounded truncate ${
                              article.status === 'published'
                                ? 'bg-earth-olive/20 text-earth-olive'
                                : 'bg-tactical-amber/20 text-tactical-amber'
                            }`}
                            title={article.title}
                          >
                            {article.title.slice(0, 15)}...
                          </div>
                        ))}
                        {dayArticles.length > 3 && (
                          <div className="text-xs text-slate-dark">
                            +{dayArticles.length - 3} more
                          </div>
                        )}
                      </div>
                    )}

                    {/* Count badges */}
                    {dayArticles.length > 0 && (
                      <div className="absolute top-1 right-1 flex gap-1">
                        {publishedCount > 0 && (
                          <span className="w-5 h-5 bg-earth-olive/20 text-earth-olive text-xs rounded-full flex items-center justify-center">
                            {publishedCount}
                          </span>
                        )}
                        {draftCount > 0 && (
                          <span className="w-5 h-5 bg-tactical-amber/20 text-tactical-amber text-xs rounded-full flex items-center justify-center">
                            {draftCount}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 text-xs text-slate-dark">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-earth-olive" />
                Published
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-tactical-amber" />
                Draft / Scheduled
              </div>
            </div>
          </>
        )}
      </div>

      {/* Selected date details */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-midnight-800 rounded-xl border border-midnight-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-slate-light">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <span className="text-sm text-slate-dark">
              {selectedDateArticles.length} article{selectedDateArticles.length !== 1 ? 's' : ''}
            </span>
          </div>

          {selectedDateArticles.length === 0 ? (
            <p className="text-slate-dark text-sm">No articles on this date</p>
          ) : (
            <div className="space-y-3">
              {selectedDateArticles.map(article => (
                <div
                  key={article.telegram_id}
                  className="flex items-center justify-between p-3 bg-midnight-700/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        article.status === 'published'
                          ? 'bg-earth-olive/10 text-earth-olive'
                          : 'bg-tactical-amber/10 text-tactical-amber'
                      }`}>
                        {article.status}
                      </span>
                      <span className="text-xs uppercase text-slate-dark">
                        {article.channel}
                      </span>
                      <span className="text-xs text-slate-dark">
                        {article.category}
                      </span>
                    </div>
                    <p className="text-slate-light font-medium mt-1 truncate">
                      {article.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/${article.channel}/frontline/${article.telegram_id}`}
                      target="_blank"
                      className="p-2 rounded-lg hover:bg-midnight-600 text-slate-dark hover:text-slate-medium transition-colors"
                      title="View on site"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/articles/${article.telegram_id}`}
                      className="p-2 rounded-lg hover:bg-midnight-600 text-slate-dark hover:text-slate-medium transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
