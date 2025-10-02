'use client'
import { useState, useEffect } from "react";
import { getUserInfo } from "@/utils/auth";
import Link from "next/link";

export default function TopBar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const userDetails = await getUserInfo();
      if (userDetails) {
        setUser(userDetails);
      }
    };

    getUser();
  }, []);

  return (
    <nav className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center">
            <span className="text-white text-xl sm:text-2xl font-bold hover:text-green-100 transition duration-200">
              GranaLivre
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <span className="text-white text-sm sm:text-base font-medium px-3 py-2 rounded-lg bg-green-700 bg-opacity-50">
                {user.email}
              </span>
            ) : (
              <>
                <Link
                  href="/registrar"
                  className="text-white text-sm sm:text-base font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Cadastrar
                </Link>
                <Link
                  href="/entrar"
                  className="bg-white text-green-600 text-sm sm:text-base font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-green-50 transition duration-200"
                >
                  Entrar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}