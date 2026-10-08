import React from 'react';
import { TaskPriority } from '../../types';
import { AlertTriangle, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const { tPriority } = useLanguage();

  const getBadgeConfig = () => {
    switch (priority) {
      case 'Urgent':
        return {
          icon: AlertCircle,
          classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        };
      case 'High':
        return {
          icon: ArrowUp,
          classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        };
      case 'Medium':
        return {
          icon: AlertTriangle,
          classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
        };
      case 'Low':
      default:
        return {
          icon: ArrowDown,
          classes: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        };
    }
  };

  const { icon: Icon, classes } = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border whitespace-nowrap ${classes}`}
    >
      <Icon className="w-3 h-3" />
      {tPriority(priority)}
    </span>
  );
};
