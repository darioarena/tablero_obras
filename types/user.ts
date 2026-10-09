import { UserRole } from "./auth";

export type UserStatus = "active" | "inactive";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  department?: string;
}

export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  newPassword?: string;
}
