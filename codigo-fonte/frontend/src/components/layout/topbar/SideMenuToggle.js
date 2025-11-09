'use client';
import { useState, useEffect } from "react";
import SideMenu from "@/components/layout/sidebar/SideMenu";

export default function SideMenuToggle() {
  const [isOpen, setIsOpen] = useState(false);

  // Efeito que adiciona/remova classe no body
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
  }, [isOpen]);

  return (
    <>
      {/* Botão de abrir/fechar menu */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-white hover:text-green-100 transition-transform transform hover:scale-110 focus:outline-none"
        aria-label={isOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
      >
        {isOpen ? (
          // Ícone X (fechar)
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Ícone hambúrguer (abrir)
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* O menu é controlado pelo estado do botão */}
      <SideMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
