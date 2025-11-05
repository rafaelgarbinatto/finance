'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/shared';
import Link from 'next/link';
import { EmptyState } from '../components/EmptyState';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  category_name: string;
  note?: string;
  date: string;
}

interface TransactionsResponse {
  items: Transaction[];
  next_cursor: string | null;
}

async function fetchTransactions(type?: string): Promise<TransactionsResponse> {
  const url = type
    ? `/api/v1/transactions?type=${type}&limit=50`
    : '/api/v1/transactions?limit=50';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export default function HistoryPage() {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', filter],
    queryFn: () => fetchTransactions(filter === 'all' ? undefined : filter),
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-blue-600 dark:bg-blue-700 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <Link href="/" className="mr-4 text-xl">
            ←
          </Link>
          <h1 className="text-2xl font-bold">Histórico</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('income')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                filter === 'income'
                  ? 'bg-green-600 dark:bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setFilter('expense')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                filter === 'expense'
                  ? 'bg-red-600 dark:bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Despesas
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {isLoading && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
          )}

          {error && (
            <div className="p-8 text-center text-red-600 dark:text-red-400">
              Erro ao carregar transações
            </div>
          )}

          {data && data.items.length === 0 && (
            <EmptyState
              icon="📊"
              title="Nenhuma transação encontrada"
              description="Ajuste os filtros ou adicione uma nova transação"
              actionLabel="Adicionar Lançamento"
              actionHref="/new"
            />
          )}

          {data && data.items.length > 0 && (
            <div className="divide-y dark:divide-gray-700">
              {data.items.map((txn) => (
                <div key={txn.id} className="p-4 flex justify-between items-start hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex-1">
                    <div className="font-medium dark:text-white">{txn.category_name}</div>
                    {txn.note && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">{txn.note}</div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-500">{formatDate(txn.date)}</div>
                  </div>
                  <div className={`font-semibold text-right tabular-nums ${
                    txn.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {txn.type === 'INCOME' ? '+' : '-'} {formatCurrency(txn.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
