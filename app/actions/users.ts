"use server";

import {
  getAllUsers,
  createUser,
  updateUser,
  resetUserPassword,
} from "@/lib/users";
import { CreateUserInput, UpdateUserInput, UserAccount } from "@/types/user";

export async function fetchUsersAction(): Promise<{
  success: boolean;
  users: UserAccount[];
  error?: string;
}> {
  try {
    const users = await getAllUsers();
    return { success: true, users };
  } catch (err: any) {
    return { success: false, users: [], error: err?.message || "Error al obtener usuarios." };
  }
}

export async function createUserAction(
  data: CreateUserInput
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  try {
    const newUser = await createUser(data);
    return { success: true, user: newUser };
  } catch (err: any) {
    return { success: false, error: err?.message || "Error al crear el usuario." };
  }
}

export async function updateUserAction(
  id: string,
  data: UpdateUserInput
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  try {
    const updated = await updateUser(id, data);
    return { success: true, user: updated };
  } catch (err: any) {
    return { success: false, error: err?.message || "Error al actualizar el usuario." };
  }
}

export async function resetPasswordAction(
  id: string,
  newPasswordPlain: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = await resetUserPassword(id, newPasswordPlain);
    if (!ok) return { success: false, error: "Usuario no encontrado." };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Error al restablecer la contraseña." };
  }
}
