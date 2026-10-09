"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  CheckCircle,
  XCircle,
  MoreVertical,
  Search,
  Filter,
  AlertCircle,
  X,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { UserAccount, UserRole, UserStatus } from "@/types/user";

// Datos iniciales de usuarios
const INITIAL_USERS: UserAccount[] = [
  {
    id: "usr-001",
    name: "Arq. Valeria Domínguez",
    email: "admin@portaldeobras.gob.ar",
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
    role: "OPERADOR",
    status: "inactive",
    department: "Auditoría Contable y Certificaciones",
    createdAt: "2024-04-05T08:00:00Z",
    updatedAt: "2024-08-12T16:00:00Z",
    lastLogin: "2024-08-10T12:00:00Z",
  },
];

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");

  // Estados de Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Formulario de Alta
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "OPERADOR" as UserRole,
    department: "",
    password: "",
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const newUser: UserAccount = {
      id: `usr-${String(users.length + 1).padStart(3, "0")}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: "active",
      department: formData.department || "Infraestructura",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: "-",
    };

    setUsers([newUser, ...users]);
    setIsCreateModalOpen(false);
    setFormData({ name: "", email: "", role: "OPERADOR", department: "", password: "" });
    setNotification(`Usuario "${newUser.name}" creado con éxito.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggleStatus = (id: string) => {
    setUsers(
      users.map((u) => {
        if (u.id === id) {
          const newStatus: UserStatus = u.status === "active" ? "inactive" : "active";
          return { ...u, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return u;
      })
    );
  };

  const handleRoleChange = (id: string, newRole: UserRole) => {
    setUsers(
      users.map((u) => {
        if (u.id === id) {
          return { ...u, role: newRole, updatedAt: new Date().toISOString() };
        }
        return u;
      })
    );
  };

  const handleConfirmPasswordReset = () => {
    if (!selectedUser || !newPassword) return;
    setNotification(
      `Contraseña del usuario ${selectedUser.name} restablecida exitosamente.`
    );
    setIsResetModalOpen(false);
    setSelectedUser(null);
    setNewPassword("");
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Notificación Flotante */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Administración de Usuarios y Permisos
            </h1>
            <Badge variant="default" className="text-[10px] bg-amber-500">
              SOLO ADMIN
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Módulo ABM de cuentas institucionales, asignación de roles (ADMIN / OPERADOR) y políticas de acceso.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 shadow-sm text-xs"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Tabla y Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Buscador */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, correo o área..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Filtro por Rol */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Filtrar Rol:</span>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none"
              >
                <option value="ALL">Todos los roles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="OPERADOR">OPERADOR</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Usuario / Email</th>
                  <th className="py-3 px-4">Área / Repartición</th>
                  <th className="py-3 px-4">Rol Asignado</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Fecha Alta</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    {/* Usuario */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-500">{user.email}</div>
                    </td>

                    {/* Área */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {user.department || "No asignado"}
                    </td>

                    {/* Rol con selector rápido */}
                    <td className="py-3.5 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className={`text-xs font-semibold px-2 py-1 rounded border cursor-pointer ${
                          user.role === "ADMIN"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-slate-100 text-slate-800 border-slate-300"
                        }`}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="OPERADOR">OPERADOR</option>
                      </select>
                    </td>

                    {/* Estado con Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className="inline-flex items-center gap-1.5 focus:outline-none"
                        title="Click para cambiar estado"
                      >
                        <Badge variant={user.status === "active" ? "active" : "inactive"}>
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              user.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {user.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </button>
                    </td>

                    {/* Fecha de Creación */}
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsResetModalOpen(true);
                          }}
                          className="h-7 text-[11px] gap-1 px-2 text-slate-600"
                          title="Restablecer clave de acceso"
                        >
                          <KeyRound className="w-3 h-3 text-slate-500" />
                          Reset Clave
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* MODAL: ALTA DE NUEVO USUARIO */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-dropdown max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Alta de Nuevo Usuario</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nombre Completo y Título</label>
                <Input
                  required
                  placeholder="Ej: Ing. Martín González"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Correo Electrónico Institucional</label>
                <Input
                  type="email"
                  required
                  placeholder="ejemplo@portaldeobras.gob.ar"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Área / Dirección</label>
                <Input
                  placeholder="Ej: Dirección de Vialidad y Puentes"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Rol</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs bg-white text-slate-800"
                  >
                    <option value="OPERADOR">OPERADOR (Estándar)</option>
                    <option value="ADMIN">ADMIN (Acceso Total)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Contraseña Inicial</label>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm">
                  Crear Usuario
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESETEO DE CONTRASEÑA */}
      {/* ========================================================================= */}
      {isResetModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-dropdown max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Restablecer Contraseña</h3>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-slate-600">
                Se actualizará la contraseña para <strong>{selectedUser.name}</strong> (
                {selectedUser.email}).
              </p>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nueva Contraseña Provisoria</label>
                <Input
                  type="password"
                  placeholder="Ingrese la nueva clave..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsResetModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!newPassword}
                  onClick={handleConfirmPasswordReset}
                >
                  Guardar Nueva Clave
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
