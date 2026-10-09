"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  HardHat,
  BarChart3,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validaciones en tiempo real
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isEmailValid) {
      setErrorMessage("Por favor, ingrese una dirección de correo electrónico válida.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPassword = password.trim();

      const res = await signIn("credentials", {
        redirect: false,
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      if (!res || res.error) {
        if (res?.error === "Configuration") {
          setErrorMessage(
            "Error de configuración del servidor de autenticación (NEXTAUTH_SECRET). Verifique las variables de entorno en Vercel."
          );
        } else {
          setErrorMessage("Credenciales incorrectas o usuario inhabilitado. Verifique sus datos.");
        }
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setErrorMessage("Ocurrió un error al comunicarse con el servidor de autenticación.");
      setIsLoading(false);
    }
  };

  // Ayudante de credenciales para demostración / testing inicial
  const setDemoCredentials = (role: "ADMIN" | "OPERADOR") => {
    if (role === "ADMIN") {
      setEmail("admin@portaldeobras.gob.ar");
      setPassword("Admin1234!");
    } else {
      setEmail("operador@portaldeobras.gob.ar");
      setPassword("Operador1234!");
    }
    setErrorMessage(null);
  };

  return (
    <main className="min-h-screen w-full flex bg-background font-sans antialiased">
      {/* ========================================================================= */}
      {/* PANEL LATERAL: FORMULARIO DE ACCESO (40% - 45%) */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-white border-r border-slate-200/80 shadow-sm z-10">
        {/* Cabecera / Identidad */}
        <div>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/10">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                PORTAL DE OBRAS
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Gestión Integral de Infraestructura
              </span>
            </div>
          </div>

          <div className="mt-12">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Iniciar Sesión
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Ingrese con sus credenciales institucionales para acceder al tablero de control y
              seguimiento de obras.
            </p>
          </div>

          {/* Banner de Error */}
          {errorMessage && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Campo Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="nombre.apellido@portaldeobras.gob.ar"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 text-sm"
                  error={email.length > 0 && !isEmailValid}
                />
              </div>
              {email.length > 0 && !isEmailValid && (
                <p className="text-[11px] text-rose-600 font-medium">
                  El formato del correo electrónico no es válido.
                </p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Contraseña
                </label>
                <a
                  href="#recuperar"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Por favor comuníquese con el Administrador del Sistema para restablecer su clave.");
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  ¿Olvidó su contraseña?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Botón de Ingreso */}
            <Button
              type="submit"
              size="lg"
              className="w-full mt-2 font-semibold shadow-md shadow-slate-900/10 hover:shadow-slate-900/20"
              isLoading={isLoading}
              disabled={isLoading || !email || !password}
            >
              Iniciar Sesión
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Acceso Rápido Demo (Testing Inicial de Roles) */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Accesos Demo (Fase 1)
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials("ADMIN")}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200/60"
              >
                Cargar Rol Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("OPERADOR")}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200/60"
              >
                Cargar Rol Operador
              </button>
            </div>
          </div>
        </div>

        {/* Footer Institucional del Formulario */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
          <p>
            Acceso restringido a personal técnico y directivo acreditado. Todas las sesiones son
            auditadas de acuerdo al régimen de trazabilidad pública y transparencia de obra.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PANEL HERO / VISUAL (55% - 60%) */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#0b1d30] via-[#102a43] to-[#243b53] text-white flex-col justify-between p-12 xl:p-16 overflow-hidden">
        {/* Grilla isométrica arquitectónica sutil de fondo (Blueprint SVG) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="archGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
                <circle cx="40" cy="0" r="1.5" fill="#FFFFFF" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#archGrid)" />
          </svg>
        </div>

        {/* Círculo de luz ambiental */}
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Superior del Hero */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Sistema en Línea • Google Sheets Sync Activo
          </div>
          <span className="text-xs text-slate-400 font-mono">v1.0.0 Enterprise</span>
        </div>

        {/* Contenido Central / Claim del Proyecto */}
        <div className="relative z-10 max-w-xl my-auto py-8">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-300">
            Monitoreo y Fiscalización
          </span>
          <h2 className="mt-3 text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
            Control, Transparencia y Eficiencia en la Obra Pública
          </h2>
          <p className="mt-4 text-base text-slate-300 leading-relaxed font-light">
            Visualización consolidada de proyectos viales, hidráulicos y de arquitectura.
            Seguimiento de curvas de avance físico vs. financiero, fiscalización de contratistas y
            detección temprana de desvíos presupuestarios.
          </p>

          {/* Cards de características clave */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <HardHat className="w-5 h-5 text-amber-400 mb-2" />
              <div className="text-xs font-semibold text-white">Obras en Tiempo Real</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Control de avance físico</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <BarChart3 className="w-5 h-5 text-blue-400 mb-2" />
              <div className="text-xs font-semibold text-white">Certificaciones</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Conciliación financiera</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="text-xs font-semibold text-white">Auditoría Segura</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Permisos ADMIN y Operador</div>
            </div>
          </div>
        </div>

        {/* Footer Hero */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>Infraestructura Digital Segura</span>
          </div>
          <div>Dirección de Transformación Digital y Control de Gestión</div>
        </div>
      </div>
    </main>
  );
}
