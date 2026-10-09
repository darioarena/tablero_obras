"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  HardHat,
  Receipt,
  FileSpreadsheet,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  userRole?: string;
}

export function MobileNavBar({ userRole = "ADMIN" }: MobileNavProps) {
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
    ...(userRole === "ADMIN"
      ? [
          {
            name: "Sheets",
            href: "/dashboard/sheets",
            icon: FileSpreadsheet,
            roles: ["ADMIN"],
          },
          {
            name: "Usuarios",
            href: "/dashboard/usuarios",
            icon: Users,
            roles: ["ADMIN"],
          },
        ]
      : []),
  ];

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden pointer-events-auto"
    >
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/90 text-white backdrop-blur-xl border border-white/20 shadow-2xl shadow-slate-950/40">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center justify-center h-10 w-10 rounded-full transition-all duration-200",
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              )}
              title={item.name}
            >
              <Icon className="h-5 w-5" />
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-300 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
