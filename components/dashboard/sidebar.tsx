"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  HardHat,
  Receipt,
  Users,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole = "ADMIN" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navigation = [
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
      badge: "5",
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
      name: "Usuarios (ABM)",
      href: "/dashboard/usuarios",
      icon: Users,
      badge: "ADMIN",
      roles: ["ADMIN"],
    },
  ];

  const allowedNav = navigation.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-200 bg-white transition-all duration-300 z-20 select-none",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-slate-900 leading-tight">
                PORTAL DE OBRAS
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Panel de Control</span>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
          {!collapsed ? "Módulos del Sistema" : "•••"}
        </div>

        {allowedNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors relative",
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-900"
                )}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                        isActive
                          ? "bg-slate-800 text-blue-300"
                          : item.badge === "ADMIN"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-3 m-3 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="truncate">
              <div className="text-[11px] font-bold text-slate-800">
                Rol: {userRole === "ADMIN" ? "Administrador" : "Operador Técnico"}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {userRole === "ADMIN" ? "Acceso Total y ABM" : "Lectura y Fiscalización"}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 border-t border-slate-100 flex items-center justify-end">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
