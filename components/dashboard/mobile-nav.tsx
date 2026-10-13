"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  HardHat,
  Receipt,
  ShieldCheck,
  FileSpreadsheet,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingNavProps {
  userRole?: string;
}

export function FloatingNavBar({ userRole = "ADMIN" }: FloatingNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "OPERADOR"],
    },
    {
      name: "Obras",
      href: "/dashboard/obras",
      icon: Layers,
      roles: ["ADMIN", "OPERADOR"],
    },
    {
      name: "Contratistas",
      href: "/dashboard/contratistas",
      icon: HardHat,
      roles: ["ADMIN", "OPERADOR"],
    },
    {
      name: "Certificaciones",
      href: "/dashboard/certificaciones",
      icon: Receipt,
      roles: ["ADMIN", "OPERADOR"],
    },
    {
      name: "Garantías",
      href: "/dashboard/garantias",
      icon: ShieldCheck,
      roles: ["ADMIN", "OPERADOR"],
    },
    ...(userRole === "ADMIN"
      ? [
          {
            name: "Sheets",
            href: "/dashboard/sheets",
            icon: FileSpreadsheet,
            badge: "ADMIN",
            roles: ["ADMIN"],
          },
          {
            name: "Usuarios",
            href: "/dashboard/usuarios",
            icon: Users,
            badge: "ADMIN",
            roles: ["ADMIN"],
          },
        ]
      : []),
  ];

  return (
    <nav
      aria-label="Navegación principal flotante"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none max-w-[calc(100vw-1.5rem)]"
    >
      <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-full bg-slate-900/90 text-white backdrop-blur-2xl border border-white/20 shadow-2xl shadow-slate-950/40">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center justify-center rounded-full transition-all duration-200",
                // Dimensiones mobile: botón circular compacto
                "h-10 w-10 md:w-auto md:h-10 md:px-3.5 lg:px-4 md:py-2 md:gap-2",
                // Estado activo vs inactivo
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/35 ring-1 ring-white/25 scale-105 md:scale-100"
                  : "text-slate-300 hover:text-white hover:bg-white/10 active:scale-95"
              )}
              title={item.name}
            >
              <Icon className="h-5 w-5 md:h-4 md:w-4 shrink-0" />
              
              {/* Texto visible únicamente en escritorio / tablet */}
              <span className="hidden md:inline whitespace-nowrap text-xs font-semibold tracking-tight">
                {item.name}
              </span>

              {/* Badge sutil para módulos de Administrador en pantallas medianas/grandes */}
              {item.badge && (
                <span className="hidden lg:inline-flex px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 leading-none">
                  {item.badge}
                </span>
              )}

              {/* Indicador de píldora activa en mobile */}
              {isActive && (
                <span className="md:hidden absolute -bottom-1 w-1.5 h-1.5 bg-blue-300 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Re-export compatible con el nombre anterior
export const MobileNavBar = FloatingNavBar;
