import mongoose, { Schema } from 'mongoose';

export interface IOrganization {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  createdAt?: Date;
  updatedAt?: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    id: {
      type: String,
      required: [true, 'Organization ID is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [120, 'Name cannot exceed 120 characters'],
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
      uppercase: true,
    },
    currencySymbol: {
      type: String,
      default: '₹',
      trim: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
      trim: true,
    },
    plan: {
      type: String,
      enum: ['Starter', 'Professional', 'Enterprise'],
      default: 'Enterprise',
    },
  },
  {
    timestamps: true,
  }
);

export const Organization =
  (mongoose.models.Organization as mongoose.Model<IOrganization>) ||
  mongoose.model<IOrganization>('Organization', organizationSchema);
