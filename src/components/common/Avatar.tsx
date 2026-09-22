import React from 'react';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, imageUrl, size = 'md', className = '' }) => {
  const getInitials = (n: string) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  }[size];

  // Stable color hash for initials background
  const colors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
    'bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-200',
    'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
    'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200',
  ];

  const charCodeSum = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorClass = colors[charCodeSum % colors.length];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-800 ${sizeClasses} ${className}`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          // fallback to initials on broken image
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold shrink-0 select-none border border-slate-200 dark:border-slate-800 ${sizeClasses} ${colorClass} ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};
