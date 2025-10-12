'use client';

import { useState, useRef, useEffect } from "react";
import { formStyles } from "@/config/styles";
import { useAuth } from "@/context/AuthContext";
import EditAccountModal from "@/components/user/EditAccountModal";
import DeleteAccountModal from "@/components/user/DeleteAccountModal";

/**
 * O UserMenu é um Componente de Cliente que lida com toda a interatividade do usuário.
 * 1. Recebe o objeto `user` como uma prop do seu pai (TopBar, um Componente de Servidor).
 * Isso garante que a renderização inicial seja instantânea e correta.
 * 2. Ainda usa o hook `useAuth()` para acessar funções globais como `logout`.
 */
export default function UserMenu({ user }) {
  // Acessamos o contexto APENAS para obter as funções de que precisamos.
  const { logout } = useAuth();

  // Todos os estados relacionados à UI (dropdown, modais) são gerenciados aqui.
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef(null);

  // Efeito para fechar o dropdown ao clicar fora dele.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  // A verificação `if (!user)` não é mais necessária aqui, pois o TopBar
  // (Componente de Servidor) só renderizará este componente se o usuário existir.

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="text-white text-sm sm:text-base font-medium px-3 py-2 rounded-lg bg-green-700 bg-opacity-50 hover:bg-opacity-70 transition cursor-pointer flex items-center"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          {/* O nome de usuário para exibição vem diretamente da prop! */}
          {user.username || user.email}
        </button>

        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-30 animate-fade-in-down"
            role="menu"
          >
            <button
              onClick={() => { setIsOpen(false); setShowEditModal(true); }}
              className={formStyles.menuItem}
              role="menuitem"
            >
              Editar Conta
            </button>
            <button
              onClick={() => { setIsOpen(false); setShowDeleteModal(true); }}
              className={formStyles.menuItemDanger}
              role="menuitem"
            >
              Excluir Conta
            </button>
            <hr className="my-1 border-gray-200" />
            <button
              onClick={handleLogout}
              className={formStyles.menuItem}
              role="menuitem"
            >
              Sair
            </button>
          </div>
        )}
      </div>

      {/* Os modais são renderizados aqui, controlados pelo estado deste componente */}
      {showEditModal && (
        <EditAccountModal user={user} onClose={() => setShowEditModal(false)} />
      )}
      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </>
  );
}