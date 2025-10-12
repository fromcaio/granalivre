'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerUser, loginUser } from '@/lib/api';
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

export default function RegisterPageClient() {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const { userName, email, password } = formData;

    if (!userName || !email || !password) {
      setError("Por favor, preencha todos os campos.");
      setIsLoading(false);
      return;
    }

    try {
      await registerUser(email, userName, password);
      setSuccessMessage("Cadastro realizado com sucesso! Acessando sua conta...");
      await loginUser(email, password);
      await refreshUser();
      router.replace(redirectPath);
    } catch (err) {
      console.error("Registration failed:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={formStyles.container}>
      <div className={formStyles.formWrapper}>
        <h1 className={formStyles.title}>Criar Nova Conta</h1>
        
        {successMessage && <SimpleNotificationBox message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />}
        {error && <SimpleNotificationBox message={error} type="error" onClose={() => setError(null)} />}
        
        <form onSubmit={handleSubmit} className={formStyles.form}>
          <input
            type="text"
            placeholder="Nome de usuário"
            name="userName" 
            value={formData.userName}
            required
            onChange={handleChange}
            className={formStyles.input}
            disabled={isLoading}
          />
          <input
            type="email"
            placeholder="Email"
            name="email" 
            value={formData.email}
            required
            onChange={handleChange}
            className={formStyles.input}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Senha"
            name="password" 
            value={formData.password}
            required
            onChange={handleChange}
            className={formStyles.input}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className={`${formStyles.baseButton} ${formStyles.registerButton}`}
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href={`/entrar?redirect=${encodeURIComponent(redirectPath)}`} className="font-semibold text-blue-600 hover:text-blue-700">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}