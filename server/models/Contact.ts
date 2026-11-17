import mongoose, { Schema } from 'mongoose';

export interface IContact {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone?: string;
  companyId: string;
  companyName: string;
  jobTitle?: string;
  status: 'Active' | 'Prospect' | 'Inactive';
  avatarUrl?: string;
  linkedin?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const contactSchema = new Schema<IContact>(
  {
    id: {
      type: String,
      required: [true, 'Contact ID is required'],
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
      required: [true, 'Contact name is required'],
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: (props: any) => `"${props.value}" is not a valid email address`,
      },
    },
    phone: { type: String, trim: true },
    companyId: {
      type: String,
      required: [true, 'Company ID is required'],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    jobTitle: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Active', 'Prospect', 'Inactive'],
      default: 'Active',
    },
    avatarUrl: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    notes: { type: String, maxlength: 2000, trim: true },
  },
  {
    timestamps: true,
  }
);

contactSchema.index({ organizationId: 1, email: 1 });

export const Contact =
  (mongoose.models.Contact as mongoose.Model<IContact>) ||
  mongoose.model<IContact>('Contact', contactSchema);
