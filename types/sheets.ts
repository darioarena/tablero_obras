export interface SheetConfig {
  obrasSpreadsheetId: string;
  contratistasSpreadsheetId: string;
  certificacionesSpreadsheetId: string;
}

export type ObraEstado = "En Ejecución" | "Licitación" | "Finalizada" | "Paralizada" | "En Garantía";

export interface ObraItem {
  id: string;
  codigo: string;
  nombre: string;
  tipologia: string;
  ubicacion: string;
  contratistaId: string;
  contratistaNombre?: string;
  presupuestoOficial: number;
  montoContratado: number;
  montoCertificadoAcumulado: number;
  avanceFisico: number; // Porcentaje 0 a 100
  avanceFinanciero: number; // Porcentaje 0 a 100
  fechaInicio: string;
  fechaFinEstimada: string;
  estado: ObraEstado;
  inspectorACargo?: string;
}

export interface ContratistaItem {
  id: string;
  cuit: string;
  razonSocial: string;
  representanteTecnico: string;
  email: string;
  telefono: string;
  obrasActivasCount: number;
  estado: "Activo" | "Inhabilitado" | "En Observación";
}

export interface CertificacionItem {
  id: string;
  numeroCertificado: number;
  obraId: string;
  obraNombre?: string;
  periodo: string; // YYYY-MM
  montoCertificado: number;
  avanceMes: number; // %
  fechaPresentacion: string;
  fechaAprobacion?: string;
  estado: "Aprobado" | "En Revisión" | "Observado" | "Pagado";
}

export type AlertaSeveridad = "Alta" | "Media" | "Baja";

export interface AlertaItem {
  id: string;
  obraId: string;
  obraCodigo: string;
  obraNombre: string;
  severidad: AlertaSeveridad;
  tipo: "Retraso Cronograma" | "Desvío Presupuestario" | "Certificación Pendiente" | "Inspección Crítica";
  descripcion: string;
  desvioPorcentaje?: number;
  fechaDeteccion: string;
  accionSugerida: string;
}

export interface AvanceMensualItem {
  mes: string;
  programado: number;
  real: number;
}

export interface DashboardMetrics {
  totalObrasEjecucion: number;
  totalObrasVariacionMes: number; // ej: +2 vs mes anterior
  montoCertificadoAcumulado: number;
  montoVariacionPorcentual: number;
  alertasActivasCount: number;
  alertasAltaCount: number;
  contratistasActivosCount: number;
  avancePromedioFisico: number;
}
