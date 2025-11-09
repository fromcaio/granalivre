"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Resumo", href: "/" },
  { name: "Entradas", href: "/" },
  { name: "Saídas", href: "/saidas" },
  { name: "Conta Corrente", href: "/" },
  { name: "Automações", href: "/" },
  { name: "Patrimônios", href: "/" },
  { name: "Investimentos", href: "/" },
];

export default function SideMenu({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Menu lateral deslizante */}
      <aside
        className={`absolute top-16 left-0 h-[calc(100%-8rem)] w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
       
        <nav className="flex-1 overflow-y-auto p-4 space-y-3">
          {menuItems.map(({ name, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={name}
                href={href}
                onClick={onClose}
                className={`block px-6 py-3 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-500 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                {name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
