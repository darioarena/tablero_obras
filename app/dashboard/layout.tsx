import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  const userName = session?.user?.name || "Arq. Valeria Domínguez";
  const userEmail = session?.user?.email || "admin@portaldeobras.gob.ar";
  const userRole = session?.user?.role || "ADMIN";

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar userName={userName} userEmail={userEmail} userRole={userRole} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
