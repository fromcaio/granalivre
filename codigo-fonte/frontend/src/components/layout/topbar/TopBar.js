'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import UserMenu from './UserMenu';

// REFACTOR: The TopBar is now a much simpler component. It no longer needs to manage
// the state for modals (`showEdit`, `showDelete`) or handle update events. Its only
// responsibility is to display the correct UI based on the authentication state.
export default function TopBar() {
  const { user } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-white text-xl sm:text-2xl font-bold hover:text-green-100 transition">
              GranaLivre
            </span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              // The UserMenu component is now self-contained. No props are needed.
              <UserMenu />
            ) : (
              // Fallback for logged-out users.
              <>
                <Link
                  href="/cadastrar"
                  className="text-white text-sm sm:text-base font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Cadastrar
                </Link>
                <Link
                  href="/entrar"
                  className="bg-white text-green-600 text-sm sm:text-base font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-green-50 transition"
                >
                  Entrar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      {/* All modal logic has been moved out of TopBar and into UserMenu. */}
    </nav>
  );
}