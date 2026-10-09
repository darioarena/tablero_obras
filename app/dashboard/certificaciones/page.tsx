import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, CheckCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

import { getCertificaciones } from "@/lib/google-sheets";

export default async function CertificacionesPage() {
  const certificaciones = await getCertificaciones();

  const extraColumnNames = Array.from(
    new Set(
      certificaciones.flatMap((c) => (c.columnasAdicionales ? Object.keys(c.columnasAdicionales) : []))
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Receipt className="w-6 h-6 text-emerald-600" />
          Certificaciones de Obra y Liquidaciones
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Registro mensual de avance financiero y actas de medición de obra vinculadas a Google Sheets.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Identificador</th>
                  <th className="py-3 px-4">Obra Vinculada</th>
                  <th className="py-3 px-4">Periodo</th>
                  <th className="py-3 px-4">Monto Certificado</th>
                  <th className="py-3 px-4">Avance Mes</th>
                  <th className="py-3 px-4">Fecha Presentación</th>
                  <th className="py-3 px-4">Estado</th>
                  {extraColumnNames.map((col) => (
                    <th key={col} className="py-3 px-4 text-emerald-700 bg-emerald-50/50">
                      {col} (Extra)
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certificaciones.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{c.id}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{c.obraNombre || c.obraId}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.periodo}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(c.montoCertificado)}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">+{c.avanceMes}%</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(c.fechaPresentacion)}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          c.estado === "Aprobado"
                            ? "active"
                            : c.estado === "En Revisión"
                            ? "media"
                            : "alta"
                        }
                      >
                        {c.estado}
                      </Badge>
                    </td>
                    {extraColumnNames.map((col) => (
                      <td key={col} className="py-3.5 px-4 text-slate-700 font-medium bg-emerald-50/20">
                        {c.columnasAdicionales?.[col] || "—"}
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
