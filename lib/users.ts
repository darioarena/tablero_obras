import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { UserAccount, UserRole, UserStatus, CreateUserInput, UpdateUserInput } from "@/types/user";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";

if (typeof window !== "undefined") {
  throw new Error("[Security] lib/users solo puede ejecutarse en el servidor.");
}

export interface StoredUser extends UserAccount {
  passwordHash: string;
}

/**
 * Hashes pre-calculados con bcrypt (cost 10) para usuarios de contingencia / demo inicial.
 * NUNCA se almacenan contraseñas en texto plano.
 * - Admin1234!    -> $2b$10$iLPutEjROT0ubuGttLIvvevB1SlY4lcJ6DJ5zBSwAlATbiftbbgKe
 * - Operador1234! -> $2b$10$UxCo0P7BP3gFeLmuH53UKeliVoUKx2uYEBCm.0/bp8ioZqiRTTYpq
 * - Temporal2024! -> $2b$10$wcu1TI3Sin/RuhF.WOjIE.m/r9K.ky3E2QVNvD01NoIt7ZIq11B.W
 */
export const DEFAULT_USERS: StoredUser[] = [
  {
    id: "usr-001",
    name: "Arq. Valeria Domínguez",
    email: "admin@portaldeobras.gob.ar",
    passwordHash: "$2b$10$iLPutEjROT0ubuGttLIvvevB1SlY4lcJ6DJ5zBSwAlATbiftbbgKe",
    role: "ADMIN",
    status: "active",
    department: "Dirección General de Obras Públicas",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-10-01T14:30:00Z",
    lastLogin: "2024-10-09T08:15:00Z",
  },
  {
    id: "usr-002",
    name: "Ing. Martín Morales",
    email: "operador@portaldeobras.gob.ar",
    passwordHash: "$2b$10$UxCo0P7BP3gFeLmuH53UKeliVoUKx2uYEBCm.0/bp8ioZqiRTTYpq",
    role: "OPERADOR",
    status: "active",
    department: "Supervisión de Inspecciones e Informática",
    createdAt: "2024-02-15T11:20:00Z",
    updatedAt: "2024-09-20T10:00:00Z",
    lastLogin: "2024-10-08T17:40:00Z",
  },
  {
    id: "usr-003",
    name: "Lic. Luciana Gómez",
    email: "luciana.gomez@portaldeobras.gob.ar",
    passwordHash: "$2b$10$wcu1TI3Sin/RuhF.WOjIE.m/r9K.ky3E2QVNvD01NoIt7ZIq11B.W",
    role: "OPERADOR",
    status: "inactive",
    department: "Auditoría Contable y Certificaciones",
    createdAt: "2024-04-05T08:00:00Z",
    updatedAt: "2024-08-12T16:00:00Z",
    lastLogin: "2024-08-10T12:00:00Z",
  },
];

const LOCAL_DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_USERS_FILE = path.join(LOCAL_DATA_DIR, "users.json");
const TMP_USERS_FILE = path.join("/tmp", "portal_custom_users.json");

let USERS_STORE: StoredUser[] = [...DEFAULT_USERS];
let isSeededInSupabase = false;

// ============================================================================
// FUNCIONES CRIPTOGRÁFICAS (BCRYPT)
// ============================================================================

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword.trim(), 10);
}

export async function comparePassword(plainPassword: string, hash: string): Promise<boolean> {
  if (!plainPassword || !hash) return false;
  if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
    return bcrypt.compare(plainPassword.trim(), hash);
  }
  // Fallback temporal si existía un registro previo sin hashear durante la migración
  return plainPassword.trim() === hash.trim();
}

// ============================================================================
// SUPABASE / POSTGRESQL INTEGRATION
// ============================================================================

/**
 * Asegura que el usuario administrador inicial exista en Supabase a partir
 * de las variables de entorno ADMIN_EMAIL y ADMIN_PASSWORD.
 */
export async function ensureAdminUserInSupabase(): Promise<void> {
  if (isSeededInSupabase || !isSupabaseConfigured()) return;

  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const adminName = process.env.ADMIN_NAME?.trim() || "Administrador del Sistema";

  if (!adminEmail || !adminPassword) {
    isSeededInSupabase = true;
    return;
  }

  try {
    const { data: existing } = await supabase
      .from("users")
      .select("id, email, password_hash")
      .ilike("email", adminEmail)
      .maybeSingle();

    if (!existing) {
      const hashed = await hashPassword(adminPassword);
      await supabase.from("users").insert([
        {
          name: adminName,
          email: adminEmail,
          password_hash: hashed,
          role: "ADMIN",
          status: "active",
          department: "Dirección General de Obras",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      console.log(`[Supabase] Usuario administrador creado automáticamente: ${adminEmail}`);
    } else {
      // Si la contraseña en env cambió, actualizar su hash
      const matches = await comparePassword(adminPassword, existing.password_hash);
      if (!matches) {
        const newHash = await hashPassword(adminPassword);
        await supabase
          .from("users")
          .update({ password_hash: newHash, role: "ADMIN", status: "active", updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        console.log(`[Supabase] Hash de contraseña actualizado para: ${adminEmail}`);
      }
    }
    isSeededInSupabase = true;
  } catch (err) {
    console.warn("[Supabase] Error en ensureAdminUserInSupabase:", (err as any)?.message || err);
  }
}

// ============================================================================
// PERSISTENCIA DE CONTINGENCIA / LOCAL (Archivos y Cookies)
// ============================================================================

export function getCookieValueSafely(cookieName: string, rawCookieHeader?: string): string | null {
  if (rawCookieHeader) {
    const match = rawCookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`));
    if (match && match[1]) {
      return match[1];
    }
  }

  try {
    const cookieStore = cookies();
    const c = cookieStore.get(cookieName);
    if (c?.value) return c.value;
  } catch {}

  return null;
}

export function serializeCustomUsers(users: StoredUser[]): string {
  const compact = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email.trim().toLowerCase(),
    passwordHash: u.passwordHash,
    role: u.role,
    status: u.status,
    department: u.department || "",
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));

  const json = JSON.stringify(compact);
  return Buffer.from(json, "utf-8").toString("base64");
}

export function deserializeCustomUsers(cookieValue: string): StoredUser[] {
  if (!cookieValue) return [];

  try {
    const decoded = Buffer.from(cookieValue, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  try {
    const decoded = decodeURIComponent(cookieValue);
    const parsed = JSON.parse(decoded);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  return [];
}

export function readUsersFromFile(): StoredUser[] {
  try {
    if (fs.existsSync(LOCAL_USERS_FILE)) {
      const data = fs.readFileSync(LOCAL_USERS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  try {
    if (fs.existsSync(TMP_USERS_FILE)) {
      const data = fs.readFileSync(TMP_USERS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  return [];
}

export function writeUsersToFile(users: StoredUser[]) {
  const json = JSON.stringify(users, null, 2);
  let written = false;

  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_USERS_FILE, json, "utf-8");
    written = true;
  } catch {}

  if (!written) {
    try {
      fs.writeFileSync(TMP_USERS_FILE, json, "utf-8");
    } catch {}
  }
}

function getEnvUsers(): StoredUser[] {
  const result: StoredUser[] = [];
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const adminName = process.env.ADMIN_NAME?.trim() || "Administrador del Sistema";

  if (adminEmail && adminPassword) {
    result.push({
      id: "usr-admin-env",
      name: adminName,
      email: adminEmail,
      // Se hashea en tiempo de ejecución si se usa el fallback
      passwordHash: bcrypt.hashSync(adminPassword, 10),
      role: "ADMIN",
      status: "active",
      department: "Dirección General de Obras",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    });
  }

  return result;
}

export function getMergedUsers(rawCookieHeader?: string): StoredUser[] {
  const userMap = new Map<string, StoredUser>();

  const putUser = (user: StoredUser) => {
    if (!user || !user.email) return;
    const normEmail = user.email.trim().toLowerCase();
    const existing = userMap.get(normEmail);
    if (existing) {
      userMap.set(normEmail, { ...existing, ...user, email: normEmail });
    } else {
      userMap.set(normEmail, { ...user, email: normEmail });
    }
  };

  for (const u of DEFAULT_USERS) {
    putUser(u);
  }

  for (const u of getEnvUsers()) {
    putUser(u);
  }

  for (const u of readUsersFromFile()) {
    putUser(u);
  }

  for (const u of USERS_STORE) {
    putUser(u);
  }

  const cookieVal = getCookieValueSafely("portal_custom_users", rawCookieHeader);
  if (cookieVal) {
    const cookieUsers = deserializeCustomUsers(cookieVal);
    for (const u of cookieUsers) {
      putUser(u);
    }
  }

  const merged = Array.from(userMap.values());
  USERS_STORE = merged;
  return merged;
}

export function getCustomUsersList(rawCookieHeader?: string): StoredUser[] {
  const all = getMergedUsers(rawCookieHeader);
  const defaultEmails = new Set(DEFAULT_USERS.map((u) => u.email.trim().toLowerCase()));

  return all.filter((u) => {
    const norm = u.email.trim().toLowerCase();
    if (!defaultEmails.has(norm)) return true;

    const original = DEFAULT_USERS.find((d) => d.email.trim().toLowerCase() === norm);
    if (!original) return true;

    return (
      original.role !== u.role ||
      original.status !== u.status ||
      original.passwordHash !== u.passwordHash ||
      original.name !== u.name ||
      original.department !== u.department
    );
  });
}

// ============================================================================
// SERVICIOS PÚBLICOS DE USUARIOS (SUPABASE PRIORITY CON FALLBACK SEGURO)
// ============================================================================

export async function findUserByEmail(email: string, rawCookieHeader?: string): Promise<StoredUser | null> {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();

  // 1. Intentar consultar Supabase / PostgreSQL
  if (isSupabaseConfigured()) {
    await ensureAdminUserInSupabase();
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, name, email, password_hash, role, status, department, created_at, updated_at, last_login")
          .ilike("email", normalized)
          .maybeSingle();

        if (data && !error) {
          return {
            id: data.id,
            name: data.name,
            email: data.email,
            passwordHash: data.password_hash,
            role: data.role as UserRole,
            status: data.status as UserStatus,
            department: data.department || "Infraestructura",
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            lastLogin: data.last_login,
          };
        }
      } catch (err) {
        console.warn("[Supabase] Falló consulta findUserByEmail, usando fallback:", (err as any)?.message || err);
      }
    }
  }

  // 2. Fallback de contingencia (memoria/cookie)
  const all = getMergedUsers(rawCookieHeader);
  return all.find((u) => u.email.trim().toLowerCase() === normalized) || null;
}

export async function verifyUserCredentials(email: string, passwordPlain: string, rawCookieHeader?: string) {
  if (!email || !passwordPlain) return null;

  const user = await findUserByEmail(email, rawCookieHeader);
  if (!user) return null;
  if (user.status !== "active") return null;

  const isPasswordValid = await comparePassword(passwordPlain, user.passwordHash);
  if (!isPasswordValid) return null;

  // Registrar último inicio de sesión en Supabase
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        await supabase
          .from("users")
          .update({ last_login: new Date().toISOString() })
          .eq("id", user.id);
      } catch {}
    }
  }

  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export async function getAllUsers(rawCookieHeader?: string): Promise<UserAccount[]> {
  // 1. Si Supabase está configurado, es la fuente de verdad única
  if (isSupabaseConfigured()) {
    await ensureAdminUserInSupabase();
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, name, email, role, status, department, created_at, updated_at, last_login")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          return data.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role as UserRole,
            status: u.status as UserStatus,
            department: u.department || "Infraestructura",
            createdAt: u.created_at,
            updatedAt: u.updated_at,
            lastLogin: u.last_login,
          }));
        }
      } catch (err) {
        console.warn("[Supabase] Error en getAllUsers, usando fallback:", (err as any)?.message || err);
      }
    }
  }

  // 2. Fallback de contingencia
  const all = getMergedUsers(rawCookieHeader);
  return all.map(({ passwordHash: _, ...safeUser }) => safeUser);
}

export async function createUser(input: CreateUserInput, rawCookieHeader?: string): Promise<UserAccount> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(normalizedEmail, rawCookieHeader);
  if (existing) {
    throw new Error("Ya existe un usuario con el correo electrónico especificado.");
  }

  const passwordHash = await hashPassword(input.password || "ClaveTemporal2024!");

  // 1. Guardar en Supabase si está disponible
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            name: input.name.trim(),
            email: normalizedEmail,
            password_hash: passwordHash,
            role: input.role,
            status: "active",
            department: input.department?.trim() || "Infraestructura",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select("id, name, email, role, status, department, created_at, updated_at, last_login")
        .single();

      if (error || !data) {
        throw new Error(`Error en Supabase al crear usuario: ${error?.message || "Operación fallida"}`);
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        status: data.status as UserStatus,
        department: data.department || "Infraestructura",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        lastLogin: data.last_login,
      };
    }
  }

  // 2. Fallback en memoria / archivo / cookie
  const newUser: StoredUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: input.name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: input.role,
    status: "active",
    department: input.department?.trim() || "Infraestructura",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  USERS_STORE.push(newUser);
  const customList = getCustomUsersList();
  writeUsersToFile(customList);

  const { passwordHash: _, ...safeUser } = newUser;
  return safeUser;
}

export async function updateUser(id: string, input: UpdateUserInput, rawCookieHeader?: string): Promise<UserAccount> {
  // 1. Actualizar en Supabase si está activo
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const updatePayload: any = {
        updated_at: new Date().toISOString(),
      };
      if (input.name !== undefined) updatePayload.name = input.name.trim();
      if (input.role !== undefined) updatePayload.role = input.role;
      if (input.status !== undefined) updatePayload.status = input.status;
      if (input.department !== undefined) updatePayload.department = input.department.trim();
      if (input.newPassword) {
        updatePayload.password_hash = await hashPassword(input.newPassword);
      }

      const { data, error } = await supabase
        .from("users")
        .update(updatePayload)
        .eq("id", id)
        .select("id, name, email, role, status, department, created_at, updated_at, last_login")
        .single();

      if (error || !data) {
        throw new Error(`Error en Supabase al actualizar usuario: ${error?.message || "Usuario no encontrado"}`);
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        status: data.status as UserStatus,
        department: data.department || "Infraestructura",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        lastLogin: data.last_login,
      };
    }
  }

  // 2. Fallback
  const allUsers = getMergedUsers(rawCookieHeader);
  const index = allUsers.findIndex((u) => u.id === id);
  if (index === -1) {
    throw new Error("Usuario no encontrado.");
  }

  const current = allUsers[index];
  const updated: StoredUser = {
    ...current,
    name: input.name?.trim() ?? current.name,
    role: input.role ?? current.role,
    status: input.status ?? current.status,
    department: input.department?.trim() ?? current.department,
    passwordHash: input.newPassword?.trim() ? await hashPassword(input.newPassword) : current.passwordHash,
    updatedAt: new Date().toISOString(),
  };

  allUsers[index] = updated;
  USERS_STORE = allUsers;
  const customList = getCustomUsersList();
  writeUsersToFile(customList);

  const { passwordHash: _, ...safeUser } = updated;
  return safeUser;
}

export async function resetUserPassword(id: string, newPasswordPlain: string, rawCookieHeader?: string): Promise<boolean> {
  const newHash = await hashPassword(newPasswordPlain);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { error } = await supabase
        .from("users")
        .update({ password_hash: newHash, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) {
        throw new Error(`Error al restablecer contraseña en Supabase: ${error.message}`);
      }
      return true;
    }
  }

  const allUsers = getMergedUsers(rawCookieHeader);
  const user = allUsers.find((u) => u.id === id);
  if (!user) return false;

  user.passwordHash = newHash;
  user.updatedAt = new Date().toISOString();
  USERS_STORE = allUsers;
  const customList = getCustomUsersList();
  writeUsersToFile(customList);
  return true;
}

export async function deleteUser(id: string, rawCookieHeader?: string): Promise<boolean> {
  if (id === "usr-001") {
    throw new Error("No es posible eliminar el usuario administrador principal del sistema.");
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) {
        throw new Error(`Error al eliminar usuario en Supabase: ${error.message}`);
      }
      return true;
    }
  }

  const allUsers = getMergedUsers(rawCookieHeader);
  const index = allUsers.findIndex((u) => u.id === id);
  if (index === -1) return false;

  allUsers.splice(index, 1);
  USERS_STORE = allUsers;
  const customList = getCustomUsersList();
  writeUsersToFile(customList);
  return true;
}

export async function syncCustomUsers(incomingUsers: StoredUser[]): Promise<StoredUser[]> {
  if (!Array.isArray(incomingUsers) || incomingUsers.length === 0) {
    return getCustomUsersList();
  }

  const current = getMergedUsers();
  for (const inc of incomingUsers) {
    if (!inc.email) continue;
    const norm = inc.email.trim().toLowerCase();
    const idx = current.findIndex((u) => u.email.trim().toLowerCase() === norm);
    if (idx >= 0) {
      current[idx] = { ...current[idx], ...inc };
    } else {
      const hash = inc.passwordHash && (inc.passwordHash.startsWith("$2a$") || inc.passwordHash.startsWith("$2b$"))
        ? inc.passwordHash
        : await hashPassword(inc.passwordHash || "ClaveTemporal2024!");

      current.push({
        ...inc,
        id: inc.id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        passwordHash: hash,
        status: inc.status || "active",
        createdAt: inc.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  USERS_STORE = current;
  const customList = getCustomUsersList();
  writeUsersToFile(customList);
  return customList;
}
