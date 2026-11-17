import mongoose, { Schema } from 'mongoose';

export type Role = 'Super Admin' | 'Admin' | 'Manager' | 'Sales' | 'Viewer';

export interface IUser {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  department?: string;
  phone?: string;
  avatarUrl?: string;
  status: 'Active' | 'Inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const userSchema = new Schema<IUser>(
  {
    id: {
      type: String,
      required: [true, 'User ID is required'],
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
      required: [true, 'Full name is required'],
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: (props: any) => `"${props.value}" is not a valid email address`,
      },
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: {
        values: ['Super Admin', 'Admin', 'Manager', 'Sales', 'Viewer'],
        message: '{VALUE} is not a valid user role',
      },
      default: 'Sales',
    },
    department: {
      type: String,
      trim: true,
      default: 'Sales Operations',
    },
    phone: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.methods.toSafeUser = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

export const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>('User', userSchema);
