import React from "react";
import { getContratistas } from "@/lib/google-sheets";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HardHat } from "lucide-react";

export default async function ContratistasPage() {
  const contratistas = await getContratistas();

  const extraColumnNames = Array.from(
    new Set(
      contratistas.flatMap((c) => (c.columnasAdicionales ? Object.keys(c.columnasAdicionales) : []))
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <HardHat className="w-6 h-6 text-amber-600" />
          Registro de Empresas Contratistas
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Padrón de proveedores de obra pública sincronizado desde Google Sheets. Mapeo dinámico de cabeceras.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Razón Social</th>
                  <th className="py-3 px-4">CUIT</th>
                  <th className="py-3 px-4">Representante Técnico</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Obras Activas</th>
                  <th className="py-3 px-4">Estado Habilitación</th>
                  {extraColumnNames.map((col) => (
                    <th key={col} className="py-3 px-4 text-amber-700 bg-amber-50/50">
                      {col} (Extra)
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contratistas.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{c.razonSocial}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{c.cuit}</td>
                    <td className="py-3.5 px-4 text-slate-700">{c.representanteTecnico}</td>
                    <td className="py-3.5 px-4 text-slate-500">{c.email}</td>
                    <td className="py-3.5 px-4 text-slate-500">{c.telefono}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{c.obrasActivasCount}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="active">{c.estado}</Badge>
                    </td>
                    {extraColumnNames.map((col) => (
                      <td key={col} className="py-3.5 px-4 text-slate-700 font-medium bg-amber-50/20">
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
