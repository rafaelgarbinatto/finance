'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import Link from 'next/link';
import { formatCurrencyDisplay, formatDateDisplay } from '@financas-a-dois/shared';

interface DashboardData {
  income: string;
  expense: string;
  balance: string;
  topCategories: Array<{
    name: string;
    amount: string;
    percentage: number;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: string;
    kind: string;
    categoryId: string;
    note: string | null;
    date: string;
    userId: string;
    familyId: string;
    createdAt: string;
    updatedAt: string;
    category: {
      id: string;
      name: string;
      kind: string;
    };
  }>;
}

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch('/api/v1/dashboard', {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  return res.json();
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    enabled: status === 'authenticated' && !!session?.user.familyId,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && !session?.user.familyId) {
      router.push('/onboarding');
    }
  }, [status, session, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-100 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const balance = parseFloat(data.balance);
  const balanceColor = balance >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Finanças a Dois
            </h1>
            <div className="flex gap-4">
              <Link
                href="/history"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                Histórico
              </Link>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600 dark:text-slate-300">
                {session?.user.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Receitas
            </h3>
            <p className="mt-2 text-3xl font-bold text-green-600 tabular-nums">
              {formatCurrencyDisplay(data.income)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Despesas
            </h3>
            <p className="mt-2 text-3xl font-bold text-red-600 tabular-nums">
              {formatCurrencyDisplay(data.expense)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Saldo
            </h3>
            <p className={`mt-2 text-3xl font-bold ${balanceColor} tabular-nums`}>
              {formatCurrencyDisplay(data.balance)}
            </p>
          </div>
        </div>

        {/* Top Categories */}
        {data.topCategories.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Principais Categorias
            </h2>
            <div className="space-y-4">
              {data.topCategories.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 dark:text-slate-300">{cat.name}</span>
                    <span className="text-slate-900 dark:text-white font-medium tabular-nums">
                      {formatCurrencyDisplay(cat.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Lançamentos Recentes
          </h2>
          {data.recentTransactions.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">
              Nenhum lançamento encontrado
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700 last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white font-medium">
                      {transaction.category.name}
                    </p>
                    {transaction.note && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {transaction.note}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {formatDateDisplay(transaction.date)}
                    </p>
                  </div>
                  <div
                    className={`text-lg font-semibold tabular-nums ${
                      transaction.kind === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.kind === 'INCOME' ? '+' : '-'}
                    {formatCurrencyDisplay(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* FAB */}
      <Link
        href="/new"
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors"
        aria-label="Novo lançamento"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </Link>
    </div>
  );
}
