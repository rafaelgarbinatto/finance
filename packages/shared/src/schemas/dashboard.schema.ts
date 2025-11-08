import { z } from 'zod';
import { transactionWithCategorySchema } from './transaction.schema';

export const topCategorySchema = z.object({
  name: z.string(),
  amount: z.string(),
  percentage: z.number(),
});

export const dashboardResponseSchema = z.object({
  income: z.string(),
  expense: z.string(),
  balance: z.string(),
  topCategories: z.array(topCategorySchema),
  recentTransactions: z.array(transactionWithCategorySchema),
});

export type TopCategory = z.infer<typeof topCategorySchema>;
export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
