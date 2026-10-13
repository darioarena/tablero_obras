"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Building2,
  Calendar,
  LogOut,
  User,
  RefreshCw,
  Bell,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

export function Navbar({
  userName = "Arq. Valeria Domínguez",
  userEmail = "admin@portaldeobras.gob.ar",
  userRole = "ADMIN",
}: NavbarProps) {
  const [selectedFilter, setSelectedFilter] = useState("2024-anual");
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    // Simula / llama a revalidación de cache
    setTimeout(() => {
      setIsSyncing(false);
      window.location.reload();
    }, 800);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-subtle">
      {/* Branding Institucional + Buscador / Filtro */}
      <div className="flex items-center gap-3 sm:gap-5">
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
          <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight">
              PORTAL DE OBRAS
            </span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase hidden sm:block">
              Tablero de Gestión
            </span>
          </div>
        </Link>

        <div className="hidden lg:block h-6 w-px bg-slate-200" />

        {/* Buscador / Filtro Rápido */}
        <div className="hidden sm:flex items-center gap-2.5">
          <div className="relative w-44 md:w-60 lg:w-72">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar obra, contratista..."
              className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Selector de Período Global */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="2024-anual">Ejercicio 2024 (Consolidado)</option>
              <option value="2024-q3">Tercer Trimestre 2024</option>
              <option value="2024-mes">Mes en Curso (Octubre)</option>
              <option value="historico">Histórico Total</option>
            </select>
          </div>
        </div>
      </div>

      {/* Acciones del Navbar y Perfil */}
      <div className="flex items-center gap-3">
        {/* Sincronizar Google Sheets */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualSync}
          isLoading={isSyncing}
          className="text-xs hidden sm:inline-flex border-slate-200 text-slate-700"
          title="Sincronizar datos con Google Sheets"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
          Sincronizar Sheets
        </Button>

        {/* Notificaciones de Alertas */}
        <button
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Alertas activas del sistema"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* Perfil del Usuario Activo */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-900 leading-tight">
              {userName}
            </span>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                {userEmail}
              </span>
              <Badge
                variant={userRole === "ADMIN" ? "default" : "secondary"}
                className="text-[9px] px-1.5 py-0 uppercase"
              >
                {userRole}
              </Badge>
            </div>
          </div>

          <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 shadow-sm">
            {userName
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>

          {/* Botón Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
