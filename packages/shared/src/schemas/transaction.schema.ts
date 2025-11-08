import { z } from 'zod';

export const transactionKindSchema = z.enum(['INCOME', 'EXPENSE']);

export const createTransactionSchema = z.object({
  amount: z.string().regex(/^\d+\.\d{2}$/, 'Amount must have 2 decimal places'),
  kind: transactionKindSchema,
  categoryId: z.string(),
  note: z.string().optional(),
  date: z.string().datetime(),
});

export const updateTransactionSchema = z.object({
  amount: z.string().regex(/^\d+\.\d{2}$/, 'Amount must have 2 decimal places').optional(),
  kind: transactionKindSchema.optional(),
  categoryId: z.string().optional(),
  note: z.string().optional(),
  date: z.string().datetime().optional(),
});

export const transactionResponseSchema = z.object({
  id: z.string(),
  amount: z.string(),
  kind: transactionKindSchema,
  categoryId: z.string(),
  note: z.string().nullable(),
  date: z.string().datetime(),
  userId: z.string(),
  familyId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const transactionWithCategorySchema = transactionResponseSchema.extend({
  category: z.object({
    id: z.string(),
    name: z.string(),
    kind: transactionKindSchema,
  }),
});

export const transactionListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  kind: transactionKindSchema.optional(),
});

export const paginatedTransactionsSchema = z.object({
  data: z.array(transactionWithCategorySchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});

export type TransactionKind = z.infer<typeof transactionKindSchema>;
export type CreateTransaction = z.infer<typeof createTransactionSchema>;
export type UpdateTransaction = z.infer<typeof updateTransactionSchema>;
export type TransactionResponse = z.infer<typeof transactionResponseSchema>;
export type TransactionWithCategory = z.infer<typeof transactionWithCategorySchema>;
export type TransactionListQuery = z.infer<typeof transactionListQuerySchema>;
export type PaginatedTransactions = z.infer<typeof paginatedTransactionsSchema>;
