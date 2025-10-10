'use client';
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// REFACTOR: Centralized auth utilities import.
import { getUserInfo, logoutUser, clearAuthCookies } from '@/utils/auth'; 
import { setOnTokenInvalid } from '@/utils/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Represents the initial auth check
  const router = useRouter(); 

  /**
   * REFACTOR: Centralized session invalidation logic.
   * This function is the single point of truth for handling a dead session,
   * ensuring cookies are cleared, state is reset, and the user is redirected.
   */
  const handleSessionInvalidation = useCallback(() => {
    console.warn("AuthContext: Session has been invalidated. Cleaning up and redirecting to login.");
    clearAuthCookies();
    setUser(null);
    setLoading(false); // Ensure loading is finalized
    // router.push('/entrar');
  }, [router]);

  /**
   * Fetches user data from the backend to verify and update the session state.
   * This is the core function for initializing and refreshing the user's logged-in status.
   */
  const refreshUser = useCallback(async () => {
    // No need to set loading to true here, as it's for the *initial* load.
    try {
      const userDetails = await getUserInfo();
      setUser(userDetails || null);
    } catch (error) {
      // If getUserInfo fails, it implies no valid session exists.
      console.log('AuthContext: User info could not be fetched (likely not logged in).');
      setUser(null);
    } finally {
      // This marks the end of the initial authentication check.
      setLoading(false);
    }
  }, []); 

  /**
   * Logs the user out, cleaning up both server and client states.
   */
  const logout = useCallback(async () => {
    try {
      // Attempt to invalidate the token on the server first.
      await logoutUser();
    } catch (e) {
      console.error('AuthContext: Server-side logout failed. Proceeding with client-side cleanup anyway.', e);
    } finally {
      // Regardless of server outcome, always invalidate the session on the client.
      handleSessionInvalidation();
    }
  }, [handleSessionInvalidation]);

  // This effect runs only once on initial mount.
  useEffect(() => {
    // 1. Link the low-level axios interceptor with our high-level session invalidation handler.
    // This is crucial for reacting globally when the refresh token fails.
    setOnTokenInvalid(handleSessionInvalidation);

    // 2. Perform the initial check to see if a user session already exists.
    refreshUser();

  }, [refreshUser, handleSessionInvalidation]);


  // Memoize the context value to prevent unnecessary re-renders for consuming components.
  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    refreshUser,
    logout,
  }), [user, loading, refreshUser, logout]);


  return (
    <AuthContext.Provider value={contextValue}>
      {/* REFACTOR: Show a global loading indicator ONLY during the initial auth check. */}
      {/* This prevents layout shifts and content flashing while verifying the session. */}
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

// Custom hook for easy consumption of the auth context.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};