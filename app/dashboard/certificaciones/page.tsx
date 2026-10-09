import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, CheckCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const MOCK_CERTIFICACIONES = [
  {
    id: "CERT-2024-009",
    obra: "Autopista Conexión Fluvial - Tramo II",
    nro: 9,
    periodo: "Agosto 2024",
    monto: 84500000,
    avanceMes: 8.5,
    estado: "Aprobado",
    fecha: "2024-09-05",
  },
  {
    id: "CERT-2024-010",
    obra: "Puente Distribuidor Acceso Norte",
    nro: 6,
    periodo: "Septiembre 2024",
    monto: 42100000,
    avanceMes: 6.2,
    estado: "En Revisión",
    fecha: "2024-10-02",
  },
  {
    id: "CERT-2024-011",
    obra: "Hospital Modular Regional",
    nro: 4,
    periodo: "Septiembre 2024",
    monto: 98000000,
    avanceMes: 7.1,
    estado: "Observado",
    fecha: "2024-10-04",
  },
];

export default function CertificacionesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Receipt className="w-6 h-6 text-emerald-600" />
          Certificaciones de Obra y Liquidaciones
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Registro mensual de avance financiero y actas de medición de obra.
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_CERTIFICACIONES.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{c.id}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{c.obra}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.periodo}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(c.monto)}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">+{c.avanceMes}%</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(c.fecha)}</td>
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
