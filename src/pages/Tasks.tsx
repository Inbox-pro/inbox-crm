import React, { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { tasksService, TaskFilterParams } from '../services/tasksService';
import { Task, TaskPriority, TaskStatus } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { Avatar } from '../components/common/Avatar';
import { SearchBar } from '../components/common/SearchBar';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | TaskPriority>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'High' as TaskPriority,
    companyName: '',
  });

  const { showToast } = useToast();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await tasksService.getTasks({
        search,
        status: statusFilter,
        priority: priorityFilter,
        page: currentPage,
        pageSize,
      });
      setTasks(res.data);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      console.error(err);
      showToast('Error loading tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter, currentPage, pageSize]);

  const handleToggleComplete = async (taskId: string) => {
    try {
      const res = await tasksService.toggleTaskComplete(taskId);
      const updated = res.data;
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
      showToast(updated.status === 'Completed' ? 'Task marked complete!' : 'Task reopened');
    } catch {
      showToast('Failed to update task', 'error');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tasksService.createTask({
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        status: 'Pending',
        assignedToId: 'usr_3',
        assignedToName: 'Vikramaditya Rao',
        relatedCompanyName: newTask.companyName || 'Enterprise Account',
      });
      showToast('Task added to schedule');
      setIsAddModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'High',
        companyName: '',
      });
      fetchTasks();
    } catch {
      showToast('Error scheduling task', 'error');
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!taskToDelete) return;
    try {
      await tasksService.deleteTask(taskToDelete);
      showToast('Task deleted');
      setIsConfirmDeleteOpen(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch {
      showToast('Failed to delete task', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Tasks & Follow-Ups
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {total} scheduled
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational action items, milestones, calls, and follow-ups.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] max-w-sm">
          <SearchBar value={search} onChange={setSearch} placeholder="Search tasks, descriptions, accounts..." />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            type="button"
            onClick={fetchTasks}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSkeleton count={pageSize} />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description="You are caught up! Create a new follow-up task to keep opportunities moving forward."
            actionLabel="Schedule Task"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map((task) => {
              const isOverdue =
                task.status !== 'Completed' &&
                new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

              return (
                <div
                  key={task.id}
                  className={`p-3.5 flex items-start sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                    task.status === 'Completed' ? 'opacity-60 bg-slate-50/40 dark:bg-slate-950/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(task.id)}
                      className={`mt-0.5 sm:mt-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        task.status === 'Completed'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      {task.status === 'Completed' && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-semibold text-xs ${
                            task.status === 'Completed'
                              ? 'line-through text-slate-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                        <PriorityBadge priority={task.priority} />
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                        {task.relatedCompanyName && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{task.relatedCompanyName}</span>
                          </div>
                        )}
                        <div
                          className={`flex items-center gap-1 font-mono ${
                            isOverdue ? 'text-rose-600 font-bold' : ''
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Due: {task.dueDate}</span>
                          {isOverdue && <span className="text-[10px] uppercase font-bold">(Overdue)</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <Avatar name={task.assignedToName} size="xs" />
                      <span className="truncate max-w-[110px]">{task.assignedToName}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTaskToDelete(task.id);
                        setIsConfirmDeleteOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Follow-Up Task"
        subtitle="Set milestone deliverables for prospects and accounts."
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Conduct technical security review"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Related Account / Company</label>
            <input
              type="text"
              placeholder="e.g. Acme Tech Solutions"
              value={newTask.companyName}
              onChange={e => setNewTask({ ...newTask, companyName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={newTask.dueDate}
                onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={newTask.priority}
                onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Optional notes or links to deliverables..."
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Save Task
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Delete Task"
        message="Are you sure you want to remove this task?"
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
