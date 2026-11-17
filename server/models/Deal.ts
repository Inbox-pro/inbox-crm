import mongoose, { Schema } from 'mongoose';

export type DealStage = 'New' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface IDeal {
  id: string;
  organizationId: string;
  name: string;
  companyId: string;
  companyName: string;
  contactId?: string;
  contactName?: string;
  value: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate: string;
  ownerId: string;
  ownerName: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const dealSchema = new Schema<IDeal>(
  {
    id: {
      type: String,
      required: [true, 'Deal ID is required'],
      unique: true,
      trim: true,
    },
    organizationId: {
      type: String,
      required: [true, 'Organization ID is required'],
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Deal name is required'],
      minlength: [2, 'Deal name must be at least 2 characters long'],
      maxlength: [150, 'Deal name cannot exceed 150 characters'],
      trim: true,
    },
    companyId: {
      type: String,
      required: [true, 'Parent Company ID is required'],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    contactId: { type: String, trim: true },
    contactName: { type: String, trim: true },
    value: {
      type: Number,
      required: [true, 'Deal value is required'],
      min: [0, 'Deal value cannot be negative'],
    },
    stage: {
      type: String,
      enum: {
        values: ['New', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'],
        message: '{VALUE} is not a valid deal stage',
      },
      default: 'New',
    },
    probability: {
      type: Number,
      min: [0, 'Probability cannot be less than 0%'],
      max: [100, 'Probability cannot exceed 100%'],
      default: 10,
    },
    expectedCloseDate: {
      type: String,
      required: [true, 'Expected close date is required'],
      trim: true,
    },
    ownerId: {
      type: String,
      required: [true, 'Owner ID is required'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

dealSchema.index({ organizationId: 1, stage: 1 });

export const Deal =
  (mongoose.models.Deal as mongoose.Model<IDeal>) ||
  mongoose.model<IDeal>('Deal', dealSchema);
