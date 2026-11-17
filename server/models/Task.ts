import mongoose, { Schema } from 'mongoose';

export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';

export interface ITask {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToName: string;
  assignedToId: string;
  relatedEntityId?: string;
  relatedEntityType?: 'Lead' | 'Deal' | 'Contact' | 'Company';
  relatedEntityName?: string;
  completedAt?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const taskSchema = new Schema<ITask>(
  {
    id: {
      type: String,
      required: [true, 'Task ID is required'],
      unique: true,
      trim: true,
    },
    organizationId: {
      type: String,
      required: [true, 'Organization ID is required'],
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      trim: true,
    },
    description: { type: String, maxlength: 2000, trim: true },
    dueDate: {
      type: String,
      required: [true, 'Due date is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['Urgent', 'High', 'Medium', 'Low'],
        message: '{VALUE} is not a valid task priority',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Progress', 'Completed', 'Overdue'],
        message: '{VALUE} is not a valid task status',
      },
      default: 'Pending',
    },
    assignedToName: {
      type: String,
      required: [true, 'Assigned user name is required'],
      trim: true,
    },
    assignedToId: {
      type: String,
      required: [true, 'Assigned user ID is required'],
      trim: true,
    },
    relatedEntityId: { type: String, trim: true },
    relatedEntityType: {
      type: String,
      enum: ['Lead', 'Deal', 'Contact', 'Company'],
    },
    relatedEntityName: { type: String, trim: true },
    completedAt: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ organizationId: 1, status: 1 });

export const Task =
  (mongoose.models.Task as mongoose.Model<ITask>) ||
  mongoose.model<ITask>('Task', taskSchema);
