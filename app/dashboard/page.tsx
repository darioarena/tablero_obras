import React from "react";
import Link from "next/link";
import {
  Layers,
  HardHat,
  Receipt,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Building2,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  getDashboardMetrics,
  getAlertas,
  getAvanceMensual,
  getObras,
  getCertificaciones,
} from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Datos sincronizados desde el servicio de Google Sheets con caché de servidor
  const metrics = await getDashboardMetrics();
  const alertas = await getAlertas();
  const avanceMensual = await getAvanceMensual();
  const obras = await getObras();
  const certificaciones = await getCertificaciones();

  // Cálculos consolidados para el Hero
  const totalContratado = obras.reduce((acc, o) => acc + (o.montoContratado || 0), 0);
  const porcentajeCertificadoGlobal =
    totalContratado > 0
      ? (metrics.montoCertificadoAcumulado / totalContratado) * 100
      : 64.8;

  // Fecha actual en español amigable
  const hoy = new Date();
  const fechaFormateada = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(hoy);
  const fechaCapitalizada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

  return (
    <div className="space-y-6 sm:space-y-8 font-sans antialiased">
      {/* ========================================================================= */}
      {/* 1. TARJETA PRINCIPAL HERO (BENTO KPI HEADER ESTILO iOS) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#1E293B] to-slate-900 text-white p-6 sm:p-8 lg:p-10 border border-slate-800 shadow-xl shadow-slate-950/10">
        {/* Grilla isométrica técnica sutil de fondo (Blueprint SVG) */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        {/* Resplandor radial de luz ambiental suave */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 sm:space-y-8">
          {/* Fila Superior: Bienvenida Institucional + Fecha + Estado */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-200 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>Portal de Infraestructura Pública</span>
                <span className="text-white/40">•</span>
                <span className="text-white/80">{fechaCapitalizada}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-medium backdrop-blur-md">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Google Sheets Conectado</span>
              </span>
            </div>
          </div>

          {/* Bloque Central: Monto Certificado Acumulado + Barra de Avance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Monto Total Certificado Acumulado
                </span>
                <span className="inline-flex items-center text-xs font-semibold text-emerald-400 gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <TrendingUp className="w-3 h-3" />
                  +{metrics.montoVariacionPorcentual}% vs. mes previo
                </span>
              </div>

              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {formatCurrency(metrics.montoCertificadoAcumulado)}
              </div>

              {/* Barra de Avance Porcentual */}
              <div className="space-y-2 pt-2 max-w-2xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    Avance Financiero: <strong>{porcentajeCertificadoGlobal.toFixed(1)}%</strong>
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Presupuesto Contratado: {formatCurrency(totalContratado)}
                  </span>
                </div>

                <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-md p-0.5 border border-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${Math.min(porcentajeCertificadoGlobal, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-blue-400" />
                    Avance físico promedio ponderado:{" "}
                    <strong className="text-white font-semibold">{metrics.avancePromedioFisico.toFixed(1)}%</strong>
                  </span>
                  <span>ARS / Índices INDEC</span>
                </div>
              </div>
            </div>

            {/* Sub-tarjetas Tipo Píldora Interna (3 Métricas de Respaldo) */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
              {/* Píldora 1: Obras Activas */}
              <Link
                href="/dashboard/obras"
                className="group p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white leading-tight">
                      {metrics.totalObrasEjecucion}
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium">Obras en Ejecución</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/30">
                  +{metrics.totalObrasVariacionMes} mes
                </span>
              </Link>

              {/* Píldora 2: Contratistas Activos */}
              <Link
                href="/dashboard/contratistas"
                className="group p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
                    <HardHat className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white leading-tight">
                      {metrics.contratistasActivosCount}
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium">Contratistas Activos</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30">
                  100% al día
                </span>
              </Link>

              {/* Píldora 3: Alertas Críticas */}
              <Link
                href="#alertas-operativas"
                className="group p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white leading-tight">
                      {metrics.alertasAltaCount}
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium">Alertas Severidad Alta</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-200 border border-rose-500/30 animate-pulse">
                  {metrics.alertasActivasCount} totales
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. GRILLA BENTO GRID EN EL CUERPO */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ======================================================================= */}
        {/* MÓDULO BENTO 1: CURVA DE AVANCE MENSUAL (2 COLUMNAS) */}
        {/* ======================================================================= */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Curva de Avance Mensual (Programado vs. Real)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparativa porcentual del avance físico consolidado de obra pública.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Programado
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                Real Ejecutado
              </span>
            </div>
          </div>

          {/* Listado de Barras Mensuales iOS-Style */}
          <div className="space-y-4 pt-1">
            {avanceMensual.map((item) => {
              const desvio = item.real - item.programado;
              const isNegative = desvio < 0;

              return (
                <div key={item.mes} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 w-12">{item.mes}</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-blue-700 font-medium">Prog: {item.programado}%</span>
                      <span className="text-slate-900 font-bold">Real: {item.real}%</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          isNegative
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {desvio > 0 ? `+${desvio}%` : `${desvio}%`}
                      </span>
                    </div>
                  </div>

                  {/* Barras superpuestas redondeadas */}
                  <div className="relative h-3.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-blue-200/90 rounded-full transition-all duration-500"
                      style={{ width: `${item.programado}%` }}
                    />
                    <div
                      className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-500 ${
                        isNegative ? "bg-slate-900" : "bg-emerald-600"
                      }`}
                      style={{ width: `${item.real}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Diagnóstico al Pie de la Curva */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Diagnóstico Técnico de Curva:</strong> Desvío acumulado global de{" "}
              <strong>-7.0%</strong> en octubre debido a demoras de logística en fundaciones (Hospital Modular y Puente Distribuidor). Se sugiere aplicar cláusula de adecuación de plan de trabajo.
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* MÓDULO BENTO 2: COMPOSICIÓN DE CARTERA POR TIPOLOGÍA (1 COLUMNA) */}
        {/* ======================================================================= */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center justify-between">
              <span>Distribución por Tipología</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {obras.length} Obras
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Participación presupuestaria por sector.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-700">Infraestructura Vial</span>
                <span className="font-bold text-slate-900">40%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: "40%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-700">Puentes y Pasos Fluviales</span>
                <span className="font-bold text-slate-900">20%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: "20%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-700">Hidráulica y Desagües</span>
                <span className="font-bold text-slate-900">20%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-600 rounded-full" style={{ width: "20%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-700">Arquitectura Sanitaria</span>
                <span className="font-bold text-slate-900">20%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: "20%" }} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Mayores Inversiones
            </span>

            {obras.slice(0, 3).map((obra, idx) => (
              <div
                key={obra.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60"
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <div className="font-semibold text-slate-800 text-xs truncate">{obra.nombre}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{obra.codigo}</div>
                  </div>
                </div>
                <span className="font-bold text-slate-900 text-xs shrink-0">
                  {formatCurrency(obra.montoContratado)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* MÓDULO BENTO 3: TIMELINE VERTICAL DE ÚLTIMAS CERTIFICACIONES (2 COLUMNAS) */}
        {/* ======================================================================= */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                Últimas Certificaciones & Inspecciones
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Timeline secuencial de actas de medición y liquidaciones de obra.
              </p>
            </div>

            <Link
              href="/dashboard/certificaciones"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              <span>Ver todas las actas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Timeline Vertical Minimalista */}
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200/80">
            {certificaciones.map((cert) => (
              <div key={cert.id} className="relative">
                {/* Nodo Circular en el Timeline */}
                <div className="absolute -left-[30px] sm:-left-[38px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>

                {/* Tarjeta del Hito con Estilo iOS */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-slate-50/90 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {cert.obraNombre || cert.obraId}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {cert.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {cert.periodo}
                      </span>
                      <Badge
                        variant={
                          cert.estado === "Aprobado"
                            ? "active"
                            : cert.estado === "En Revisión"
                            ? "media"
                            : "alta"
                        }
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                      >
                        {cert.estado}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-slate-200/50 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Monto Certificado:</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(cert.montoCertificado)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Avance Mes: +{cert.avanceMes}%
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Pres: {formatDate(cert.fechaPresentacion)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* MÓDULO BENTO 4: ALERTAS OPERATIVAS CON BOTONES DE ACCIÓN DIRECTA (1 COL) */}
        {/* ======================================================================= */}
        <div id="alertas-operativas" className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Alertas Operativas
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Desvíos presupuestarios y de plazo.
              </p>
            </div>

            <Badge variant="alta" className="rounded-full px-2.5 py-0.5 text-xs font-bold">
              {alertas.length} Activas
            </Badge>
          </div>

          {/* Tarjetas Compactas de Alertas con Botón de Acción Directa */}
          <div className="space-y-3.5">
            {alertas.slice(0, 3).map((alerta) => (
              <div
                key={alerta.id}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Badge
                    variant={alerta.severidad === "Alta" ? "alta" : "media"}
                    className="rounded-full text-[10px] font-bold px-2 py-0.5"
                  >
                    {alerta.severidad.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDate(alerta.fechaDeteccion)}
                  </span>
                </div>

                <div>
                  <div className="font-bold text-xs text-slate-900 leading-snug">
                    {alerta.obraNombre}
                  </div>
                  <div className="text-[11px] font-medium text-slate-600 mt-0.5">
                    {alerta.tipo}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {alerta.descripcion}
                  </p>
                </div>

                {/* Botón de Acción Directa estilo iOS */}
                <Link
                  href="/dashboard/sheets"
                  className="inline-flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-900 hover:text-white text-slate-800 border border-slate-200 shadow-2xs transition-all group"
                >
                  <span className="truncate pr-1">{alerta.accionSugerida || "Auditar Desvío"}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/dashboard/sheets"
              className="inline-flex items-center justify-center w-full gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <span>Auditoría cruzada en Google Sheets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
