import React from "react";
import { getSheetDiagnosticData } from "@/lib/google-sheets";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SyncCacheButton } from "@/components/dashboard/sync-cache-button";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  KeyRound,
  Database,
  Columns,
  Info,
  Clock,
  Layers,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SheetsDiagnosticPage() {
  const diagnostic = await getSheetDiagnosticData();
  const { connectionStatus, sheets, lastChecked } = diagnostic;

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* ========================================================================= */}
      {/* CABECERA DE LA PÁGINA */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Conexiones & Diagnóstico de Google Sheets
                </h1>
                <Badge variant="default" className="text-[10px] uppercase font-bold tracking-wider">
                  Solo ADMIN
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Auditoría en tiempo real de planillas vinculadas, mapeo dinámico de cabeceras y detección de columnas nuevas.
              </p>
            </div>
          </div>
        </div>

        <SyncCacheButton lastChecked={lastChecked} />
      </div>

      {/* ========================================================================= */}
      {/* ESTADO GLOBAL DEL CONECTOR (SERVICE ACCOUNT & CACHÉ) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Modo de Conexión */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-5 flex items-start gap-4">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                connectionStatus.mode === "LIVE_GOOGLE_SHEETS"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-amber-50 text-amber-600 border border-amber-200"
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Modo de Operación
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus.mode === "LIVE_GOOGLE_SHEETS"
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-amber-500"
                  }`}
                />
                <span className="font-bold text-sm text-slate-900">
                  {connectionStatus.mode === "LIVE_GOOGLE_SHEETS"
                    ? "Google Sheets API v4 (En Vivo)"
                    : "Modo Demostración (Mock)"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {connectionStatus.mode === "LIVE_GOOGLE_SHEETS"
                  ? "Conectado mediante Service Account a Google Cloud."
                  : "Utilizando datos de respaldo precargados en memoria."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Cuenta de Servicio */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-xl shrink-0 bg-blue-50 text-blue-600 border border-blue-200">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Cuenta de Servicio (Google)
              </span>
              <div className="font-mono text-xs font-semibold text-slate-800 truncate mt-1">
                {connectionStatus.serviceAccountEmail || "No configurada"}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                <span className="text-slate-500">Clave Privada:</span>
                {connectionStatus.hasPrivateKey ? (
                  <span className="inline-flex items-center text-emerald-700 font-semibold gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Cargada
                  </span>
                ) : (
                  <span className="inline-flex items-center text-rose-700 font-semibold gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    Ausente
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Estrategia de Caché */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-2.5 rounded-xl shrink-0 bg-purple-50 text-purple-600 border border-purple-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Caché de Servidor
              </span>
              <div className="font-bold text-sm text-slate-900 mt-1">
                Revalidación: {connectionStatus.revalidateSeconds}s (
                {Math.round(connectionStatus.revalidateSeconds / 60)} min)
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Tag: <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">google-sheets-data</code> (revalidación manual disponible).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banner de ayuda si está en modo demo */}
      {connectionStatus.mode === "FALLBACK_MOCK" && (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <p className="font-bold">¿Cómo activar la conexión real con tus planillas de Google?</p>
            <p className="mt-1">
              Configurá las variables <code className="font-mono bg-white/80 px-1 py-0.5 rounded border border-amber-300">GOOGLE_SERVICE_ACCOUNT_EMAIL</code>,{" "}
              <code className="font-mono bg-white/80 px-1 py-0.5 rounded border border-amber-300">GOOGLE_PRIVATE_KEY</code> y los IDs de planillas en tu archivo <code className="font-mono bg-white/80 px-1 py-0.5 rounded border border-amber-300">.env.local</code> o en las variables de entorno de Vercel. Asegurate de compartir tus Google Sheets con permiso de <strong>Lector</strong> hacia el email de tu Service Account.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUDITORÍA DE PLANILLAS Y CABECERAS DETECTADAS */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Columns className="w-5 h-5 text-blue-600" />
              Auditoría de Planillas y Mapeo Dinámico
            </h2>
            <p className="text-xs text-slate-500">
              Detalle de cada pestaña consultada, columnas mapeadas por nombre y detección de campos nuevos.
            </p>
          </div>
        </div>

        {sheets.map((sheet) => (
          <Card key={sheet.sheetKey} className="border-slate-200 shadow-sm overflow-hidden bg-white">
            {/* Cabecera de la Planilla */}
            <div className="bg-slate-50/80 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-base text-slate-900">{sheet.title}</h3>
                  <Badge variant="outline" className="font-mono text-[11px] bg-white text-slate-700">
                    Rango: {sheet.tabRange}
                  </Badge>
                  {sheet.status === "CONNECTED" && (
                    <Badge variant="active" className="text-[10px]">Conectada</Badge>
                  )}
                  {sheet.status === "FALLBACK_MOCK" && (
                    <Badge variant="media" className="text-[10px]">Mock Demo</Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                  <span className="font-mono truncate max-w-md">ID: {sheet.spreadsheetId}</span>
                  <span>•</span>
                  <span>Registros detectados: <strong className="text-slate-800">{sheet.totalRows}</strong></span>
                </div>
              </div>

              {sheet.spreadsheetUrl && (
                <a
                  href={sheet.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors border border-blue-200 bg-white"
                >
                  <span>Abrir en Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Alerta de nuevas columnas detectadas si las hay */}
              {sheet.unmappedHeaders.length > 0 && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>¡Nuevas columnas detectadas en esta planilla ({sheet.unmappedHeaders.length})!</span>
                  </div>
                  <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                    Las siguientes columnas agregadas en el Google Sheet no pertenecen al esquema estándar fijo, pero son leídas automáticamente y quedan disponibles en el objeto <code className="bg-white/80 font-mono px-1 py-0.5 rounded border border-blue-200 font-semibold">obra.columnasAdicionales</code>:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {sheet.unmappedHeaders.map((col) => (
                      <span
                        key={col.index}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-blue-200 text-xs font-semibold text-blue-800 shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {col.name}
                        {col.sampleValue && (
                          <span className="text-[10px] text-slate-400 font-normal ml-1">
                            (ej: &quot;{col.sampleValue}&quot;)
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Grid de Estado de Mapeo de Cabeceras */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Mapeo de Campos del Sistema ({sheet.mappedFieldsCount} de {sheet.expectedFields.length} detectados)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Emparejado tolerante por sinónimos (mayúsculas, acentos, espacios y signos)
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Campo del Sistema</th>
                        <th className="py-2.5 px-3">Estado de Detección</th>
                        <th className="py-2.5 px-3">Columna en el Sheet</th>
                        <th className="py-2.5 px-3">Muestra Fila 1</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sheet.expectedFields.map((field) => (
                        <tr key={field.field} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800">{field.label}</span>
                            <span className="font-mono text-[10px] text-slate-400 block">{field.field}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            {field.found ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Mapeado
                              </span>
                            ) : field.required ? (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-medium text-[11px]">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                Requerido Faltante
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Opcional</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {field.matchedHeader ? (
                              <span className="font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                                &quot;{field.matchedHeader}&quot;
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">— No presente —</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {field.sampleValue ? (
                              <span className="text-slate-600 font-mono text-[11px] truncate max-w-xs block">
                                {field.sampleValue}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Vacío</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vista Previa de la Fila 1 */}
              {sheet.sampleRow && Object.keys(sheet.sampleRow).length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Vista Previa de la Fila 1 en Bruto (JSON Procesado)
                  </h4>
                  <pre className="p-3.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                    {JSON.stringify(sheet.sampleRow, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
