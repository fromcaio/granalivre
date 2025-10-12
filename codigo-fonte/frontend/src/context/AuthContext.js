'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserInfo, logoutUser, clearAuthCookies } from '@/lib/api';
import { setOnTokenInvalid } from '@/lib/axiosInstance';

export const AuthContext = createContext(null);

/**
 * AuthProvider gerencia o estado de autenticação global do lado do cliente.
 * Ele é "alimentado" com os dados iniciais do usuário validados pelo servidor.
 */
export const AuthProvider = ({ children, initialUser }) => {
  // O estado do usuário é inicializado com os dados do servidor.
  const [user, setUser] = useState(initialUser);
  // O estado de carregamento inicial não é mais necessário, pois o servidor já fez o trabalho.
  const [loading, setLoading] = useState(false);
  
  // Hooks do Next.js para navegação e obtenção do caminho atual.
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Função centralizada para lidar com a invalidação da sessão.
   * Usa o router do Next.js para uma navegação mais fluida.
   */
  const handleSessionInvalidation = useCallback((options = {}) => {
    console.warn(`AuthContext: Sessão invalidada. Redirecionar: ${!!options.redirect}`);
    
    if (options.redirect) {
      const redirectUrl = `/entrar?redirect=${encodeURIComponent(pathname)}`;
      // MELHORIA: Usa router.replace() para não adicionar a página de login ao histórico do navegador.
      router.replace(redirectUrl);
    } else {
      clearAuthCookies();
      setUser(null);
      setLoading(false);
    }
  }, [pathname, router]);

  /**
   * Atualiza manualmente as informações do usuário no estado global.
   * Útil após ações como a edição do perfil.
   */
  const refreshUser = useCallback(async () => {
    setLoading(true);
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

  /**
   * Lida com o processo de logout do usuário.
   */
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error('AuthContext: Falha no logout do lado do servidor.', e);
    } finally {
      // Garante que o usuário seja deslogado no cliente e redirecionado.
      handleSessionInvalidation({ redirect: true });
    }
  }, [handleSessionInvalidation]);
  
  /**
   * Lida com a limpeza da sessão após a exclusão da conta.
   */
  const handleAccountDeletion = useCallback(() => {
    clearAuthCookies();
    // MELHORIA: Usa router.replace() para uma transição mais suave para a página inicial.
    router.replace('/');
  }, [router]);

  /**
   * Configura o interceptor do Axios para lidar com tokens expirados
   * durante a vida útil da sessão no cliente.
   */
  useEffect(() => {
    setOnTokenInvalid(() => handleSessionInvalidation({ redirect: true }));
  }, [handleSessionInvalidation]);

  // Memoriza o valor do contexto para evitar renderizações desnecessárias.
  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    refreshUser,
    logout,
    handleAccountDeletion,
  }), [user, loading, refreshUser, logout, handleAccountDeletion]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook customizado para acessar facilmente o AuthContext.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};