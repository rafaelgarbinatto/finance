'use client';

import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/shared';
import Link from 'next/link';
import { DashboardSkeleton } from './components/Skeletons';
import { EmptyState } from './components/EmptyState';

interface DashboardData {
  income: string;
  expense: string;
  balance: string;
  top_categories: Array<{
    name: string;
    amount: string;
    percentage: number;
  }>;
  recent: Array<{
    id: string;
    type: string;
    amount: string;
    category_name: string;
    note?: string;
    date: string;
  }>;
}

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch('/api/v1/dashboard');
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}

export default function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8 text-red-600">
            Erro ao carregar dados. Por favor, faça login.
          </div>
          <div className="text-center">
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Finanças a Dois</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Receitas</div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(data!.income)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Despesas</div>
            <div className="text-xl font-bold text-red-600">
              {formatCurrency(data!.expense)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Saldo</div>
            <div className={`text-xl font-bold ${
              parseFloat(data!.balance) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(data!.balance)}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        {data!.top_categories.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Principais Categorias</h2>
            <div className="space-y-3">
              {data!.top_categories.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{cat.name}</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(cat.amount)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recentes</h2>
            <Link href="/history" className="text-sm text-blue-600 hover:underline">
              Ver todos
            </Link>
          </div>
          {data!.recent.length === 0 ? (
            <EmptyState
              icon="💰"
              title="Nenhuma transação ainda"
              description="Comece adicionando seu primeiro lançamento"
              actionLabel="Adicionar Lançamento"
              actionHref="/new"
            />
          ) : (
            <div className="space-y-2">
              {data!.recent.map((txn) => (
                <div key={txn.id} className="flex justify-between items-start py-2 border-b last:border-0">
                  <div className="flex-1">
                    <div className="font-medium">{txn.category_name}</div>
                    {txn.note && <div className="text-sm text-gray-600">{txn.note}</div>}
                    <div className="text-xs text-gray-500">{txn.date}</div>
                  </div>
                  <div className={`font-semibold ${
                    txn.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {txn.type === 'INCOME' ? '+' : '-'} {formatCurrency(txn.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <Link
        href="/new"
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-700 transition"
      >
        +
      </Link>
    </div>
  );
}
