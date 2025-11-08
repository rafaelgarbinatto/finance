'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { formatCurrencyDisplay, formatDateDisplay } from '@financas-a-dois/shared';

interface Transaction {
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
}

interface PaginatedTransactions {
  data: Transaction[];
  nextCursor?: string;
  hasMore: boolean;
}

async function fetchTransactions(
  kind?: string,
  cursor?: string
): Promise<PaginatedTransactions> {
  const params = new URLSearchParams();
  if (kind) params.set('kind', kind);
  if (cursor) params.set('cursor', cursor);
  
  const res = await fetch(`/api/v1/transactions?${params.toString()}`, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch transactions');
  }
  
  return res.json();
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', filter],
    queryFn: () => fetchTransactions(filter === 'ALL' ? undefined : filter),
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Histórico
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('INCOME')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'INCOME'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setFilter('EXPENSE')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'EXPENSE'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Despesas
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
          {!data || data.data.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Nenhum lançamento encontrado
              </p>
              <Link
                href="/new"
                className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Criar primeiro lançamento
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {data.data.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            transaction.kind === 'INCOME' ? 'bg-green-600' : 'bg-red-600'
                          }`}
                        ></span>
                        <p className="text-slate-900 dark:text-white font-medium">
                          {transaction.category.name}
                        </p>
                      </div>
                      {transaction.note && (
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 ml-4">
                          {transaction.note}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 ml-4">
                        {formatDateDisplay(transaction.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold tabular-nums ${
                          transaction.kind === 'INCOME' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.kind === 'INCOME' ? '+' : '-'}
                        {formatCurrencyDisplay(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {data?.hasMore && (
          <div className="mt-6 text-center">
            <button className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
              Carregar mais
            </button>
          </div>
        )}
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
