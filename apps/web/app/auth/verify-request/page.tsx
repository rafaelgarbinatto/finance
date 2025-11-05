export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">📧</div>
        <h1 className="text-2xl font-bold mb-4">Verifique seu e-mail</h1>
        <p className="text-gray-600">
          Um link de login foi enviado para seu e-mail.
          Clique no link para fazer login.
        </p>
      </div>
    </div>
  );
}
