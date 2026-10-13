"use server";

import { cookies } from "next/headers";
import {
  getAllUsers,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  getCustomUsersList,
  serializeCustomUsers,
  syncCustomUsers,
  StoredUser,
} from "@/lib/users";
import { isSupabaseConfigured } from "@/lib/supabase";
import { CreateUserInput, UpdateUserInput, UserAccount } from "@/types/user";

function saveCustomUsersToCookie(customUsers: StoredUser[]) {
  // Si Supabase / PostgreSQL está activo, la base de datos es la única fuente de verdad
  if (isSupabaseConfigured()) {
    try {
      const cookieStore = cookies();
      cookieStore.delete("portal_custom_users");
    } catch {}
    return;
  }

  try {
    const serialized = serializeCustomUsers(customUsers);
    const cookieStore = cookies();
    cookieStore.set("portal_custom_users", serialized, {
      path: "/",
      maxAge: 365 * 24 * 60 * 60, // 1 año
      sameSite: "lax",
      httpOnly: false, // Accesible por JS para sincronización con LocalStorage en fallback
      secure: process.env.NODE_ENV === "production",
    });
  } catch (err) {
    console.warn("[Users Action] No se pudo guardar la cookie de usuarios:", err);
  }
}

export async function fetchUsersAction(): Promise<{
  success: boolean;
  users: UserAccount[];
  supabaseConfigured: boolean;
  error?: string;
}> {
  try {
    const users = await getAllUsers();
    return { success: true, users, supabaseConfigured: isSupabaseConfigured() };
  } catch (err: any) {
    return {
      success: false,
      users: [],
      supabaseConfigured: isSupabaseConfigured(),
      error: err?.message || "Error al obtener usuarios.",
    };
  }
}

export async function createUserAction(
  data: CreateUserInput
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  try {
    const newUser = await createUser(data);
    const customList = getCustomUsersList();
    saveCustomUsersToCookie(customList);
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
    const customList = getCustomUsersList();
    saveCustomUsersToCookie(customList);
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
    const customList = getCustomUsersList();
    saveCustomUsersToCookie(customList);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Error al restablecer la contraseña." };
  }
}

export async function deleteUserAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = await deleteUser(id);
    if (!ok) return { success: false, error: "Usuario no encontrado o no se puede eliminar." };
    const customList = getCustomUsersList();
    saveCustomUsersToCookie(customList);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Error al eliminar el usuario." };
  }
}

export async function syncCustomUsersAction(
  customUsers: StoredUser[]
): Promise<{ success: boolean; users?: UserAccount[]; error?: string }> {
  try {
    const synced = await syncCustomUsers(customUsers);
    saveCustomUsersToCookie(synced);
    const allUsers = await getAllUsers();
    return { success: true, users: allUsers };
  } catch (err: any) {
    return { success: false, error: err?.message || "Error al sincronizar usuarios." };
  }
}
