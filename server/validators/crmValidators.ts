import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(100),
  companyName: z
    .string()
    .trim()
    .min(2, 'Company name must be at least 2 characters long')
    .max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Work email is required')
    .email('Please provide a valid email address'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number must be at least 7 digits'),
  source: z
    .enum(['Website', 'Referral', 'LinkedIn', 'Advertisement', 'Cold Call', 'Email', 'Other'])
    .default('Website'),
  status: z
    .enum(['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted'])
    .default('New'),
  leadScore: z.number().min(0).max(100).default(50),
  estimatedValue: z.number().min(0, 'Estimated value cannot be negative').default(0),
  title: z.string().trim().optional(),
  location: z.string().trim().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const createDealSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Deal title must be at least 2 characters long')
    .max(150),
  companyId: z.string().trim().min(1, 'Parent Company ID is required'),
  companyName: z.string().trim().min(1, 'Company name is required'),
  contactId: z.string().trim().optional(),
  contactName: z.string().trim().optional(),
  value: z
    .number()
    .min(0, 'Deal value cannot be negative'),
  stage: z
    .enum(['New', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'])
    .default('New'),
  probability: z.number().min(0).max(100).default(10),
  expectedCloseDate: z
    .string()
    .trim()
    .min(1, 'Expected close date is required'),
  notes: z.string().trim().max(2000).optional(),
});

export const updateDealSchema = createDealSchema.partial();

export const updateDealStageSchema = z.object({
  stage: z.enum(['New', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']),
  probability: z.number().min(0).max(100).optional(),
});

export const createContactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().min(1).email('Please provide a valid email address'),
  phone: z.string().trim().optional(),
  companyId: z.string().trim().min(1, 'Company ID is required'),
  companyName: z.string().trim().min(1, 'Company name is required'),
  jobTitle: z.string().trim().optional(),
  status: z.enum(['Active', 'Prospect', 'Inactive']).default('Active'),
  notes: z.string().trim().max(2000).optional(),
});

export const createCompanySchema = z.object({
  name: z.string().trim().min(2, 'Company name must be at least 2 characters').max(120),
  industry: z.string().trim().min(2, 'Industry is required'),
  website: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  location: z.string().trim().optional(),
  employees: z.string().trim().optional(),
  annualRevenue: z.string().trim().optional(),
  status: z.enum(['Customer', 'Prospect', 'Partner', 'Churned']).default('Prospect'),
  notes: z.string().trim().max(2000).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().trim().max(2000).optional(),
  dueDate: z.string().trim().min(1, 'Due date is required'),
  priority: z.enum(['Urgent', 'High', 'Medium', 'Low']).default('Medium'),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Overdue']).default('Pending'),
  assignedToName: z.string().trim().optional(),
  assignedToId: z.string().trim().optional(),
  relatedEntityId: z.string().trim().optional(),
  relatedEntityType: z.enum(['Lead', 'Deal', 'Contact', 'Company']).optional(),
  relatedEntityName: z.string().trim().optional(),
});

export const createActivitySchema = z.object({
  type: z.enum(['Meeting', 'Call', 'Email', 'Demo', 'Note', 'Follow-up']),
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  occurredAt: z.string().trim().optional(),
  relatedEntityId: z.string().trim().optional(),
  relatedEntityType: z.enum(['Lead', 'Deal', 'Contact', 'Company']).optional(),
  relatedEntityName: z.string().trim().optional(),
});
