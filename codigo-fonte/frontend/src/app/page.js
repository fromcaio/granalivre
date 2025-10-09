'use client';
import { useAuth } from '@/context/AuthContext';
import TopBar from './components/topBar';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar /> {/* ✅ No need to pass user; context handles it */}
      <main className="p-6 text-center">
        {user ? (
          <h1 className="text-2xl font-semibold text-green-700">
            Olá, {user.username} 👋
          </h1>
        ) : (
          <h1 className="text-2xl font-semibold text-gray-700">
            Bem-vindo ao GranaLivre!
          </h1>
        )}
      </main>
    </div>
  );
}