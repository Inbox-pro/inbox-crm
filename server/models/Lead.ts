import mongoose, { Schema } from 'mongoose';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Converted';
export type LeadSource =
  | 'Website'
  | 'Referral'
  | 'LinkedIn'
  | 'Advertisement'
  | 'Cold Call'
  | 'Email'
  | 'Other';

export interface ILead {
  id: string;
  organizationId: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  leadScore: number;
  aiInsight?: {
    score: number;
    factors: string[];
    recommendedAction: string;
    lastEvaluatedAt: string;
    intentLevel: 'High' | 'Medium' | 'Low';
  };
  scoreFactors?: string[];
  ownerId: string;
  ownerName: string;
  estimatedValue: number;
  title?: string;
  location?: string;
  notes?: string;
  convertedContactId?: string;
  convertedCompanyId?: string;
  convertedDealId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const leadSchema = new Schema<ILead>(
  {
    id: {
      type: String,
      required: [true, 'Lead ID is required'],
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
      required: [true, 'Lead contact name is required'],
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      minlength: [2, 'Company name must be at least 2 characters long'],
      maxlength: [120, 'Company name cannot exceed 120 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Work email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: (props: any) => `"${props.value}" is not a valid email address`,
      },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    source: {
      type: String,
      enum: {
        values: ['Website', 'Referral', 'LinkedIn', 'Advertisement', 'Cold Call', 'Email', 'Other'],
        message: '{VALUE} is not a valid acquisition source',
      },
      default: 'Website',
    },
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted'],
        message: '{VALUE} is not a valid lead status',
      },
      default: 'New',
    },
    leadScore: {
      type: Number,
      min: [0, 'Lead score cannot be less than 0'],
      max: [100, 'Lead score cannot exceed 100'],
      default: 50,
    },
    aiInsight: {
      score: { type: Number, min: 0, max: 100 },
      factors: [String],
      recommendedAction: String,
      lastEvaluatedAt: String,
      intentLevel: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
      },
    },
    scoreFactors: [String],
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
    estimatedValue: {
      type: Number,
      min: [0, 'Estimated deal value cannot be negative'],
      default: 0,
    },
    title: { type: String, trim: true },
    location: { type: String, trim: true },
    notes: { type: String, maxlength: [2000, 'Notes cannot exceed 2000 characters'], trim: true },
    convertedContactId: { type: String, trim: true },
    convertedCompanyId: { type: String, trim: true },
    convertedDealId: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ organizationId: 1, status: 1 });
leadSchema.index({ organizationId: 1, email: 1 });

export const Lead =
  (mongoose.models.Lead as mongoose.Model<ILead>) ||
  mongoose.model<ILead>('Lead', leadSchema);
