'use client';
import { useState, useRef, useEffect } from "react";
import { formStyles } from "@/utils/variables";
import { useAuth } from "@/context/AuthContext";
import EditAccountModal from "./editAccountModal";
import DeleteAccountModal from "./deleteAccountModal"; // Import Delete modal

// REFACTOR: This component now fully manages its own state, including the visibility
// of the edit and delete modals, removing the need for props like `onEdit` or `onDelete`.
export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef(null);

  // Effect to close the dropdown when clicking outside of it.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // REFACTOR: The logout process is simplified. The `logout` function from `useAuth`
  // already handles server-side invalidation, client-side cookie clearing, state reset,
  // and redirection. No need for alerts or complex logic here.
  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="text-white text-sm sm:text-base font-medium px-3 py-2 rounded-lg bg-green-700 bg-opacity-50 hover:bg-opacity-70 transition cursor-pointer flex items-center"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
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

      {/* Modals are now rendered here, controlled by this component's state */}
      {showEditModal && (
        <EditAccountModal onClose={() => setShowEditModal(false)} />
      )}
      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </>
  );
}