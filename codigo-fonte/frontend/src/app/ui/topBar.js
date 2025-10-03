'use client'
import { useState, useEffect } from "react";
import { getUserInfo } from "@/utils/auth";
import Link from "next/link";
import UserMenu from "./userMenu";
import EditAccountModal from "./editAccountModal";
import DeleteAccountModal from "./deleteAccountModal";

export default function TopBar() {
  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userDetails = await getUserInfo();
        if (userDetails) setUser(userDetails);
      } catch {}
    };
    getUser();
  }, []);

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
                user={user}
                onEdit={() => setShowEdit(true)}
                onDelete={() => setShowDelete(true)}
              />
            ) : (
              <>
                <Link
                  href="/registrar"
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
        <EditAccountModal user={user} onClose={() => setShowEdit(false)} />
      )}
      {showDelete && (
        <DeleteAccountModal onClose={() => setShowDelete(false)} />
      )}
    </nav>
  );
}