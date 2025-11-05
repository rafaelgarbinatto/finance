'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

async function activateOnboarding() {
  const res = await fetch('/api/v1/onboarding/activate', {
    method: 'POST',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to activate onboarding');
  }
  return res.json();
}

export default function OnboardingPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: activateOnboarding,
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Bem-vindo!</h1>

        {!showSuccess ? (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Configure suas finanças
              </h2>
              <p className="text-gray-600 mb-4">
                Vamos preparar seu mês com categorias e exemplos de transações
                para você começar:
              </p>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2">Categorias de Receitas:</h3>
                <ul className="list-disc list-inside text-gray-700">
                  <li>Salário</li>
                  <li>Outros</li>
                </ul>
              </div>

              <div className="bg-red-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2">Categorias de Despesas:</h3>
                <ul className="grid grid-cols-2 gap-2 text-gray-700">
                  <li>• Cartão</li>
                  <li>• Casa</li>
                  <li>• Carro</li>
                  <li>• Limpeza</li>
                  <li>• Internet/Telefone</li>
                  <li>• Clube</li>
                  <li>• Condomínio</li>
                  <li>• Mercado</li>
                  <li>• Restaurante</li>
                  <li>• Saúde</li>
                  <li>• Lazer</li>
                  <li>• Outros</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Transações de Exemplo:</h3>
                <p className="text-sm text-gray-600">
                  Incluiremos algumas transações de exemplo do mês atual para
                  você ver como funciona. Você pode editá-las ou excluí-las
                  depois.
                </p>
              </div>
            </div>

            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Ativando...' : 'Ativar mês'}
            </button>

            {mutation.isError && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {mutation.error.message}
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-semibold text-green-600 mb-2">
              Configuração concluída!
            </h2>
            <p className="text-gray-600">
              Redirecionando para o dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
