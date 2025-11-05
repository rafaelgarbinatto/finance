'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseCurrency } from '@shared/utils';

interface Category {
  id: string;
  name: string;
  kind: string;
}

async function fetchCategories(kind: string): Promise<Category[]> {
  const res = await fetch(`/api/v1/categories?kind=${kind}`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

async function createTransaction(data: any) {
  const res = await fetch('/api/v1/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to create transaction');
  }
  return res.json();
}

export default function NewTransactionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', type],
    queryFn: () => fetchCategories(type.toLowerCase()),
  });

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.push('/');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !categoryId) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const parsedAmount = parseCurrency(amount);

    mutation.mutate({
      type,
      amount: parsedAmount,
      category_id: categoryId,
      note: note || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 text-xl"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold">Novo Lançamento</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('EXPENSE');
                  setCategoryId('');
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  type === 'EXPENSE'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('INCOME');
                  setCategoryId('');
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  type === 'INCOME'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Receita
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Valor *
            </label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            {isLoading ? (
              <div className="text-gray-500">Carregando categorias...</div>
            ) : (
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Note */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
              Nota (opcional)
            </label>
            <input
              type="text"
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Adicione uma nota..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>

          {mutation.isError && (
            <div className="text-red-600 text-sm text-center">
              {mutation.error.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
