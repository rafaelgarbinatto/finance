import { z } from 'zod';

// User schemas
export const userRoleSchema = z.enum(['OWNER', 'PARTNER']);
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  role: userRoleSchema.optional(),
  family_id: z.string().optional(),
});

// Category schemas
export const categoryKindSchema = z.enum(['INCOME', 'EXPENSE']);
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: categoryKindSchema,
  family_id: z.string(),
  version: z.number(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  kind: categoryKindSchema,
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

// Transaction schemas
export const transactionTypeSchema = z.enum(['INCOME', 'EXPENSE']);
export const transactionSchema = z.object({
  id: z.string(),
  type: transactionTypeSchema,
  amount: z.string().regex(/^\d+\.\d{2}$/), // BRL with 2 decimals as string
  category_id: z.string(),
  category_name: z.string().optional(),
  note: z.string().optional(),
  date: z.string(), // ISO date string
  user_id: z.string(),
  family_id: z.string(),
  version: z.number(),
  created_at: z.string(),
});

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  amount: z.string().regex(/^\d+\.\d{2}$/),
  category_id: z.string(),
  note: z.string().max(500).optional(),
  date: z.string().optional(), // defaults to today
});

export const updateTransactionSchema = z.object({
  type: transactionTypeSchema.optional(),
  amount: z.string().regex(/^\d+\.\d{2}$/).optional(),
  category_id: z.string().optional(),
  note: z.string().max(500).optional(),
  date: z.string().optional(),
});

// Dashboard schemas
export const dashboardSchema = z.object({
  income: z.string(),
  expense: z.string(),
  balance: z.string(),
  top_categories: z.array(z.object({
    name: z.string(),
    amount: z.string(),
    percentage: z.number(),
  })),
  recent: z.array(transactionSchema),
});

// Invite schemas
export const createInviteSchema = z.object({
  email: z.string().email(),
  role: userRoleSchema.optional(),
});

export const acceptInviteSchema = z.object({
  token: z.string(),
  name: z.string().min(1).max(100),
});

// Auth schemas
export const magicLinkSchema = z.object({
  email: z.string().email(),
});
