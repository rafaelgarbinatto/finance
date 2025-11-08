'use client';

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-green-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Verifique seu email
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Um link de autenticação foi enviado para seu email
          </p>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">
            Clique no link do email para entrar na plataforma
          </p>
        </div>
      </div>
    </div>
  );
}
