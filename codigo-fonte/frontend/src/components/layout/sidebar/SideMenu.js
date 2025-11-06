"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


const menuItems = [
  { name: "Resumo", href: "/"},
  { name: "Entradas", href: "/"},
  { name: "Saídas", href: "/saidas" },
  { name: "Conta Corrente", href: "/"},
  { name: "Automações", href: "/"},
  { name: "Patrimônios", href: "/"},
  { name: "Investimentos", href: "/"},
];

export default function SideMenu() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 shadow-sm fixed top-0 left-0 h-full flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-green-700">GranaLivre</h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={name}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-green-100 text-green-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {name}
            </Link>
          );
        })}
      </nav>

      <footer className="p-4 border-t border-gray-100 text-xs text-gray-400">
        © {new Date().getFullYear()} GranaLivre
      </footer>
    </aside>
  );
}
