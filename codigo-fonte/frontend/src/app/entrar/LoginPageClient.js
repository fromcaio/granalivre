'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { formStyles } from '@/config/styles';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const SimpleNotificationBox = ({ message, type, onClose }) => {
    if (!message) return null;
    const baseClasses = "p-4 rounded-lg mb-4 text-sm font-medium flex justify-between items-start break-words";
    const typeClasses = type === 'error'
        ? "bg-red-100 text-red-700 border border-red-200"
        : "bg-green-100 text-green-700 border border-green-200";

    return (
        <div className={`${baseClasses} ${typeClasses}`} role="alert">
            <span>{message}</span>
            <button
                onClick={onClose}
                className="ml-4 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-opacity-70 transition-colors flex-shrink-0"
                aria-label="Fechar notificação"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    );
};

/**
 * Este componente lida exclusivamente com a interface e a lógica do formulário de login.
 * Ele assume que só será renderizado para um usuário deslogado.
 */
export default function LoginPageClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Usamos o `useAuth` apenas para a função `refreshUser`.
  const { refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  // O useEffect e a verificação de `isAuthenticated` foram removidos,
  // pois o Componente de Servidor pai já garante que o usuário não está logado.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Por favor, preencha seu email e senha.");
      setIsLoading(false);
      return;
    }

    try {
      await loginUser(email, password);
      setSuccessMessage("Login bem-sucedido! Redirecionando...");
      await refreshUser();
      router.replace(redirectPath);
    } catch (err) {
      console.error("Login failed:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={formStyles.container}>
      <div className={formStyles.formWrapper}>
        <h1 className={formStyles.title}>Acessar Sua Conta</h1>
        
        {successMessage && <SimpleNotificationBox message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />}
        {error && <SimpleNotificationBox message={error} type="error" onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} className={formStyles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            className={formStyles.input}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            required
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            className={formStyles.input}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className={`${formStyles.baseButton} ${formStyles.loginButton}`}
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link
              href={`/cadastrar?redirect=${encodeURIComponent(redirectPath)}`}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}