'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser } from '@/utils/auth';
import { formStyles } from '@/utils/variables';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

/**
 * A simple, reusable notification component.
 */
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    );
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const { isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  // REFACTOR: Redirect authenticated users away from the login page.
  // This prevents logged-in users from seeing the login screen again.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
        console.info('User is already authenticated. Redirecting away from login page.');
        router.replace('/'); // Use replace to avoid adding to browser history
    }
  }, [isAuthenticated, authLoading, router]);

  /**
   * REFACTOR: Simplified handler for login form submission.
   * On success, updates the global auth state and redirects.
   */
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
      // Step 1: Perform login. The utility handles setting cookies.
      await loginUser(email, password);
      
      setSuccessMessage("Login bem-sucedido! Redirecionando...");
      
      // Step 2: Update the global state via AuthContext.
      await refreshUser();
      
      console.log("User logged in. Redirecting to:", redirectPath);
      // Step 3: Redirect to the main app or the original intended page.
      router.replace(redirectPath); 

    } catch (err) {
      // The error message from auth utilities is already well-formatted.
      console.error("Login failed:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // REFACTOR: Centralized loading state for authentication check.
  // Prevents rendering the form while the app is still determining the auth state.
  if (authLoading || isAuthenticated) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-lg text-gray-600">Verificando autenticação...</p>
        </div>
    );
  }

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
          {/* FIX: Correctly apply base and specific button styles */}
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
            {/* FIX: Ensure redirect param is passed to register page */}
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