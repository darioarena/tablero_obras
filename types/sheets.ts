export interface SheetConfig {
  obrasSpreadsheetId: string;
  contratistasSpreadsheetId: string;
  certificacionesSpreadsheetId: string;
  garantiasSpreadsheetId?: string;
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
  columnasAdicionales?: Record<string, string>; // Nuevas columnas detectadas en el Sheet
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
  columnasAdicionales?: Record<string, string>; // Nuevas columnas detectadas en el Sheet
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
  columnasAdicionales?: Record<string, string>; // Nuevas columnas detectadas en el Sheet
}

export type GarantiaTipo =
  | "Fiel Cumplimiento"
  | "Fondo de Reparo"
  | "Anticipo Financiero"
  | "Oferta"
  | "Sustitución de Fondo"
  | string;

export type GarantiaEstado = "Vigente" | "Por Vencer" | "Vencida" | "Liberada" | "Ejecutada";

export interface GarantiaItem {
  id: string;
  obraId: string;
  obraNombre?: string;
  contratistaId?: string;
  contratistaNombre?: string;
  tipo: GarantiaTipo;
  entidadEmisora: string;
  numeroPoliza: string;
  montoAsegurado: number;
  fechaEmision?: string;
  fechaVencimiento: string;
  estado: GarantiaEstado;
  observaciones?: string;
  columnasAdicionales?: Record<string, string>; // Nuevas columnas detectadas en el Sheet
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
  totalGarantiasVigentesCount?: number;
}

export interface DetectedHeader {
  name: string;
  index: number;
  normalized: string;
  isMapped: boolean;
  mappedField?: string;
  sampleValue?: string;
}

export interface ExpectedFieldAudit {
  field: string;
  label: string;
  required: boolean;
  found: boolean;
  matchedHeader?: string;
  sampleValue?: string;
}

export interface SheetAuditInfo {
  sheetKey: "obras" | "contratistas" | "certificaciones" | "garantias" | "alertas";
  title: string;
  tabRange: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  status: "CONNECTED" | "EMPTY" | "ERROR" | "FALLBACK_MOCK";
  errorMessage?: string;
  totalRows: number;
  detectedHeaders: DetectedHeader[];
  unmappedHeaders: DetectedHeader[];
  mappedFieldsCount: number;
  expectedFields: ExpectedFieldAudit[];
  sampleRow?: Record<string, string>;
  availableTabs?: string[];
}

export interface SheetsDiagnosticData {
  connectionStatus: {
    configured: boolean;
    hasServiceAccountEmail: boolean;
    serviceAccountEmail?: string;
    hasPrivateKey: boolean;
    mode: "LIVE_GOOGLE_SHEETS" | "FALLBACK_MOCK";
    revalidateSeconds: number;
  };
  sheets: SheetAuditInfo[];
  lastChecked: string;
}
