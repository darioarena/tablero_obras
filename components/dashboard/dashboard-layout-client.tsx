"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";
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
      {/* Sidebar Fijo a pantalla completa con scroll interno independiente */}
      <Sidebar
        userRole={userRole}
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      {/* Contenedor Principal con margen izquierdo adaptativo para no quedar tapado */}
      <div
        className={cn(
          "flex flex-col min-h-screen min-w-0 transition-[margin] duration-300 ease-in-out",
          collapsed ? "ml-16" : "ml-64"
        )}
      >
        <Navbar userName={userName} userEmail={userEmail} userRole={userRole} />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
