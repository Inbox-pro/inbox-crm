import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'table-rows' | 'cards' | 'timeline';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 5,
  type = 'table-rows',
}) => {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl p-4 space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="py-4 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-2 flex-1 max-w-sm">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          </div>
          <div className="hidden sm:block h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
        </div>
      ))}
    </div>
  );
};
