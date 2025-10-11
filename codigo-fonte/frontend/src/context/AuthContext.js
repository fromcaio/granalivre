'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserInfo, logoutUser, clearAuthCookies } from '@/lib/api';
import { setOnTokenInvalid } from '@/lib/axiosInstance';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleSessionInvalidation = useCallback((options = {}) => {
    console.warn(`AuthContext: Sessão invalidada. Redirecionar: ${!!options.redirect}`);
    
    if (options.redirect) {
      const redirectUrl = `/entrar?redirect=${encodeURIComponent(pathname)}`;
      window.location.href = redirectUrl;
    } else {
      clearAuthCookies();
      setUser(null);
      setLoading(false);
    }
  }, [pathname]);

  const refreshUser = useCallback(async () => {
    try {
      const userDetails = await getUserInfo();
      setUser(userDetails || null);
    } catch (error) {
      console.log('AuthContext: Não foi possível buscar os dados do usuário no cliente.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error('AuthContext: Falha no logout do lado do servidor.', e);
    } finally {
      handleSessionInvalidation({ redirect: true });
    }
  }, [handleSessionInvalidation]);

  /**
   * NOVA FUNÇÃO: Lida com a limpeza da sessão e redirecionamento após a exclusão da conta.
   * Força um recarregamento para a página inicial.
   */
  const handleAccountDeletion = useCallback(() => {
    clearAuthCookies();
    window.location.href = '/';
  }, []);

  useEffect(() => {
    setOnTokenInvalid(() => handleSessionInvalidation({ redirect: true }));
    refreshUser();
  }, [refreshUser, handleSessionInvalidation]);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    refreshUser,
    logout,
    handleAccountDeletion, // Expor a nova função no contexto
  }), [user, loading, refreshUser, logout, handleAccountDeletion]);

  return (
    <AuthContext.Provider value={contextValue}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-lg text-gray-600">Verificando sessão...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};