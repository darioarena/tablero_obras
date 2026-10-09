import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";

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
    <DashboardLayoutClient
      userName={userName}
      userEmail={userEmail}
      userRole={userRole}
    >
      {children}
    </DashboardLayoutClient>
  );
}
