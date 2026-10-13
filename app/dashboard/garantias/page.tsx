import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getGarantias } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export default async function GarantiasPage() {
  const garantias = await getGarantias();

  const totalAsegurado = garantias.reduce(
    (acc, curr) => acc + (curr.montoAsegurado || 0),
    0
  );

  const vigentes = garantias.filter((g) => g.estado === "Vigente");
  const porVencer = garantias.filter((g) => g.estado === "Por Vencer");
  const vencidas = garantias.filter((g) => g.estado === "Vencida");

  const extraColumnNames = Array.from(
    new Set(
      garantias.flatMap((g) => (g.columnasAdicionales ? Object.keys(g.columnasAdicionales) : []))
    )
  );

  return (
    <div className="space-y-6 font-sans">
      {/* ========================================================================= */}
      {/* CABECERA */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Garantías y Pólizas de Caución
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Control de pólizas de fiel cumplimiento de contrato, sustitución de fondos de reparo y anticipos financieros.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Total Pólizas
              </span>
              <span className="text-xl font-bold text-slate-900">{garantias.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Monto Total Asegurado
              </span>
              <span className="text-xl font-bold text-slate-900">{formatCurrency(totalAsegurado)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Pólizas Vigentes
              </span>
              <span className="text-xl font-bold text-emerald-700">{vigentes.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Por Vencer / Vencidas
              </span>
              <span className="text-xl font-bold text-amber-700">
                {porVencer.length + vencidas.length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* TABLA PRINCIPAL DE GARANTÍAS */}
      {/* ========================================================================= */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Póliza / ID</th>
                  <th className="py-3 px-4">Obra Vinculada</th>
                  <th className="py-3 px-4">Contratista / Tomador</th>
                  <th className="py-3 px-4">Tipo de Garantía</th>
                  <th className="py-3 px-4">Aseguradora / Banco</th>
                  <th className="py-3 px-4">Monto Asegurado</th>
                  <th className="py-3 px-4">Vencimiento</th>
                  <th className="py-3 px-4">Estado</th>
                  {extraColumnNames.map((col) => (
                    <th key={col} className="py-3 px-4 text-blue-700 bg-blue-50/50">
                      {col} (Extra)
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {garantias.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      <div>{g.numeroPoliza}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{g.id}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {g.obraNombre || g.obraId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {g.contratistaNombre || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700 text-[11px]">
                        {g.tipo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {g.entidadEmisora}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(g.montoAsegurado)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatDate(g.fechaVencimiento)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          g.estado === "Vigente"
                            ? "active"
                            : g.estado === "Por Vencer"
                            ? "media"
                            : "alta"
                        }
                      >
                        {g.estado}
                      </Badge>
                    </td>
                    {extraColumnNames.map((col) => (
                      <td key={col} className="py-3.5 px-4 text-slate-700 font-medium bg-blue-50/20">
                        {g.columnasAdicionales?.[col] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
