'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDateInput } from '@financas-a-dois/shared';

interface Category {
  id: string;
  name: string;
  kind: string;
  familyId: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/v1/categories', {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }
  return res.json();
}

async function createTransaction(data: {
  amount: string;
  kind: string;
  categoryId: string;
  note?: string;
  date: string;
}) {
  const idempotencyKey = `${Date.now()}-${Math.random()}`;
  
  const res = await fetch('/api/v1/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    credentials: 'include',
    body: JSON.stringify({
      ...data,
      date: new Date(data.date).toISOString(),
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to create transaction');
  }

  return res.json();
}

export default function NewTransactionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [kind, setKind] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(formatDateInput(new Date()));

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: status === 'authenticated' && !!session?.user.familyId,
  });

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      router.push('/');
    },
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && !session?.user.familyId) {
      router.push('/onboarding');
    }
  }, [status, session, router]);

  const filteredCategories = categories?.filter((cat) => cat.kind === kind) || [];

  useEffect(() => {
    if (filteredCategories.length > 0 && !categoryId) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Format amount to 2 decimals
    const amountValue = parseFloat(amount).toFixed(2);

    mutation.mutate({
      amount: amountValue,
      kind,
      categoryId,
      note: note || undefined,
      date,
    });
  };

  if (status === 'loading') {
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
            <button
              onClick={() => router.back()}
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
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Novo Lançamento
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          {/* Amount */}
          <div className="mb-6">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Valor
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                R$
              </span>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-2xl font-semibold border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white tabular-nums"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Kind Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tipo
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setKind('INCOME')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  kind === 'INCOME'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Receita
              </button>
              <button
                type="button"
                onClick={() => setKind('EXPENSE')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  kind === 'EXPENSE'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Despesa
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="mb-6">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Categoria
            </label>
            <select
              id="category"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="mb-6">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Data
            </label>
            <input
              type="date"
              id="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Note */}
          <div className="mb-6">
            <label
              htmlFor="note"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Nota (opcional)
            </label>
            <input
              type="text"
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              placeholder="Descrição do lançamento"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {mutation.isPending ? 'Salvando...' : 'Salvar Lançamento'}
          </button>

          {mutation.isError && (
            <p className="mt-4 text-red-600 text-sm text-center">
              {mutation.error.message}
            </p>
          )}
        </form>
      </main>
    </div>
  );
}
