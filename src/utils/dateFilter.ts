/**
 * Date range filtering utility for Inbox CRM.
 * Standardizes timeframes (Today, 7 Days, 30 Days, 90 Days, This Year, All Time)
 * across all pages: Dashboard, Reports, Leads, Deals, Tasks, Activities, Contacts, Companies.
 */

export type StandardDateRange = 'All' | 'Today' | '7 Days' | '30 Days' | '90 Days' | 'This Year';

export type TaskDateRange = 'All' | 'Today' | 'Next 7 Days' | 'Next 30 Days' | 'Overdue';

export function parseDateToLocal(dateInput: string | Date | undefined): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // Match YYYY-MM-DD format exactly to construct in local midday, avoiding timezone day shift
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      return new Date(year, month, day, 12, 0, 0);
    }
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function isDateInRange(dateInput: string | Date | undefined, range: string): boolean {
  if (!range || range === 'All' || range === 'All Time' || range === 'All Dates' || range === 'All Timeline') {
    return true;
  }
  if (!dateInput) return true; // Keep items with unspecified dates visible

  const date = parseDateToLocal(dateInput);
  if (!date) return true;

  const now = new Date();
  const time = date.getTime();
  const msDay = 24 * 60 * 60 * 1000;

  // Local calendar midnight boundaries for today
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

  switch (range) {
    case 'Today':
    case 'Due Today':
    case 'Added Today':
    case 'Created Today':
      // Matches today or recent same-day activity
      return (time >= startOfToday && time <= endOfToday) || (time <= endOfToday && time >= startOfToday - 12 * 3600 * 1000);

    case '7 Days':
    case 'Last 7 Days':
      // Accommodates both created/activity in past 7 days AND tasks/deals due in next 7 days
      return time >= startOfToday - 7 * msDay && time <= endOfToday + 7 * msDay;

    case 'Next 7 Days':
      return time >= startOfToday && time <= endOfToday + 7 * msDay;

    case '30 Days':
    case 'Last 30 Days':
      // Accommodates created in past 30 days and upcoming in next 30 days
      return time >= startOfToday - 30 * msDay && time <= endOfToday + 30 * msDay;

    case 'Next 30 Days':
      return time >= startOfToday && time <= endOfToday + 30 * msDay;

    case '90 Days':
    case 'Last 90 Days':
      return time >= startOfToday - 90 * msDay && time <= endOfToday + 90 * msDay;

    case 'This Year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0).getTime();
      return time >= startOfYear;
    }

    case 'Overdue':
      return time < startOfToday;

    default:
      return true;
  }
}

/**
 * Format relative date for human-friendly display
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay === 0) {
      if (diffHour === 0) {
        if (diffMin <= 1) return 'Just now';
        return `${diffMin}m ago`;
      }
      return `${diffHour}h ago`;
    }
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
}
