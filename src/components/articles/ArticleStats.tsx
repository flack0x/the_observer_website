'use client';

import { Eye, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ArticleStatsProps {
  views: number;
  likes: number;
  dislikes: number;
  className?: string;
}

export default function ArticleStats({ views, likes, dislikes, className = '' }: ArticleStatsProps) {
  // Format large numbers (e.g. 1.2k)
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className={`flex items-center gap-4 text-xs text-slate-medium ${className}`}>
      <div className="flex items-center gap-1.5" title={`${views} views`}>
        <Eye className="h-3 w-3" />
        <span>{formatNumber(views)}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1" title={`${likes} likes`}>
          <ThumbsUp className="h-3 w-3" />
          <span>{formatNumber(likes)}</span>
        </div>
        <div className="flex items-center gap-1" title={`${dislikes} dislikes`}>
          <ThumbsDown className="h-3 w-3" />
          <span>{formatNumber(dislikes)}</span>
        </div>
      </div>
    </div>
  );
}
