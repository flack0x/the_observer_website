import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, Bookmark, ThumbsUp, History } from "lucide-react";
import { getRelativeTime } from "@/lib/time";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch stats
  const { count: bookmarksCount } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id);

  const { count: likesCount } = await supabase
    .from('article_interactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .eq('interaction_type', 'like');

  // Fetch recent bookmarks
  const { data: recentBookmarks } = await supabase
    .from('bookmarks')
    .select(`
      created_at,
      article:articles (
        id,
        telegram_id,
        slug,
        title,
        category
      )
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-light mb-2">Welcome back, {user?.user_metadata?.full_name}</h1>
        <p className="text-slate-medium">Here's an overview of your intelligence briefing.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-midnight-800 p-6 rounded-xl border border-midnight-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-tactical-amber/10 rounded-lg text-tactical-amber">
              <Bookmark className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-medium">Saved Articles</p>
              <p className="text-2xl font-bold text-slate-light">{bookmarksCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-midnight-800 p-6 rounded-xl border border-midnight-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-earth-olive/10 rounded-lg text-earth-olive">
              <ThumbsUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-medium">Liked Articles</p>
              <p className="text-2xl font-bold text-slate-light">{likesCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 overflow-hidden">
        <div className="p-6 border-b border-midnight-700 flex justify-between items-center">
          <h2 className="font-bold text-slate-light">Recent Bookmarks</h2>
          <Link href={`/${locale}/dashboard/bookmarks`} className="text-sm text-tactical-red hover:text-tactical-red-hover flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-midnight-700">
          {recentBookmarks && recentBookmarks.length > 0 ? (
            recentBookmarks.map((item: any) => (
              <div key={item.created_at} className="p-6 hover:bg-midnight-700/50 transition-colors">
                <Link href={`/${locale}/frontline/${item.article.slug}`} className="block group">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="inline-block px-2 py-1 mb-2 text-xs font-medium uppercase tracking-wider rounded bg-midnight-700 text-slate-medium">
                        {item.article.category}
                      </span>
                      <h3 className="font-bold text-slate-light group-hover:text-tactical-red transition-colors">
                        {item.article.title}
                      </h3>
                      <p className="text-sm text-slate-dark mt-2">
                        Saved {getRelativeTime(new Date(item.created_at), locale as any)}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-dark group-hover:text-tactical-red opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-medium">
              No saved articles yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
