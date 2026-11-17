import { z } from 'zod';

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Work email address is required')
    .email('Please enter a valid work email address'),
  password: z
    .string()
    .min(1, 'Password cannot be empty'),
  targetRole: z
    .enum(['admin', 'user', 'Super Admin', 'Admin', 'Manager', 'Sales', 'Viewer'])
    .optional(),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email address is required')
    .email('Please enter a valid work email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      STRONG_PASSWORD_REGEX,
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol'
    ),
  role: z
    .enum(['Super Admin', 'Admin', 'Manager', 'Sales', 'Viewer'])
    .default('Sales'),
  department: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  organizationId: z.string().trim().default('org_inbox_01'),
});
