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
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({
  userRole = "ADMIN",
  collapsed: controlledCollapsed,
  onToggle,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const pathname = usePathname();

  const isControlled = typeof controlledCollapsed === "boolean";
  const isCollapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (isControlled && onToggle) {
      onToggle();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

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
    {
      name: "Conexiones Sheets",
      href: "/dashboard/sheets",
      icon: FileSpreadsheet,
      badge: "ADMIN",
      roles: ["ADMIN"],
    },
  ];

  const allowedNav = navigation.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen h-dvh z-30 hidden md:flex flex-col border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out select-none",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* ===================================================================== */}
      {/* 1. HEADER (Logo y Título Institucional) - Fijo en la parte superior */}
      {/* ===================================================================== */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-slate-100 transition-all duration-300",
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-slate-900 leading-tight">
                PORTAL DE OBRAS
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Panel de Control</span>
            </div>
          )}
        </Link>
      </div>

      {/* ===================================================================== */}
      {/* 2. BODY (Navegación con Scroll Interno Independiente) */}
      {/* ===================================================================== */}
      <nav className="flex-1 min-h-0 space-y-1.5 p-2.5 overflow-y-auto">
        <div
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider text-slate-400 py-1 transition-all",
            isCollapsed ? "text-center" : "px-3"
          )}
        >
          {!isCollapsed ? "Módulos del Sistema" : "•••"}
        </div>

        {allowedNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg text-xs font-medium transition-colors relative",
                isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-900"
                )}
              />
              {!isCollapsed && (
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

      {/* ===================================================================== */}
      {/* 3. FOOTER (Tarjeta de Usuario / Rol y Botón de Colapso) - Fijo abajo */}
      {/* ===================================================================== */}
      <div className="mt-auto shrink-0 border-t border-slate-100 bg-white p-2.5 space-y-2">
        {/* Card con rol del usuario */}
        {!isCollapsed ? (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
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
        ) : (
          <div className="flex justify-center" title={`Rol: ${userRole === "ADMIN" ? "Administrador" : "Operador"}`}>
            <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-blue-600">
              <Shield className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Botón de Colapso / Expansión */}
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between px-1")}>
          {!isCollapsed && (
            <span className="text-[10px] text-slate-400 font-medium">
              Contraer barra
            </span>
          )}
          <button
            onClick={handleToggle}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title={isCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
            type="button"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
