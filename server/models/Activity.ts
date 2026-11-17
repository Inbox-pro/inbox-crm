import mongoose, { Schema } from 'mongoose';

export type ActivityType = 'Meeting' | 'Call' | 'Email' | 'Demo' | 'Note' | 'Follow-up';

export interface IActivity {
  id: string;
  organizationId: string;
  type: ActivityType;
  title: string;
  description: string;
  performedByName: string;
  performedById?: string;
  occurredAt: string;
  relatedEntityId?: string;
  relatedEntityType?: 'Lead' | 'Deal' | 'Contact' | 'Company';
  relatedEntityName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    id: {
      type: String,
      required: [true, 'Activity ID is required'],
      unique: true,
      trim: true,
    },
    organizationId: {
      type: String,
      required: [true, 'Organization ID is required'],
      index: true,
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ['Meeting', 'Call', 'Email', 'Demo', 'Note', 'Follow-up'],
        message: '{VALUE} is not a valid activity type',
      },
      required: [true, 'Activity type is required'],
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Activity description/notes are required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      trim: true,
    },
    performedByName: {
      type: String,
      required: [true, 'Performer name is required'],
      trim: true,
    },
    performedById: { type: String, trim: true },
    occurredAt: {
      type: String,
      required: [true, 'Occurrence timestamp is required'],
      trim: true,
    },
    relatedEntityId: { type: String, trim: true },
    relatedEntityType: {
      type: String,
      enum: ['Lead', 'Deal', 'Contact', 'Company'],
    },
    relatedEntityName: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ organizationId: 1, occurredAt: -1 });

export const Activity =
  (mongoose.models.Activity as mongoose.Model<IActivity>) ||
  mongoose.model<IActivity>('Activity', activitySchema);
