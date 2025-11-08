import { z } from 'zod';
import { transactionKindSchema } from './transaction.schema';

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: transactionKindSchema,
  familyId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  kind: transactionKindSchema,
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export type Category = z.infer<typeof categorySchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
