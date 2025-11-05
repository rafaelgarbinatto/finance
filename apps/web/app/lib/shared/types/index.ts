export interface ProblemJson {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
}

export type UserRole = 'OWNER' | 'PARTNER';
export type CategoryKind = 'INCOME' | 'EXPENSE';
export type TransactionType = 'INCOME' | 'EXPENSE';
