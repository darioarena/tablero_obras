import React from "react";
import { getObras } from "@/lib/google-sheets";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Layers } from "lucide-react";

export default async function ObrasPage() {
  const obras = await getObras();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Layers className="w-6 h-6 text-blue-600" />
          Listado Maestro de Obras
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Planilla sincronizada desde Google Sheets (Pestaña "Obras").
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Código / Nombre</th>
                  <th className="py-3 px-4">Tipología</th>
                  <th className="py-3 px-4">Ubicación</th>
                  <th className="py-3 px-4">Contratista</th>
                  <th className="py-3 px-4">Monto Contratado</th>
                  <th className="py-3 px-4">Avance Físico</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {obras.map((obra) => (
                  <tr key={obra.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{obra.nombre}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{obra.codigo}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{obra.tipologia}</td>
                    <td className="py-3.5 px-4 text-slate-600">{obra.ubicacion}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{obra.contratistaNombre}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(obra.montoContratado)}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${obra.avanceFisico}%` }} />
                        </div>
                        <span className="font-semibold text-slate-700">{obra.avanceFisico}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="active">{obra.estado}</Badge>
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
