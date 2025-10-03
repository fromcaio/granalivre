'use client'
import { useState, useRef, useEffect } from "react";

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

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="text-white text-sm sm:text-base font-medium px-3 py-2 rounded-lg bg-green-700 bg-opacity-50 hover:bg-opacity-70 transition"
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
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
            role="menuitem"
          >
            Editar conta
          </button>
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            role="menuitem"
          >
            Excluir conta
          </button>
        </div>
      )}
    </div>
  );
}