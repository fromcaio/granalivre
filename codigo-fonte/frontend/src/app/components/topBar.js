'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import UserMenu from './userMenu';
import EditAccountModal from './editAccountModal';
import DeleteAccountModal from './deleteAccountModal';

export default function TopBar() {
  const { user, refreshUser } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleUserUpdated = async () => {
    await refreshUser();
  };

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
              <UserMenu
                onEdit={() => setShowEdit(true)}
                onDelete={() => setShowDelete(true)}
              />
            ) : (
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

      {showEdit && (
        <EditAccountModal
          user={user}
          onClose={() => setShowEdit(false)}
          onUpdated={handleUserUpdated}
        />
      )}
      {showDelete && (
        <DeleteAccountModal onClose={() => setShowDelete(false)} />
      )}
    </nav>
  );
}