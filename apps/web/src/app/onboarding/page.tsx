'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';

async function activateOnboarding(familyName?: string) {
  const res = await fetch('/api/v1/onboarding/activate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      familyName,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to activate onboarding');
  }

  return res.json();
}

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [familyName, setFamilyName] = useState('');

  const mutation = useMutation({
    mutationFn: activateOnboarding,
    onSuccess: async () => {
      // Update session to reflect new familyId
      await update();
      // Redirect to dashboard
      router.push('/');
    },
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session?.user.familyId) {
      router.push('/');
    }
  }, [status, session, router]);

  const handleActivate = () => {
    mutation.mutate(familyName || undefined);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Bem-vindo ao Finanças a Dois! 🎉
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Vamos configurar sua conta para começar
            </p>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 dark:bg-slate-700 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              O que será criado:
            </h2>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  <strong>Família:</strong> Sua nova família para gestão compartilhada
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  <strong>9 categorias:</strong> 3 de receita e 6 de despesa
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  <strong>8 lançamentos de exemplo:</strong> Para você começar a usar já
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  <strong>Dados do mês atual:</strong> Receita de R$ 6.700,00 e despesas de R$ 2.400,50
                </span>
              </li>
            </ul>
          </div>

          {/* Family Name Input */}
          <div className="mb-6">
            <label
              htmlFor="familyName"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Nome da Família (opcional)
            </label>
            <input
              type="text"
              id="familyName"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Minha Família"
              maxLength={100}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Deixe em branco para usar "Minha Família"
            </p>
          </div>

          {/* Activate Button */}
          <button
            onClick={handleActivate}
            disabled={mutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
          >
            {mutation.isPending ? 'Configurando...' : 'Ativar Minha Conta'}
          </button>

          {mutation.isError && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-400 text-sm">
                {mutation.error.message}
              </p>
            </div>
          )}

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Você poderá convidar outras pessoas para sua família depois
          </p>
        </div>
      </div>
    </div>
  );
}
