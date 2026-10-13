"use client";

import React from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { FloatingNavBar } from "@/components/dashboard/mobile-nav";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  userRole: string;
}

export function DashboardLayoutClient({
  children,
  userName,
  userEmail,
  userRole,
}: DashboardLayoutClientProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Navbar Superior con Branding Institucional, Búsqueda, Período y Perfil */}
      <Navbar userName={userName} userEmail={userEmail} userRole={userRole} />

      {/* Contenedor Principal: Aprovecha el ancho completo de pantalla (Full Width) */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 md:p-8 lg:p-10 pb-28 sm:pb-36 transition-all">
        {children}
      </main>

      {/* Barra de Navegación Flotante Unificada tipo Dock iOS / macOS */}
      <FloatingNavBar userRole={userRole} />
    </div>
  );
}
