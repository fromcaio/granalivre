'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AlreadyLoggedIn({ user }) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Você já está conectado!
        </h1>
        <p className="text-gray-600 mb-6">
          Olá, <span className="font-semibold">{user.username}</span>. Para criar uma nova conta, você precisa primeiro encerrar sua sessão atual.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={logout}
            className="w-full sm:w-auto bg-red-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-600 transition"
          >
            Sair da Conta Atual
          </button>
          <Link 
            href="/" 
            className="w-full sm:w-auto bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            Ir para o Início
          </Link>
        </div>
      </div>
    </div>
  );
}