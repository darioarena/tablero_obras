import React from "react";
import {
  Layers,
  DollarSign,
  AlertTriangle,
  HardHat,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  getDashboardMetrics,
  getAlertas,
  getAvanceMensual,
  getObras,
} from "@/lib/google-sheets";

export default async function DashboardPage() {
  // Obtenemos los datos con Next.js Data Cache
  const metrics = await getDashboardMetrics();
  const alertas = await getAlertas();
  const avanceMensual = await getAvanceMensual();
  const obras = await getObras();

  return (
    <div className="space-y-8">
      {/* ========================================================================= */}
      {/* CABECERA DEL DASHBOARD */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Tablero General de Control de Obras
            </h1>
            <Badge variant="outline" className="text-[11px] gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizado
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Monitoreo consolidado de contratos de infraestructura, curvas de avance y desvíos presupuestarios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-subtle">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Google Sheets API v4 Conectado</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KPI CARDS (4 MÉTRICAS PRINCIPALES) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Obras en Ejecución */}
        <Card className="hover:border-slate-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Obras en Ejecución
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {metrics.totalObrasEjecucion}
            </div>
            <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>+{metrics.totalObrasVariacionMes} en el trimestre</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Avance físico promedio</span>
              <span className="font-semibold text-slate-700">{metrics.avancePromedioFisico.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Monto Certificado Acumulado */}
        <Card className="hover:border-slate-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Certificado Acumulado
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900 truncate">
              {formatCurrency(metrics.montoCertificadoAcumulado)}
            </div>
            <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              <span>+{metrics.montoVariacionPorcentual}% vs. mes previo</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Moneda base</span>
              <span className="font-semibold text-slate-700">ARS / Certif. Indec</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Alertas Activas */}
        <Card className="hover:border-slate-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Alertas Operativas
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {metrics.alertasActivasCount}
            </div>
            <div className="mt-2 flex items-center text-xs text-rose-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5 mr-0.5" />
              <span>{metrics.alertasAltaCount} con severidad ALTA</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Requieren dictamen</span>
              <span className="font-semibold text-rose-700">Inmediato</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Contratistas Activos */}
        <Card className="hover:border-slate-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Contratistas Activos
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <HardHat className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {metrics.contratistasActivosCount}
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5 mr-0.5 text-emerald-600" />
              <span>100% habilitados</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Pólizas de caución</span>
              <span className="font-semibold text-slate-700">Vigentes</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* GRÁFICOS Y ANÁLISIS PRELIMINAR */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curva de Avance Mensual (2/3 de pantalla) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle>Curva de Avance Mensual (Programado vs. Real)</CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Evolución porcentual del avance físico consolidado en el periodo 2024.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-blue-600" />
                  <span className="text-slate-600">Programado (%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-slate-900" />
                  <span className="text-slate-600">Real Ejecutado (%)</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Visualización de Barras de Avance */}
            <div className="space-y-4">
              {avanceMensual.map((item) => {
                const desvio = item.real - item.programado;
                const isNegative = desvio < 0;

                return (
                  <div key={item.mes} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 w-12">{item.mes}</span>
                      <div className="flex items-center gap-4 text-[11px]">
                        <span className="text-blue-700 font-medium">Prog: {item.programado}%</span>
                        <span className="text-slate-900 font-bold">Real: {item.real}%</span>
                        <span
                          className={`font-semibold ${
                            isNegative ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {desvio > 0 ? `+${desvio}%` : `${desvio}%`}
                        </span>
                      </div>
                    </div>

                    {/* Barras superpuestas estilizadas */}
                    <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                      {/* Barra Programada */}
                      <div
                        className="absolute top-0 bottom-0 left-0 bg-blue-200/80 transition-all duration-500"
                        style={{ width: `${item.programado}%` }}
                      />
                      {/* Barra Real */}
                      <div
                        className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ${
                          isNegative ? "bg-slate-900" : "bg-emerald-600"
                        }`}
                        style={{ width: `${item.real}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-3 rounded-lg bg-amber-50 border border-amber-200/70 text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Diagnóstico de Curva:</strong> Desvío acumulado global de -7.0% en octubre. Se recomienda intimar a contratistas con atraso en ruta crítica.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de Tipologías y Estado de Obras (1/3 de pantalla) */}
        <Card>
          <CardHeader>
            <CardTitle>Composición de Cartera</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Distribución por tipología de proyecto.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-slate-700">Infraestructura Vial (2)</span>
                  <span className="text-slate-500">40%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: "40%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-slate-700">Puentes y Pasos (1)</span>
                  <span className="text-slate-500">20%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: "20%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-slate-700">Hidráulica y Pluviales (1)</span>
                  <span className="text-slate-500">20%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-600 rounded-full" style={{ width: "20%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-slate-700">Arquitectura Sanitaria (1)</span>
                  <span className="text-slate-500">20%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: "20%" }} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Top Obras por Inversión
              </span>
              {obras.slice(0, 3).map((obra) => (
                <div
                  key={obra.id}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0"
                >
                  <div className="truncate pr-2">
                    <div className="font-medium text-slate-800 truncate">{obra.nombre}</div>
                    <div className="text-[10px] text-slate-400">{obra.codigo}</div>
                  </div>
                  <span className="font-semibold text-slate-900 shrink-0">
                    {formatCurrency(obra.montoContratado)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* TABLA DE ALERTAS RECIENTES (CON BADGES DE SEVERIDAD) */}
      {/* ========================================================================= */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Alertas Operativas y Desvíos Recientes
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Eventos detectados por el motor de validación cruzada entre Google Sheets de Obras y Certificaciones.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              Total activas: <strong>{alertas.length}</strong>
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Severidad</th>
                  <th className="py-3 px-4">Obra / Código</th>
                  <th className="py-3 px-4">Tipo de Desvío</th>
                  <th className="py-3 px-4">Descripción Técnica</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Acción Sugerida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alertas.map((alerta) => {
                  const severityVariant =
                    alerta.severidad === "Alta"
                      ? "alta"
                      : alerta.severidad === "Media"
                      ? "media"
                      : "baja";

                  return (
                    <tr
                      key={alerta.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Badge de Severidad */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant={severityVariant}>
                          {alerta.severidad.toUpperCase()}
                        </Badge>
                      </td>

                      {/* Obra */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {alerta.obraNombre}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {alerta.obraCodigo}
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                        {alerta.tipo}
                      </td>

                      {/* Descripción */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-sm leading-relaxed">
                        {alerta.descripcion}
                      </td>

                      {/* Fecha */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                        {formatDate(alerta.fechaDeteccion)}
                      </td>

                      {/* Acción Sugerida */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-800 font-medium line-clamp-1">
                            {alerta.accionSugerida}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
