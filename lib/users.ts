import { UserAccount, CreateUserInput, UpdateUserInput } from "@/types/user";

let USERS_STORE: (UserAccount & { passwordHash: string })[] = [
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

export async function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return USERS_STORE.find((u) => u.email.toLowerCase() === normalized) || null;
}

export async function verifyUserCredentials(email: string, passwordPlain: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  if (user.status !== "active") return null;

  if (user.passwordHash === passwordPlain) {
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  return null;
}

export async function getAllUsers(): Promise<UserAccount[]> {
  return USERS_STORE.map(({ passwordHash: _, ...safeUser }) => safeUser);
}

export async function createUser(input: CreateUserInput): Promise<UserAccount> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new Error("Ya existe un usuario con el correo electrónico especificado.");
  }

  const newUser = {
    id: `usr-${String(USERS_STORE.length + 1).padStart(3, "0")}`,
    name: input.name,
    email: input.email.trim().toLowerCase(),
    passwordHash: input.password || "ClaveTemporal2024!",
    role: input.role,
    status: "active" as const,
    department: input.department || "Infraestructura",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  USERS_STORE.push(newUser);
  const { passwordHash: _, ...safeUser } = newUser;
  return safeUser;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<UserAccount> {
  const index = USERS_STORE.findIndex((u) => u.id === id);
  if (index === -1) {
    throw new Error("Usuario no encontrado.");
  }

  const current = USERS_STORE[index];
  const updated = {
    ...current,
    name: input.name ?? current.name,
    role: input.role ?? current.role,
    status: input.status ?? current.status,
    department: input.department ?? current.department,
    passwordHash: input.newPassword ? input.newPassword : current.passwordHash,
    updatedAt: new Date().toISOString(),
  };

  USERS_STORE[index] = updated;
  const { passwordHash: _, ...safeUser } = updated;
  return safeUser;
}

export async function resetUserPassword(id: string, newPasswordPlain: string): Promise<boolean> {
  const user = USERS_STORE.find((u) => u.id === id);
  if (!user) return false;
  user.passwordHash = newPasswordPlain;
  user.updatedAt = new Date().toISOString();
  return true;
}
