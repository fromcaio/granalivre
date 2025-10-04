'use client'
import { useState, useRef, useEffect } from "react";
import { formStyles } from "@/utils/variables";
import { logoutUser } from "@/utils/auth";

export default function UserMenu({ user, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logoutUser();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Erro ao sair. Tente novamente.");
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="text-white text-sm sm:text-base font-medium px-3 py-2 rounded-lg bg-green-700 bg-opacity-50 hover:bg-opacity-70 transition cursor-pointer"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {user.email}
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-30 animate-fade"
          role="menu"
        >
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className={formStyles.menuItem}
            role="menuitem"
          >
            Editar conta
          </button>
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className={formStyles.menuItemDanger}
            role="menuitem"
          >
            Excluir conta
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
  );
}