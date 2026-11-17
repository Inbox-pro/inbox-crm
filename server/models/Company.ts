import mongoose, { Schema } from 'mongoose';

export interface ICompany {
  id: string;
  organizationId: string;
  name: string;
  industry: string;
  website?: string;
  phone?: string;
  email?: string;
  location?: string;
  employees?: string;
  annualRevenue?: string;
  status: 'Customer' | 'Prospect' | 'Partner' | 'Churned';
  ownerId?: string;
  ownerName?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const companySchema = new Schema<ICompany>(
  {
    id: {
      type: String,
      required: [true, 'Company ID is required'],
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
      required: [true, 'Company name is required'],
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [120, 'Name cannot exceed 120 characters'],
      trim: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry sector is required'],
      trim: true,
    },
    website: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    location: { type: String, trim: true },
    employees: { type: String, trim: true },
    annualRevenue: { type: String, trim: true },
    ownerId: { type: String, trim: true },
    ownerName: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Customer', 'Prospect', 'Partner', 'Churned'],
      default: 'Prospect',
    },
    notes: { type: String, maxlength: 2000, trim: true },
  },
  {
    timestamps: true,
  }
);

companySchema.index({ organizationId: 1, name: 1 });

export const Company =
  (mongoose.models.Company as mongoose.Model<ICompany>) ||
  mongoose.model<ICompany>('Company', companySchema);
