'use client';
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import { getUserInfo, logoutUser, clearAuthCookies } from '@/utils/auth'; 
import { setOnTokenInvalid } from '@/utils/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Get the current path

  /**
   * REFACTOR: Centralized session invalidation with controlled redirection.
   * @param {object} options - Options for invalidation.
   * @param {boolean} options.redirect - If true, redirect to the login page.
   */
  const handleSessionInvalidation = useCallback((options = {}) => {
    console.warn(`AuthContext: Session invalidated. Redirect: ${!!options.redirect}`);
    clearAuthCookies();
    setUser(null);
    setLoading(false); // Ensure loading is finalized
    
    if (options.redirect) {
      // Redirect to login, but also pass the current path as a query param
      // so the user can be redirected back after logging in.
      router.push(`/entrar?next=${encodeURIComponent(pathname)}`);
    }
  }, [router, pathname]);

  const refreshUser = useCallback(async () => {
    try {
      const userDetails = await getUserInfo();
      setUser(userDetails || null);
    } catch (error) {
      // This catch block is now the primary path for a failed *initial* auth check.
      // The axios interceptor will not interfere. We simply set the user to null.
      console.log('AuthContext: Initial user info fetch failed. User is not logged in.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []); 

  /**
   * Logs the user out explicitly, ALWAYS triggering a redirect.
   */
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error('AuthContext: Server-side logout failed.', e);
    } finally {
      // An explicit logout should always redirect the user.
      handleSessionInvalidation({ redirect: true });
    }
  }, [handleSessionInvalidation]);

  useEffect(() => {
    // When an active session dies (token refresh fails), invalidate and redirect.
    setOnTokenInvalid(() => handleSessionInvalidation({ redirect: true }));
    // Perform the initial, silent check to see if a session exists.
    refreshUser();
  }, [refreshUser, handleSessionInvalidation]);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    refreshUser,
    logout,
  }), [user, loading, refreshUser, logout]);


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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};