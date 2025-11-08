export type UserRole = 'OWNER' | 'PARTNER';

export type TransactionKind = 'INCOME' | 'EXPENSE';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole | null;
  familyId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Family {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  kind: TransactionKind;
  familyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  amount: string;
  kind: TransactionKind;
  categoryId: string;
  note: string | null;
  date: Date;
  userId: string;
  familyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  familyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  familyId: string;
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardData {
  income: string;
  expense: string;
  balance: string;
  topCategories: Array<{
    name: string;
    amount: string;
    percentage: number;
  }>;
  recentTransactions: Array<Transaction & { category: Category }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
}
