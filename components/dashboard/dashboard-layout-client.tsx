"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";
import { MobileNavBar } from "@/components/dashboard/mobile-nav";
import { cn } from "@/lib/utils";

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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Fijo Desktop a pantalla completa con scroll interno independiente */}
      <Sidebar
        userRole={userRole}
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      {/* Contenedor Principal: margen adaptativo en desktop (ml-0 en mobile para permitir vista completa) */}
      <div
        className={cn(
          "flex flex-col min-h-screen min-w-0 transition-[margin] duration-300 ease-in-out",
          collapsed ? "ml-0 md:ml-16" : "ml-0 md:ml-64"
        )}
      >
        <Navbar userName={userName} userEmail={userEmail} userRole={userRole} />

        {/* Padding inferior aumentado en mobile (pb-24) para que la barra flotante no tape contenido */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Barra de Navegación Flotante Exclusiva para Mobile */}
      <MobileNavBar userRole={userRole} />
    </div>
  );
}
