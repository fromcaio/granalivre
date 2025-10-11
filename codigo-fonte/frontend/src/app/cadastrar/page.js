'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerUser, loginUser } from '@/lib/api';
import { formStyles } from '@/config/styles';
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
                aria-label="Close notification"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    );
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // FIX: Destructure isAuthenticated and authLoading to prevent access by authenticated users.
  const { isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  // REFACTOR: Redirect authenticated users away from the register page.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
        console.info('User is already authenticated. Redirecting away from register page.');
        router.replace('/'); // Use replace to avoid adding to browser history
    }
  }, [isAuthenticated, authLoading, router]);


  /**
   * REFACTOR: Handles input changes and updates form data state.
   * Clears feedback messages upon user interaction for better UX.
   */
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
    setSuccessMessage(null);
  };

  /**
   * REFACTOR: Unified registration and login flow.
   * Registers the user, then automatically logs them in and updates the global auth state.
   * This removes the jarring redirection to the login page.
   */
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
      // Step 1: Register the new user.
      await registerUser(email, userName, password);
      
      setSuccessMessage("Cadastro realizado com sucesso! Acessando sua conta...");
      
      // Step 2: Automatically log in the new user. This sets the auth cookies.
      await loginUser(email, password);
      
      // Step 3: Refresh the global user state in AuthContext.
      await refreshUser();
      
      console.log("Registration and login successful. Redirecting to:", redirectPath);
      // Step 4: Redirect to the main application page or intended path.
      router.replace(redirectPath);

    } catch (err) {
      // The error message from auth utilities is already well-formatted.
      console.error("Registration failed:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Do not render the form if the user is known to be authenticated
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
          {/* FIX: Correctly apply base and specific button styles */}
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
            {/* FIX: Ensure redirect param is passed to login page */}
            <Link href={`/entrar?redirect=${encodeURIComponent(redirectPath)}`} className="font-semibold text-blue-600 hover:text-blue-700">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}