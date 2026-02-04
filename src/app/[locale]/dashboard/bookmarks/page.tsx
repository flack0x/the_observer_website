import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, Bookmark, Trash2 } from "lucide-react";
import { getRelativeTime } from "@/lib/time";
import Image from "next/image";

export default async function BookmarksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select(`
      created_at,
      article:articles (
        id,
        telegram_id,
        slug,
        title,
        excerpt,
        category,
        image_url,
        telegram_date
      )
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-light flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-tactical-amber" />
            Saved Articles
          </h1>
          <p className="text-slate-medium mt-1">Your personal collection of saved intelligence.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {bookmarks && bookmarks.length > 0 ? (
          bookmarks.map((item: any) => (
            <div key={item.created_at} className="bg-midnight-800 rounded-xl border border-midnight-700 p-6 hover:border-tactical-red/50 transition-colors group">
              <Link href={`/${locale}/frontline/${item.article.slug}`} className="flex flex-col sm:flex-row gap-6">
                {/* Image */}
                <div className="relative w-full sm:w-48 aspect-video sm:aspect-[4/3] bg-midnight-700 rounded-lg overflow-hidden flex-shrink-0">
                  {item.article.image_url ? (
                    <Image
                      src={item.article.image_url}
                      alt={item.article.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-dark text-xs uppercase font-bold">
                      No Image
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2.5 py-1 rounded-full bg-tactical-red/10 text-tactical-red text-xs font-bold uppercase">
                      {item.article.category}
                    </span>
                    <span className="text-xs text-slate-dark">
                      Saved {getRelativeTime(new Date(item.created_at), locale as any)}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-light mb-2 group-hover:text-tactical-red transition-colors">
                    {item.article.title}
                  </h3>
                  
                  <p className="text-slate-medium text-sm line-clamp-2 mb-4">
                    {item.article.excerpt}
                  </p>

                  <div className="flex items-center text-sm font-medium text-tactical-red group-hover:text-tactical-red-hover">
                    Read Article <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-midnight-800 rounded-xl border border-midnight-700 border-dashed">
            <Bookmark className="h-12 w-12 text-slate-dark mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-light mb-2">No bookmarks yet</h3>
            <p className="text-slate-medium mb-6">Start saving articles to build your personal dossier.</p>
            <Link 
              href={`/${locale}/frontline`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-tactical-red text-white rounded-lg font-medium hover:bg-tactical-red-hover transition-colors"
            >
              Browse Articles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
