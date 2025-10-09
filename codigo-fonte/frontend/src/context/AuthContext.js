'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { getUserInfo, logoutUser } from '@/utils/auth';
import { clearAuthCookies } from '@/utils/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user info once when the app loads
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDetails = await getUserInfo();
        if (userDetails) setUser(userDetails);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

    const refreshUser = async () => {
        try {
            const userDetails = await getUserInfo();
            setUser(userDetails || null);
        } catch {
            setUser(null);
        }
    };

    const logout = async () => {
        try {
        // server-side logout will invalidate refresh token
        await logoutUser();
        } catch (e) {
        console.error('Logout error:', e);
        } finally {
        // clear frontend cookies & context
        clearAuthCookies();
        setUser(null);
        }
    };

  return (
    <AuthContext.Provider value={{ user, setUser, refreshUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
