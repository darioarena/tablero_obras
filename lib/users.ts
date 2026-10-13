import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { UserAccount, UserRole, UserStatus, CreateUserInput, UpdateUserInput } from "@/types/user";

export interface StoredUser extends UserAccount {
  passwordHash: string;
}

/**
 * Usuarios base predeterminados del sistema (Demo institucional).
 */
export const DEFAULT_USERS: StoredUser[] = [
  {
    id: "usr-001",
    name: "Arq. Valeria Domínguez",
    email: "admin@portaldeobras.gob.ar",
    passwordHash: "Admin1234!",
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
    passwordHash: "Operador1234!",
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
    passwordHash: "Temporal2024!",
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

/**
 * Cache en memoria por proceso/contenedor.
 */
let USERS_STORE: StoredUser[] = [...DEFAULT_USERS];

/**
 * Lee el valor de una cookie de forma segura tanto en Server Actions / Route Handlers
 * como a partir de un header 'Cookie' sin lanzar excepción.
 */
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
  } catch {
    // Fuera de contexto de request (build time o script)
  }

  return null;
}

/**
 * Serializa la lista de usuarios personalizados para la cookie.
 */
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

/**
 * Deserializa la lista de usuarios personalizados desde la cookie.
 */
export function deserializeCustomUsers(cookieValue: string): StoredUser[] {
  if (!cookieValue) return [];

  // Intento 1: Base64
  try {
    const decoded = Buffer.from(cookieValue, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // Intento 2: URI Component
  try {
    const decoded = decodeURIComponent(cookieValue);
    const parsed = JSON.parse(decoded);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // Intento 3: JSON directo
  try {
    const parsed = JSON.parse(cookieValue);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  return [];
}

/**
 * Lee usuarios guardados en disco (data/users.json o /tmp/portal_custom_users.json).
 */
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

/**
 * Escribe usuarios personalizados en disco con tolerancia a entornos read-only como Vercel.
 */
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

/**
 * Obtiene usuarios definidos en variables de entorno (ADMIN_EMAIL, CUSTOM_USERS_JSON).
 */
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
      passwordHash: adminPassword,
      role: "ADMIN",
      status: "active",
      department: "Dirección General de Obras",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    });
  }

  const customUsersJson = process.env.CUSTOM_USERS_JSON;
  if (customUsersJson) {
    try {
      const parsed = JSON.parse(customUsersJson);
      if (Array.isArray(parsed)) {
        parsed.forEach((item, idx) => {
          if (item.email && item.password) {
            result.push({
              id: `usr-env-${idx + 1}`,
              name: item.name || "Usuario del Sistema",
              email: item.email.trim().toLowerCase(),
              passwordHash: String(item.password).trim(),
              role: item.role === "ADMIN" ? "ADMIN" : "OPERADOR",
              status: "active",
              department: item.department || "Infraestructura",
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: new Date().toISOString(),
            });
          }
        });
      }
    } catch (e) {
      console.warn("[Users] Error al parsear CUSTOM_USERS_JSON:", e);
    }
  }

  return result;
}

/**
 * Combina todas las fuentes disponibles:
 * 1. Base DEFAULT_USERS
 * 2. Variables de entorno (ADMIN_EMAIL, CUSTOM_USERS_JSON)
 * 3. Archivo local /tmp/portal_custom_users.json o data/users.json
 * 4. Cache en memoria del proceso
 * 5. Cookie HTTP (portal_custom_users)
 */
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

  // 1. Usuarios demo base
  for (const u of DEFAULT_USERS) {
    putUser(u);
  }

  // 2. Variables de entorno
  for (const u of getEnvUsers()) {
    putUser(u);
  }

  // 3. Archivo en disco
  for (const u of readUsersFromFile()) {
    putUser(u);
  }

  // 4. Cache en memoria
  for (const u of USERS_STORE) {
    putUser(u);
  }

  // 5. Cookie del cliente
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

/**
 * Obtiene la lista de usuarios que no son idénticos a los predeterminados
 * (cuentas nuevas o modificadas) para almacenar en la cookie y archivo.
 */
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

export async function findUserByEmail(email: string, rawCookieHeader?: string): Promise<StoredUser | null> {
  if (!email) return null;
  const all = getMergedUsers(rawCookieHeader);
  const normalized = email.trim().toLowerCase();
  return all.find((u) => u.email.trim().toLowerCase() === normalized) || null;
}

export async function verifyUserCredentials(email: string, passwordPlain: string, rawCookieHeader?: string) {
  if (!email || !passwordPlain) return null;

  const user = await findUserByEmail(email, rawCookieHeader);
  if (!user) return null;
  if (user.status !== "active") return null;

  const inputPass = passwordPlain.trim();
  const storedPass = user.passwordHash.trim();

  // Validación de credenciales: texto exacto o recortado
  if (inputPass === storedPass || passwordPlain === user.passwordHash) {
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  return null;
}

export async function getAllUsers(rawCookieHeader?: string): Promise<UserAccount[]> {
  const all = getMergedUsers(rawCookieHeader);
  return all.map(({ passwordHash: _, ...safeUser }) => safeUser);
}

export async function createUser(input: CreateUserInput, rawCookieHeader?: string): Promise<UserAccount> {
  const allUsers = getMergedUsers(rawCookieHeader);
  const normalizedEmail = input.email.trim().toLowerCase();

  const existing = allUsers.find((u) => u.email.trim().toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error("Ya existe un usuario con el correo electrónico especificado.");
  }

  const newUser: StoredUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: input.name.trim(),
    email: normalizedEmail,
    passwordHash: input.password?.trim() || "ClaveTemporal2024!",
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
    passwordHash: input.newPassword?.trim() ? input.newPassword.trim() : current.passwordHash,
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
  const allUsers = getMergedUsers(rawCookieHeader);
  const user = allUsers.find((u) => u.id === id);
  if (!user) return false;

  user.passwordHash = newPasswordPlain.trim();
  user.updatedAt = new Date().toISOString();
  USERS_STORE = allUsers;
  const customList = getCustomUsersList();
  writeUsersToFile(customList);
  return true;
}

export async function deleteUser(id: string, rawCookieHeader?: string): Promise<boolean> {
  const allUsers = getMergedUsers(rawCookieHeader);
  const index = allUsers.findIndex((u) => u.id === id);
  if (index === -1) return false;

  if (allUsers[index].id === "usr-001") {
    throw new Error("No es posible eliminar el usuario administrador principal del sistema.");
  }

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
      current.push({
        ...inc,
        id: inc.id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        passwordHash: inc.passwordHash || "ClaveTemporal2024!",
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
