import { z } from 'zod';

export const onboardingActivateSchema = z.object({
  familyName: z.string().min(1).max(100).optional(),
});

export const onboardingSummarySchema = z.object({
  familyName: z.string(),
  categoriesCount: z.number(),
  transactionsCount: z.number(),
  totalIncome: z.string(),
  totalExpense: z.string(),
});

export type OnboardingActivate = z.infer<typeof onboardingActivateSchema>;
export type OnboardingSummary = z.infer<typeof onboardingSummarySchema>;
