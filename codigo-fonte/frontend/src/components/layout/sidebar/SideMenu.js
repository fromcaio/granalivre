// Client-side, responsive left menu with collapse/expand behavior.
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LineChart,
  LogOut,
  PiggyBank,
  Workflow,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const menuItems = [
  { label: "Resumo", href: "/", icon: LayoutDashboard },
  { label: "Entradas", href: "/entradas", icon: TrendingUp },
  { label: "Saídas", href: "/saidas", icon: TrendingDown },
  { label: "Automações", href: "/automacoes", icon: Workflow },
  { label: "Conta Corrente", href: "/contas", icon: CreditCard },
  { label: "Investimentos", href: "/investimentos", icon: LineChart },
  { label: "Patrimônio", href: "/patrimonio", icon: PiggyBank },
  { label: "Sair", href: "/sair", icon: LogOut },
];

export default function SideMenu({ activeLabel = "Resumo" }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const mobileBarRef = useRef(null);
  const { logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      // Default to collapsed on tablets and below for more room.
      setIsCollapsed(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setIsCollapsed((prev) => !prev);
  };

  const renderMenuContent = ({ hideLabels = false } = {}) => {
    const navClasses = [
      "flex flex-col gap-1 py-4",
      hideLabels ? "items-center" : "",
    ]
      .join(" ")
      .trim();

    const linkClasses = [
      "group flex rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700",
      hideLabels ? "flex-col items-center gap-2" : "items-center gap-3",
    ]
      .join(" ")
      .trim();

    return (
      <nav className={navClasses}>
        {menuItems.map(({ label, href, icon: Icon }) => {
          const isActive = label === activeLabel;
          const baseIcon =
            "transition group-hover:scale-110 group-hover:text-emerald-700";
          const iconClass = isActive
            ? "text-emerald-700"
            : "text-emerald-600";
          const activeClasses = isActive
            ? "bg-emerald-100 text-emerald-800"
            : "text-gray-700";

          const isLogout = label === "Sair";

          return isLogout ? (
            <button
              key={label}
              onClick={logout}
              className={`${linkClasses} ${activeClasses} w-full text-left cursor-pointer`}
              type="button"
            >
              <Icon size={20} className={`${iconClass} ${baseIcon}`} />
              <span className={hideLabels ? "sr-only" : "block"}>{label}</span>
            </button>
          ) : (
            <Link
              key={label}
              href={href}
              className={`${linkClasses} ${activeClasses}`}
            >
              <Icon size={20} className={`${iconClass} ${baseIcon}`} />
              <span className={hideLabels ? "sr-only" : "block"}>{label}</span>
            </Link>
          );
        })}
      </nav>
    );
  };

  return (
    <aside className="relative h-full">
      {/* Collapsible panel for desktop/tablet */}
      <div
        className={[
          "hidden sm:flex h-full border-r bg-gradient-to-b from-emerald-50 via-emerald-50 to-emerald-100 shadow-sm transition-all duration-300",
          isCollapsed ? "w-16" : "w-56",
        ].join(" ")}
      >
        <div className="flex w-full flex-col">
          <div
            className={[
              "flex items-center gap-2 px-3 py-4",
              isCollapsed ? "justify-center" : "",
            ]
              .join(" ")
              .trim()}
          >
            <button
              type="button"
              onClick={toggleMenu}
              className="flex h-8 w-8 items-center justify-center rounded-full border bg-white text-emerald-700 shadow transition hover:bg-emerald-50"
              aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              {isCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
            {!isCollapsed && (
              <span className="text-lg font-bold text-emerald-700">
                Navegação
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {renderMenuContent({ hideLabels: isCollapsed })}
          </div>
        </div>
      </div>

      {/* Mobile / very small: horizontal, always visible, scrollable */}
      <div
        className="sm:hidden w-full border-b bg-gradient-to-r from-emerald-50 via-emerald-50 to-emerald-100 shadow-sm overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        ref={mobileBarRef}
        onWheel={(e) => {
          if (!mobileBarRef.current) return;
          // Translate vertical scroll into horizontal motion for mouse users on small screens.
          if (e.deltaY !== 0) {
            e.preventDefault();
            mobileBarRef.current.scrollLeft += e.deltaY;
          }
        }}
      >
        <nav className="flex items-center gap-3 px-4 py-3">
      {menuItems.map(({ label, href, icon: Icon }) => {
        const isActive = label === activeLabel;
        const baseIcon = "transition group-hover:scale-110";
        const iconClass = isActive ? "text-emerald-700" : "text-emerald-600";
        const activeClasses = isActive
          ? "bg-emerald-100 text-emerald-800"
          : "text-gray-700";

        const isLogout = label === "Sair";

        return isLogout ? (
          <button
            key={label}
            onClick={logout}
            className={`group flex min-w-[56px] flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition hover:bg-emerald-50 hover:text-emerald-700 ${activeClasses} cursor-pointer`}
            type="button"
          >
            <Icon size={20} className={`${iconClass} ${baseIcon}`} />
            <span className="sr-only">{label}</span>
          </button>
        ) : (
          <Link
            key={label}
            href={href}
            className={`group flex min-w-[56px] flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition hover:bg-emerald-50 hover:text-emerald-700 ${activeClasses}`}
          >
            <Icon size={20} className={`${iconClass} ${baseIcon}`} />
            <span className="sr-only">{label}</span>
          </Link>
        );
      })}
    </nav>
      </div>
    </aside>
  );
}
