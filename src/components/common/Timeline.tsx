import React, { useState } from 'react';
import { Activity, ActivityType } from '../../types';
import { Phone, Mail, Calendar, FileText, CheckCircle2, UserCheck, Plus, Clock } from 'lucide-react';
import { Avatar } from './Avatar';

interface TimelineProps {
  activities: Activity[];
  onAddActivity?: (activity: Omit<Activity, 'id' | 'organizationId'>) => void;
  relatedEntity?: {
    leadId?: string;
    leadName?: string;
    contactId?: string;
    contactName?: string;
    companyId?: string;
    companyName?: string;
    dealId?: string;
    dealName?: string;
  };
}

export const Timeline: React.FC<TimelineProps> = ({
  activities,
  onAddActivity,
  relatedEntity,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState<ActivityType>('Note');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [outcome, setOutcome] = useState('');

  const getTypeIcon = (actType: ActivityType) => {
    switch (actType) {
      case 'Call':
        return <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Email':
        return <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'Meeting':
        return <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'Demo':
        return <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'Follow-up':
        return <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      case 'Note':
      default:
        return <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getTypeBg = (actType: ActivityType) => {
    switch (actType) {
      case 'Call':
        return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800';
      case 'Email':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800';
      case 'Meeting':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-950/50 dark:border-purple-800';
      case 'Demo':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800';
      case 'Follow-up':
        return 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/50 dark:border-cyan-800';
      case 'Note':
      default:
        return 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !onAddActivity) return;

    onAddActivity({
      type,
      title: title.trim(),
      description: description.trim(),
      performedById: 'usr_3',
      performedByName: 'Vikramaditya Rao',
      occurredAt: new Date().toISOString(),
      durationMinutes: type === 'Call' || type === 'Meeting' || type === 'Demo' ? duration : undefined,
      outcome: outcome.trim() || undefined,
      relatedLeadId: relatedEntity?.leadId,
      relatedLeadName: relatedEntity?.leadName,
      relatedContactId: relatedEntity?.contactId,
      relatedContactName: relatedEntity?.contactName,
      relatedCompanyId: relatedEntity?.companyId,
      relatedCompanyName: relatedEntity?.companyName,
      relatedDealId: relatedEntity?.dealId,
      relatedDealName: relatedEntity?.dealName,
    });

    setTitle('');
    setDescription('');
    setOutcome('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Activity Logger Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
          Activity Timeline ({activities.length})
        </h4>
        {onAddActivity && !isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Activity
          </button>
        )}
      </div>

      {/* Quick Add Activity Form */}
      {isAdding && (
        <form onSubmit={handleSave} className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Activity Log</span>
            <div className="flex gap-1">
              {(['Note', 'Call', 'Email', 'Meeting', 'Demo'] as ActivityType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    type === t
                      ? 'bg-blue-600 text-white font-medium shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            required
            placeholder="Summary / Title (e.g. Discovery call with executive)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          <textarea
            rows={2}
            placeholder="Notes, discussion topics, next steps..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Outcome / Agreement"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400"
            />
            {(type === 'Call' || type === 'Meeting' || type === 'Demo') && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">Duration:</span>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value={15}>15 mins</option>
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Record Activity
            </button>
          </div>
        </form>
      )}

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {activities.length === 0 ? (
          <div className="text-xs text-slate-500 dark:text-slate-400 py-4">
            No logged activities yet. Click 'Log Activity' to record meetings, calls, or notes.
          </div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="relative group">
              {/* Bullet Node */}
              <div
                className={`absolute -left-[30px] top-0.5 w-6 h-6 rounded-full border flex items-center justify-center bg-white dark:bg-slate-900 shadow-xs ${getTypeBg(
                  act.type
                )}`}
              >
                {getTypeIcon(act.type)}
              </div>

              {/* Event Content */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {act.type}
                    </span>
                    <h5 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {act.title}
                    </h5>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(act.occurredAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {act.description}
                </p>

                {act.outcome && (
                  <div className="mt-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-900 dark:text-white">Outcome: </span>
                    {act.outcome}
                  </div>
                )}

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Avatar name={act.performedByName} size="xs" />
                    <span>{act.performedByName}</span>
                  </div>
                  {act.durationMinutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {act.durationMinutes} mins
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
