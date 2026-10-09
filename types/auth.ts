import { UserRole } from "./user";

export type { UserRole };

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status: "active" | "inactive";
}

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }

  interface User extends SessionUser {}
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: "active" | "inactive";
  }
}
