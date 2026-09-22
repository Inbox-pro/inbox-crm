import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  id?: string;
  title: string;
  value: string | number;
  change?: number;
  changePeriod?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  subtitle?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  id,
  title,
  value,
  change,
  changePeriod = 'vs last month',
  icon: Icon,
  iconColor = 'text-blue-600 dark:text-blue-400',
  iconBg = 'bg-blue-50 dark:bg-blue-950/50',
  subtitle,
  onClick,
}) => {
  const isPositive = change !== undefined ? change >= 0 : true;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
      </div>

      {(change !== undefined || subtitle) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          {change !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change)}%
            </span>
          )}
          <span className="text-slate-500 dark:text-slate-400 truncate">
            {subtitle || changePeriod}
          </span>
        </div>
      )}
    </div>
  );
};
