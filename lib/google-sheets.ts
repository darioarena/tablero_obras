import { google } from "googleapis";
import { unstable_cache } from "next/cache";
import {
  SheetConfig,
  ObraItem,
  ContratistaItem,
  CertificacionItem,
  GarantiaItem,
  AlertaItem,
  AvanceMensualItem,
  DashboardMetrics,
  SheetsDiagnosticData,
  SheetAuditInfo,
  DetectedHeader,
  ExpectedFieldAudit,
} from "@/types/sheets";

if (typeof window !== "undefined") {
  throw new Error("[Security] lib/google-sheets solo puede ejecutarse en el entorno de servidor (Node.js/Server Components).");
}

// ============================================================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================================================

export const SHEETS_CACHE_TAG = "google-sheets-data";
const DEFAULT_REVALIDATE_SECONDS = 300; // 5 minutos por defecto

/**
 * Obtiene la configuración de IDs de planillas desde las variables de entorno.
 * Soporta tanto variables individuales (SHEETS_OBRAS_ID, SHEETS_GARANTIAS_ID, etc.)
 * como el objeto JSON consolidado SHEETS_CONFIG.
 */
export function getSheetsConfig(): SheetConfig {
  const jsonConfig = process.env.SHEETS_CONFIG;
  if (jsonConfig) {
    try {
      const parsed = JSON.parse(jsonConfig);
      return {
        obrasSpreadsheetId: parsed.obrasSpreadsheetId || process.env.SHEETS_OBRAS_ID || "",
        contratistasSpreadsheetId:
          parsed.contratistasSpreadsheetId || process.env.SHEETS_CONTRATISTAS_ID || "",
        certificacionesSpreadsheetId:
          parsed.certificacionesSpreadsheetId || process.env.SHEETS_CERTIFICACIONES_ID || "",
        garantiasSpreadsheetId:
          parsed.garantiasSpreadsheetId || process.env.SHEETS_GARANTIAS_ID || "",
      };
    } catch (e) {
      console.warn("[GoogleSheets] Error parseando SHEETS_CONFIG como JSON, recurriendo a variables individuales.", e);
    }
  }

  return {
    obrasSpreadsheetId: process.env.SHEETS_OBRAS_ID || "",
    contratistasSpreadsheetId: process.env.SHEETS_CONTRATISTAS_ID || "",
    certificacionesSpreadsheetId: process.env.SHEETS_CERTIFICACIONES_ID || "",
    garantiasSpreadsheetId: process.env.SHEETS_GARANTIAS_ID || "",
  };
}

/**
 * Valida y formatea la Private Key de la Service Account de Google.
 * Remueve comillas envolventes accidentales y normaliza saltos de línea \n.
 */
function cleanPrivateKey(key?: string): string | undefined {
  if (!key) return undefined;
  let cleaned = key.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  return cleaned.replace(/\\n/g, "\n");
}

/**
 * Inicializa el cliente autenticado de Google Sheets API v4
 */
function getGoogleSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const privateKey = cleanPrivateKey(rawKey);

  if (!email || !privateKey) {
    return null;
  }

  try {
    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    return google.sheets({ version: "v4", auth });
  } catch (err) {
    console.error("[GoogleSheets] Error inicializando cliente JWT de Google:", (err as any)?.message || err);
    return null;
  }
}

// ============================================================================
// DATOS MOCK DE CONTINGENCIA (FALLBACK CORP)
// ============================================================================

const MOCK_OBRAS: ObraItem[] = [
  {
    id: "OB-001",
    codigo: "OBR-2024-001",
    nombre: "Autopista Conexión Fluvial - Tramo II",
    tipologia: "Vial",
    ubicacion: "Rosario, Santa Fe",
    contratistaId: "CTR-01",
    contratistaNombre: "Constructora del Litoral S.A.",
    presupuestoOficial: 850000000,
    montoContratado: 890000000,
    montoCertificadoAcumulado: 614100000,
    avanceFisico: 69.0,
    avanceFinanciero: 68.5,
    fechaInicio: "2024-01-15",
    fechaFinEstimada: "2025-06-30",
    estado: "En Ejecución",
    inspectorACargo: "Ing. Carlos Mendoza",
  },
  {
    id: "OB-002",
    codigo: "OBR-2024-004",
    nombre: "Puente Distribuidor Acceso Norte",
    tipologia: "Puentes e Infraestructura",
    ubicacion: "Córdoba Capital",
    contratistaId: "CTR-02",
    contratistaNombre: "Infraestructuras Andinas S.R.L.",
    presupuestoOficial: 420000000,
    montoContratado: 445000000,
    montoCertificadoAcumulado: 213600000,
    avanceFisico: 48.0,
    avanceFinanciero: 54.2,
    fechaInicio: "2024-03-01",
    fechaFinEstimada: "2025-04-15",
    estado: "En Ejecución",
    inspectorACargo: "Ing. Mariana Rossi",
  },
  {
    id: "OB-003",
    codigo: "OBR-2023-089",
    nombre: "Red Colectora Pluvial y Desagües Cuenca Este",
    tipologia: "Hidráulica y Saneamiento",
    ubicacion: "La Plata, Buenos Aires",
    contratistaId: "CTR-03",
    contratistaNombre: "Vialidad & Redes Urbanas S.A.",
    presupuestoOficial: 620000000,
    montoContratado: 630000000,
    montoCertificadoAcumulado: 567000000,
    avanceFisico: 90.0,
    avanceFinanciero: 91.0,
    fechaInicio: "2023-08-10",
    fechaFinEstimada: "2024-12-20",
    estado: "En Ejecución",
    inspectorACargo: "Ing. Lucas Benítez",
  },
  {
    id: "OB-004",
    codigo: "OBR-2024-012",
    nombre: "Hospital Modular Regional de Alta Complejidad",
    tipologia: "Arquitectura Sanitaria",
    ubicacion: "Neuquén",
    contratistaId: "CTR-04",
    contratistaNombre: "TecnoEdificaciones Sur S.A.",
    presupuestoOficial: 1250000000,
    montoContratado: 1280000000,
    montoCertificadoAcumulado: 320000000,
    avanceFisico: 25.0,
    avanceFinanciero: 33.0,
    fechaInicio: "2024-05-02",
    fechaFinEstimada: "2025-11-30",
    estado: "En Ejecución",
    inspectorACargo: "Arq. Sofia Valenzuela",
  },
  {
    id: "OB-005",
    codigo: "OBR-2024-019",
    nombre: "Pavimentación y Drenaje Parque Industrial Oeste",
    tipologia: "Vial e Industrial",
    ubicacion: "Mendoza",
    contratistaId: "CTR-05",
    contratistaNombre: "Pavimentos del Cuyo S.A.",
    presupuestoOficial: 310000000,
    montoContratado: 318000000,
    montoCertificadoAcumulado: 295000000,
    avanceFisico: 92.0,
    avanceFinanciero: 93.0,
    fechaInicio: "2023-11-01",
    fechaFinEstimada: "2024-11-15",
    estado: "En Ejecución",
    inspectorACargo: "Ing. Martín Morales",
  },
];

const MOCK_CONTRATISTAS: ContratistaItem[] = [
  {
    id: "CTR-01",
    cuit: "30-71049281-9",
    razonSocial: "Constructora del Litoral S.A.",
    representanteTecnico: "Ing. Hernán Pereyra",
    email: "contacto@constructoradellitoral.com.ar",
    telefono: "+54 341 482-9900",
    obrasActivasCount: 2,
    estado: "Activo",
  },
  {
    id: "CTR-02",
    cuit: "30-68934521-4",
    razonSocial: "Infraestructuras Andinas S.R.L.",
    representanteTecnico: "Ing. Gonzalo Cabrera",
    email: "licitaciones@infraandinas.com.ar",
    telefono: "+54 351 520-4100",
    obrasActivasCount: 1,
    estado: "Activo",
  },
  {
    id: "CTR-03",
    cuit: "33-54910283-9",
    razonSocial: "Vialidad & Redes Urbanas S.A.",
    representanteTecnico: "Ing. Claudio Domínguez",
    email: "administracion@vialidadyredes.com.ar",
    telefono: "+54 221 412-8800",
    obrasActivasCount: 1,
    estado: "Activo",
  },
  {
    id: "CTR-04",
    cuit: "30-71409218-2",
    razonSocial: "TecnoEdificaciones Sur S.A.",
    representanteTecnico: "Arq. Marcelo Roldán",
    email: "obras@tecnoedificaciones.com.ar",
    telefono: "+54 299 448-7320",
    obrasActivasCount: 1,
    estado: "En Observación",
  },
  {
    id: "CTR-05",
    cuit: "30-63910842-7",
    razonSocial: "Pavimentos del Cuyo S.A.",
    representanteTecnico: "Ing. Esteban Navarro",
    email: "contacto@pavimentosdelcuyo.com.ar",
    telefono: "+54 261 498-1120",
    obrasActivasCount: 1,
    estado: "Activo",
  },
];

const MOCK_CERTIFICACIONES: CertificacionItem[] = [
  {
    id: "CERT-2024-009",
    numeroCertificado: 9,
    obraId: "OB-001",
    obraNombre: "Autopista Conexión Fluvial - Tramo II",
    periodo: "2024-08",
    montoCertificado: 84500000,
    avanceMes: 8.5,
    fechaPresentacion: "2024-09-05",
    fechaAprobacion: "2024-09-18",
    estado: "Aprobado",
  },
  {
    id: "CERT-2024-010",
    numeroCertificado: 6,
    obraId: "OB-002",
    obraNombre: "Puente Distribuidor Acceso Norte",
    periodo: "2024-09",
    montoCertificado: 42100000,
    avanceMes: 6.2,
    fechaPresentacion: "2024-10-02",
    estado: "En Revisión",
  },
  {
    id: "CERT-2024-011",
    numeroCertificado: 4,
    obraId: "OB-004",
    obraNombre: "Hospital Modular Regional de Alta Complejidad",
    periodo: "2024-09",
    montoCertificado: 98000000,
    avanceMes: 7.1,
    fechaPresentacion: "2024-10-04",
    estado: "Observado",
  },
];

const MOCK_GARANTIAS: GarantiaItem[] = [
  {
    id: "GAR-001",
    obraId: "OB-001",
    obraNombre: "Autopista Conexión Fluvial - Tramo II",
    contratistaNombre: "Constructora del Litoral S.A.",
    tipo: "Fiel Cumplimiento",
    entidadEmisora: "La Holando Sudamericana Cía de Seguros",
    numeroPoliza: "POL-488921-FC",
    montoAsegurado: 89000000,
    fechaEmision: "2024-01-10",
    fechaVencimiento: "2025-07-30",
    estado: "Vigente",
    observaciones: "Cubre el 10% del contrato de obra.",
  },
  {
    id: "GAR-002",
    obraId: "OB-001",
    obraNombre: "Autopista Conexión Fluvial - Tramo II",
    contratistaNombre: "Constructora del Litoral S.A.",
    tipo: "Fondo de Reparo",
    entidadEmisora: "Aseguradora de Créditos y Garantías S.A.",
    numeroPoliza: "POL-491024-FR",
    montoAsegurado: 30705000,
    fechaEmision: "2024-02-15",
    fechaVencimiento: "2025-12-31",
    estado: "Vigente",
    observaciones: "Sustitución de retención del 5% de certificados de obra.",
  },
  {
    id: "GAR-003",
    obraId: "OB-002",
    obraNombre: "Puente Distribuidor Acceso Norte",
    contratistaNombre: "Infraestructuras Andinas S.R.L.",
    tipo: "Fiel Cumplimiento",
    entidadEmisora: "Fianzas y Crédito S.A.",
    numeroPoliza: "POL-399182-FC",
    montoAsegurado: 44500000,
    fechaEmision: "2024-02-28",
    fechaVencimiento: "2025-05-15",
    estado: "Por Vencer",
    observaciones: "Vence en menos de 60 días. Requiere endoso de prórroga.",
  },
  {
    id: "GAR-004",
    obraId: "OB-003",
    obraNombre: "Red Colectora Pluvial y Desagües Cuenca Este",
    contratistaNombre: "Vialidad & Redes Urbanas S.A.",
    tipo: "Anticipo Financiero",
    entidadEmisora: "Sancor Seguros",
    numeroPoliza: "POL-512093-AF",
    montoAsegurado: 94500000,
    fechaEmision: "2023-08-01",
    fechaVencimiento: "2024-12-31",
    estado: "Vigente",
    observaciones: "Amortización de anticipo financiero en marcha.",
  },
];

// ============================================================================
// NORMALIZACIÓN Y EMPAREJAMIENTO DE CABECERAS
// ============================================================================

export function normalizeHeader(header: string): string {
  if (!header) return "";
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function buildHeaderIndexMap(
  headerRow: string[]
): Record<string, { index: number; originalName: string }> {
  const map: Record<string, { index: number; originalName: string }> = {};
  if (!headerRow) return map;

  headerRow.forEach((colName, index) => {
    if (colName && typeof colName === "string") {
      const normalized = normalizeHeader(colName);
      if (normalized && map[normalized] === undefined) {
        map[normalized] = { index, originalName: colName.trim() };
      }
    }
  });

  return map;
}

export function getCellValueByAliases(
  row: string[],
  headerMap: Record<string, { index: number; originalName: string }>,
  aliases: string[],
  fallbackIndex?: number
): string {
  if (!row) return "";

  for (const alias of aliases) {
    const norm = normalizeHeader(alias);
    if (headerMap[norm] !== undefined) {
      const idx = headerMap[norm].index;
      const val = row[idx];
      if (val !== undefined && val !== null) {
        return String(val).trim();
      }
    }
  }

  if (fallbackIndex !== undefined && fallbackIndex < row.length) {
    const val = row[fallbackIndex];
    if (val !== undefined && val !== null) {
      return String(val).trim();
    }
  }
  return "";
}

export function extractUnmappedColumns(
  row: string[],
  headerRow: string[],
  mappedIndices: Set<number>
): Record<string, string> {
  const extra: Record<string, string> = {};
  if (!headerRow) return extra;

  headerRow.forEach((headerName, idx) => {
    if (!mappedIndices.has(idx) && headerName && headerName.trim()) {
      const val = row[idx];
      if (val !== undefined && val !== null && String(val).trim() !== "") {
        extra[headerName.trim()] = String(val).trim();
      }
    }
  });
  return extra;
}

// ============================================================================
// ESPECIFICACIONES DE CAMPOS Y ALIASES (ESPAÑOL COLOQUIAL / TÉCNICO)
// ============================================================================

export const OBRAS_FIELD_SPECS = [
  { field: "id", label: "Identificador", required: true, aliases: ["id", "idobra", "identificador", "codigoobra", "nro"] },
  { field: "codigo", label: "Código / Expediente", required: true, aliases: ["codigo", "expediente", "codigointerno", "nroobra", "nroexpediente", "cod"] },
  { field: "nombre", label: "Denominación / Nombre", required: true, aliases: ["nombre", "denominacion", "nombredeobra", "denominaciondeobra", "proyecto", "titulo", "obra"] },
  { field: "tipologia", label: "Tipología / Rubro", required: false, aliases: ["tipologia", "tipo", "rubro", "categoria", "sector", "clasificacion"] },
  { field: "ubicacion", label: "Ubicación Geográfica", required: false, aliases: ["ubicacion", "localidad", "municipio", "provincia", "departamento", "ciudad", "lugar"] },
  { field: "contratistaId", label: "ID Contratista", required: false, aliases: ["contratistaid", "idcontratista", "cuitcontratista"] },
  { field: "contratistaNombre", label: "Contratista / Empresa", required: false, aliases: ["contratista", "nombrecontratista", "contratistanombre", "adjudicatario", "razonsocial", "empresa"] },
  { field: "presupuestoOficial", label: "Presupuesto Oficial", required: false, aliases: ["presupuestooficial", "presupuesto", "montooficial", "presupuestobase"] },
  { field: "montoContratado", label: "Monto Contratado", required: false, aliases: ["montocontratado", "contratomonto", "montoadjudicado", "monto"] },
  { field: "montoCertificadoAcumulado", label: "Certificado Acumulado", required: false, aliases: ["montocertificadoacumulado", "montocertificado", "certificadoacumulado", "acumuladocertificado", "totalcertificado"] },
  { field: "avanceFisico", label: "% Avance Físico", required: false, aliases: ["avancefisico", "fisico", "porcentajeavancefisico", "avancefisicoacumulado", "avancef"] },
  { field: "avanceFinanciero", label: "% Avance Financiero", required: false, aliases: ["avancefinanciero", "financiero", "porcentajeavancefinanciero", "avancefinancieroacumulado"] },
  { field: "fechaInicio", label: "Fecha de Inicio", required: false, aliases: ["fechainicio", "iniciodeobra", "iniciocronograma", "fechainicioestimada", "inicio"] },
  { field: "fechaFinEstimada", label: "Fecha Fin Estimada", required: false, aliases: ["fechafinestimada", "fechafin", "findeobra", "plazofin", "fechafinalizacion", "fin"] },
  { field: "estado", label: "Estado de Obra", required: true, aliases: ["estado", "situacion", "status", "estadoactual"] },
  { field: "inspectorACargo", label: "Inspector a Cargo", required: false, aliases: ["inspectoracargo", "inspector", "supervisortecnico", "inspeccion", "directorobra"] },
];

export const CONTRATISTAS_FIELD_SPECS = [
  { field: "id", label: "ID Contratista", required: true, aliases: ["id", "idcontratista", "codigocontratista"] },
  { field: "cuit", label: "CUIT", required: true, aliases: ["cuit", "cuil", "cuitcuil", "identificaciontributaria"] },
  { field: "razonSocial", label: "Razón Social / Empresa", required: true, aliases: ["razonsocial", "empresa", "nombreempresa", "proveedor", "contratista", "nombre"] },
  { field: "representanteTecnico", label: "Representante Técnico", required: false, aliases: ["representantetecnico", "directorobra", "apoderado", "responsabletecnico"] },
  { field: "email", label: "Correo Electrónico", required: false, aliases: ["email", "correo", "correoelectronico", "mail"] },
  { field: "telefono", label: "Teléfono de Contacto", required: false, aliases: ["telefono", "celular", "contacto", "tel"] },
  { field: "obrasActivasCount", label: "Obras Activas", required: false, aliases: ["obrasactivascount", "obrasactivas", "cantidadobras", "obrasenegjecucion", "obrasasignadas"] },
  { field: "estado", label: "Estado Habilitación", required: true, aliases: ["estado", "habilitacion", "status"] },
];

export const CERTIFICACIONES_FIELD_SPECS = [
  { field: "id", label: "ID Certificado", required: true, aliases: ["id", "idcertificacion", "codigocertificado"] },
  { field: "numeroCertificado", label: "N° Certificado", required: true, aliases: ["numerocertificado", "nrocertificado", "certificado", "numero", "nro"] },
  { field: "obraId", label: "ID Obra", required: true, aliases: ["obraid", "idobra", "codigoobra"] },
  { field: "obraNombre", label: "Nombre de Obra", required: false, aliases: ["obranombre", "nombreobra", "obra"] },
  { field: "periodo", label: "Período (YYYY-MM)", required: true, aliases: ["periodo", "mes", "periodocertificado", "fechaperiodo"] },
  { field: "montoCertificado", label: "Monto Certificado", required: true, aliases: ["montocertificado", "monto", "certificacionmonto", "neto"] },
  { field: "avanceMes", label: "% Avance del Mes", required: false, aliases: ["avancemes", "avance", "porcentaje", "porcentajemes"] },
  { field: "fechaPresentacion", label: "Fecha Presentación", required: false, aliases: ["fechapresentacion", "presentacion", "fechaemision"] },
  { field: "fechaAprobacion", label: "Fecha Aprobación", required: false, aliases: ["fechaaprobacion", "aprobacion", "fechapago"] },
  { field: "estado", label: "Estado Certificado", required: true, aliases: ["estado", "status", "situacion"] },
];

export const GARANTIAS_FIELD_SPECS = [
  { field: "id", label: "ID Garantía", required: true, aliases: ["id", "idgarantia", "codigo", "nropoliza", "poliza"] },
  { field: "obraId", label: "ID Obra", required: true, aliases: ["obraid", "idobra", "codigoobra"] },
  { field: "obraNombre", label: "Nombre de Obra", required: false, aliases: ["obranombre", "nombreobra", "obra", "denominacion"] },
  { field: "contratistaNombre", label: "Contratista / Tomador", required: false, aliases: ["contratista", "contratistanombre", "tomador", "empresa", "razonsocial"] },
  { field: "tipo", label: "Tipo de Garantía", required: true, aliases: ["tipo", "tipogarantia", "concepto", "clase"] },
  { field: "entidadEmisora", label: "Aseguradora / Banco", required: true, aliases: ["entidademisora", "aseguradora", "banco", "compania", "emisor", "entidad"] },
  { field: "numeroPoliza", label: "N° Póliza / Fianza", required: true, aliases: ["numeropoliza", "nropoliza", "poliza", "fianza", "certificadopoliza"] },
  { field: "montoAsegurado", label: "Monto Asegurado", required: true, aliases: ["montoasegurado", "monto", "sumagarantizada", "sumaasegurada", "importe"] },
  { field: "fechaEmision", label: "Fecha Emisión", required: false, aliases: ["fechaemision", "emision", "iniciovigencia", "vigenciadesde", "fecha"] },
  { field: "fechaVencimiento", label: "Fecha Vencimiento", required: true, aliases: ["fechavencimiento", "vencimiento", "vigenciahasta", "vence", "finvigencia"] },
  { field: "estado", label: "Estado", required: true, aliases: ["estado", "situacion", "status"] },
  { field: "observaciones", label: "Observaciones", required: false, aliases: ["observaciones", "notas", "comentarios", "detalle"] },
];

// ============================================================================
// FUNCIONES DE CONSULTA INTELIGENTE CON DISCOVERY DINÁMICO DE PESTAÑAS
// ============================================================================

export interface SheetFetchResult {
  rows: string[][];
  resolvedTabName: string;
  availableTabs: string[];
  status: "CONNECTED" | "EMPTY" | "ERROR" | "FALLBACK_MOCK";
  errorMessage?: string;
}

/**
 * Consulta inteligente a Google Sheets API v4:
 * 1. Inspecciona metadatos de la planilla para descubrir las pestañas reales.
 * 2. Si hay error de permisos (403), API deshabilitada o 404, captura el mensaje descriptivo exacto.
 * 3. Busca coincidencias flexibles con el nombre de pestaña sugerido (ej: "obras", "garantias").
 *    Si no coincide o hay una sola pestaña (ej: "Hoja 1", "Sheet1"), utiliza la primera disponible.
 * 4. Lee las filas reales hasta la columna ZZ.
 */
export async function fetchSheetDataSmart(
  spreadsheetId: string,
  preferredTabHint: string
): Promise<SheetFetchResult> {
  const sheets = getGoogleSheetsClient();
  if (!sheets || !spreadsheetId) {
    return {
      rows: [],
      resolvedTabName: "",
      availableTabs: [],
      status: "FALLBACK_MOCK",
      errorMessage: !spreadsheetId
        ? "ID de planilla no configurado en variables de entorno de Vercel."
        : "Credenciales de Service Account no inicializadas (revisar GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_PRIVATE_KEY).",
    };
  }

  let availableTabs: string[] = [];
  try {
    const meta = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets.properties.title",
    });
    availableTabs = (meta.data.sheets || [])
      .map((s) => s.properties?.title || "")
      .filter(Boolean);
  } catch (err: any) {
    const msg = err?.message || "";
    const code = err?.code || err?.status;
    let friendly = `Error al conectar con Google Sheets (${code || "desconocido"}): ${msg}`;

    if (code === 403 || msg.includes("permission") || msg.includes("The caller does not have permission")) {
      const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "tu Service Account";
      friendly = `Permiso denegado en Google Drive (403): La planilla no está compartida con "${email}". Abrí la planilla en Google Drive, hacé clic en 'Compartir' y agregá ese correo como 'Lector'.`;
    } else if (code === 404 || msg.includes("not found")) {
      friendly = `Planilla no encontrada (404): Verificá que el ID "${spreadsheetId}" sea correcto.`;
    } else if (msg.includes("has not been used in project") || msg.includes("disabled")) {
      friendly = `API de Google Sheets no habilitada: Habilitala en Google Cloud Console para tu proyecto en https://console.cloud.google.com/apis/library/sheets.googleapis.com`;
    } else if (msg.includes("PEM") || msg.includes("private key") || msg.includes("invalid_grant")) {
      friendly = `Error en GOOGLE_PRIVATE_KEY: La clave privada en Vercel tiene un formato incorrecto o expiró. Asegurate de incluir -----BEGIN PRIVATE KEY----- y -----END PRIVATE KEY-----.`;
    }

    console.error(`[GoogleSheets] Error en spreadsheet ${spreadsheetId}:`, friendly);
    return {
      rows: [],
      resolvedTabName: "",
      availableTabs: [],
      status: "ERROR",
      errorMessage: friendly,
    };
  }

  if (availableTabs.length === 0) {
    return {
      rows: [],
      resolvedTabName: "",
      availableTabs: [],
      status: "EMPTY",
      errorMessage: "La planilla no contiene hojas o pestañas visibles.",
    };
  }

  // Buscar coincidencia flexible de pestaña (ej: "obras", "garantias", "hoja 1")
  const normHint = normalizeHeader(preferredTabHint);
  let targetTab = availableTabs.find((tab) => {
    const norm = normalizeHeader(tab);
    return norm === normHint || norm.includes(normHint) || normHint.includes(norm);
  });

  // Si no coincide por nombre, usar la primera pestaña disponible (ej: "Hoja 1", "Sheet1")
  if (!targetTab) {
    targetTab = availableTabs[0];
  }

  try {
    const range = `'${targetTab}'!A:ZZ`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = (response.data.values as string[][]) || [];
    if (values.length === 0) {
      return {
        rows: [],
        resolvedTabName: targetTab,
        availableTabs,
        status: "EMPTY",
        errorMessage: `La pestaña '${targetTab}' de la planilla no contiene datos (0 filas).`,
      };
    }

    return {
      rows: values,
      resolvedTabName: targetTab,
      availableTabs,
      status: "CONNECTED",
    };
  } catch (err: any) {
    const msg = err?.message || "Error al leer valores de la pestaña.";
    console.error(`[GoogleSheets] Error leyendo rango ${targetTab}!A:ZZ:`, msg);
    return {
      rows: [],
      resolvedTabName: targetTab,
      availableTabs,
      status: "ERROR",
      errorMessage: `Error leyendo datos de la pestaña '${targetTab}': ${msg}`,
    };
  }
}

// ============================================================================
// PARSEO DINÁMICO DE FILAS MEDIANTE CABECERAS
// ============================================================================

function parseObrasRows(rows: string[][]): ObraItem[] {
  if (!rows || rows.length <= 1) return MOCK_OBRAS;
  const headerRow = rows[0] || [];
  const headerMap = buildHeaderIndexMap(headerRow);
  const dataRows = rows.slice(1);

  const mappedIndices = new Set<number>();
  OBRAS_FIELD_SPECS.forEach((spec) => {
    for (const alias of spec.aliases) {
      const norm = normalizeHeader(alias);
      if (headerMap[norm] !== undefined) {
        mappedIndices.add(headerMap[norm].index);
        break;
      }
    }
  });

  return dataRows.map((row, index) => {
    const getVal = (aliases: string[], fallbackIdx: number) =>
      getCellValueByAliases(row, headerMap, aliases, fallbackIdx);

    const parseNum = (val: string) => Number(val.replace(/[^0-9.-]+/g, "")) || 0;
    const extraCols = extractUnmappedColumns(row, headerRow, mappedIndices);

    return {
      id: getVal(["id", "idobra", "identificador"], 0) || `OB-${index + 1}`,
      codigo: getVal(["codigo", "expediente", "codigointerno"], 1) || `OBR-2024-${String(index + 1).padStart(3, "0")}`,
      nombre: getVal(["nombre", "denominacion", "proyecto", "titulo"], 2) || "Obra sin denominación",
      tipologia: getVal(["tipologia", "tipo", "rubro"], 3) || "General",
      ubicacion: getVal(["ubicacion", "localidad", "provincia"], 4) || "Sin especificar",
      contratistaId: getVal(["contratistaid", "idcontratista"], 5) || "",
      contratistaNombre: getVal(["contratista", "nombrecontratista", "razonsocial"], 6) || "Contratista Adjudicado",
      presupuestoOficial: parseNum(getVal(["presupuestooficial", "presupuesto"], 7)),
      montoContratado: parseNum(getVal(["montocontratado", "contratomonto"], 8)),
      montoCertificadoAcumulado: parseNum(getVal(["montocertificadoacumulado", "montocertificado"], 9)),
      avanceFisico: parseNum(getVal(["avancefisico", "fisico"], 10)),
      avanceFinanciero: parseNum(getVal(["avancefinanciero", "financiero"], 11)),
      fechaInicio: getVal(["fechainicio", "iniciodeobra"], 12) || "",
      fechaFinEstimada: getVal(["fechafinestimada", "fechafin"], 13) || "",
      estado: (getVal(["estado", "situacion", "status"], 14) as any) || "En Ejecución",
      inspectorACargo: getVal(["inspectoracargo", "inspector"], 15) || "",
      columnasAdicionales: Object.keys(extraCols).length > 0 ? extraCols : undefined,
    };
  });
}

function parseContratistasRows(rows: string[][]): ContratistaItem[] {
  if (!rows || rows.length <= 1) return MOCK_CONTRATISTAS;
  const headerRow = rows[0] || [];
  const headerMap = buildHeaderIndexMap(headerRow);
  const dataRows = rows.slice(1);

  const mappedIndices = new Set<number>();
  CONTRATISTAS_FIELD_SPECS.forEach((spec) => {
    for (const alias of spec.aliases) {
      const norm = normalizeHeader(alias);
      if (headerMap[norm] !== undefined) {
        mappedIndices.add(headerMap[norm].index);
        break;
      }
    }
  });

  return dataRows.map((row, index) => {
    const getVal = (aliases: string[], fallbackIdx: number) =>
      getCellValueByAliases(row, headerMap, aliases, fallbackIdx);

    const extraCols = extractUnmappedColumns(row, headerRow, mappedIndices);

    return {
      id: getVal(["id", "idcontratista"], 0) || `CTR-${index + 1}`,
      cuit: getVal(["cuit", "cuil"], 1) || "",
      razonSocial: getVal(["razonsocial", "empresa", "nombre"], 2) || "Razón Social",
      representanteTecnico: getVal(["representantetecnico", "directorobra"], 3) || "",
      email: getVal(["email", "correo", "mail"], 4) || "",
      telefono: getVal(["telefono", "celular", "contacto"], 5) || "",
      obrasActivasCount: Number(getVal(["obrasactivascount", "obrasactivas"], 6)) || 0,
      estado: (getVal(["estado", "habilitacion"], 7) as any) || "Activo",
      columnasAdicionales: Object.keys(extraCols).length > 0 ? extraCols : undefined,
    };
  });
}

function parseCertificacionesRows(rows: string[][]): CertificacionItem[] {
  if (!rows || rows.length <= 1) return MOCK_CERTIFICACIONES;
  const headerRow = rows[0] || [];
  const headerMap = buildHeaderIndexMap(headerRow);
  const dataRows = rows.slice(1);

  const mappedIndices = new Set<number>();
  CERTIFICACIONES_FIELD_SPECS.forEach((spec) => {
    for (const alias of spec.aliases) {
      const norm = normalizeHeader(alias);
      if (headerMap[norm] !== undefined) {
        mappedIndices.add(headerMap[norm].index);
        break;
      }
    }
  });

  return dataRows.map((row, index) => {
    const getVal = (aliases: string[], fallbackIdx: number) =>
      getCellValueByAliases(row, headerMap, aliases, fallbackIdx);
    const parseNum = (val: string) => Number(val.replace(/[^0-9.-]+/g, "")) || 0;
    const extraCols = extractUnmappedColumns(row, headerRow, mappedIndices);

    return {
      id: getVal(["id", "idcertificacion"], 0) || `CERT-${index + 1}`,
      numeroCertificado: parseNum(getVal(["numerocertificado", "nrocertificado", "certificado", "numero"], 1)) || index + 1,
      obraId: getVal(["obraid", "idobra"], 2) || "",
      obraNombre: getVal(["obranombre", "nombreobra", "obra"], 3) || "",
      periodo: getVal(["periodo", "mes", "periodocertificado"], 4) || "",
      montoCertificado: parseNum(getVal(["montocertificado", "monto"], 5)),
      avanceMes: parseNum(getVal(["avancemes", "avance", "porcentaje"], 6)),
      fechaPresentacion: getVal(["fechapresentacion", "presentacion"], 7) || "",
      fechaAprobacion: getVal(["fechaaprobacion", "aprobacion"], 8) || undefined,
      estado: (getVal(["estado", "status"], 9) as any) || "Aprobado",
      columnasAdicionales: Object.keys(extraCols).length > 0 ? extraCols : undefined,
    };
  });
}

function parseGarantiasRows(rows: string[][]): GarantiaItem[] {
  if (!rows || rows.length <= 1) return MOCK_GARANTIAS;
  const headerRow = rows[0] || [];
  const headerMap = buildHeaderIndexMap(headerRow);
  const dataRows = rows.slice(1);

  const mappedIndices = new Set<number>();
  GARANTIAS_FIELD_SPECS.forEach((spec) => {
    for (const alias of spec.aliases) {
      const norm = normalizeHeader(alias);
      if (headerMap[norm] !== undefined) {
        mappedIndices.add(headerMap[norm].index);
        break;
      }
    }
  });

  return dataRows.map((row, index) => {
    const getVal = (aliases: string[], fallbackIdx: number) =>
      getCellValueByAliases(row, headerMap, aliases, fallbackIdx);
    const parseNum = (val: string) => Number(val.replace(/[^0-9.-]+/g, "")) || 0;
    const extraCols = extractUnmappedColumns(row, headerRow, mappedIndices);

    return {
      id: getVal(["id", "idgarantia", "codigo"], 0) || `GAR-${String(index + 1).padStart(3, "0")}`,
      obraId: getVal(["obraid", "idobra"], 1) || "",
      obraNombre: getVal(["obranombre", "nombreobra", "obra"], 2) || "",
      contratistaNombre: getVal(["contratistanombre", "contratista", "tomador", "empresa"], 3) || "",
      tipo: getVal(["tipo", "tipogarantia", "concepto"], 4) || "Fiel Cumplimiento",
      entidadEmisora: getVal(["entidademisora", "aseguradora", "banco", "emisor"], 5) || "Compañía Aseguradora",
      numeroPoliza: getVal(["numeropoliza", "nropoliza", "poliza"], 6) || `POL-${index + 100}`,
      montoAsegurado: parseNum(getVal(["montoasegurado", "monto", "sumaasegurada"], 7)),
      fechaEmision: getVal(["fechaemision", "emision", "vigenciadesde"], 8) || "",
      fechaVencimiento: getVal(["fechavencimiento", "vencimiento", "vigenciahasta"], 9) || "",
      estado: (getVal(["estado", "situacion", "status"], 10) as any) || "Vigente",
      observaciones: getVal(["observaciones", "notas", "detalle"], 11) || undefined,
      columnasAdicionales: Object.keys(extraCols).length > 0 ? extraCols : undefined,
    };
  });
}

// ============================================================================
// SERVICIOS PÚBLICOS CACHEADOS (NEXT.JS DATA CACHE)
// ============================================================================

const revalidateTime = Number(
  process.env.SHEETS_CACHE_REVALIDATE_SECONDS || DEFAULT_REVALIDATE_SECONDS
);

export const getObras = unstable_cache(
  async (): Promise<ObraItem[]> => {
    const config = getSheetsConfig();
    if (!config.obrasSpreadsheetId) {
      return MOCK_OBRAS;
    }

    const result = await fetchSheetDataSmart(config.obrasSpreadsheetId, "obras");
    if (result.status === "CONNECTED" && result.rows.length > 1) {
      return parseObrasRows(result.rows);
    }

    return MOCK_OBRAS;
  },
  ["obras-list"],
  {
    revalidate: revalidateTime,
    tags: [SHEETS_CACHE_TAG, "obras"],
  }
);

export const getContratistas = unstable_cache(
  async (): Promise<ContratistaItem[]> => {
    const config = getSheetsConfig();
    if (!config.contratistasSpreadsheetId) {
      return MOCK_CONTRATISTAS;
    }

    const result = await fetchSheetDataSmart(config.contratistasSpreadsheetId, "contratistas");
    if (result.status === "CONNECTED" && result.rows.length > 1) {
      return parseContratistasRows(result.rows);
    }

    return MOCK_CONTRATISTAS;
  },
  ["contratistas-list"],
  {
    revalidate: revalidateTime,
    tags: [SHEETS_CACHE_TAG, "contratistas"],
  }
);

export const getCertificaciones = unstable_cache(
  async (): Promise<CertificacionItem[]> => {
    const config = getSheetsConfig();
    if (!config.certificacionesSpreadsheetId) {
      return MOCK_CERTIFICACIONES;
    }

    const result = await fetchSheetDataSmart(config.certificacionesSpreadsheetId, "certificaciones");
    if (result.status === "CONNECTED" && result.rows.length > 1) {
      return parseCertificacionesRows(result.rows);
    }

    return MOCK_CERTIFICACIONES;
  },
  ["certificaciones-list"],
  {
    revalidate: revalidateTime,
    tags: [SHEETS_CACHE_TAG, "certificaciones"],
  }
);

export const getGarantias = unstable_cache(
  async (): Promise<GarantiaItem[]> => {
    const config = getSheetsConfig();
    const sheetId = config.garantiasSpreadsheetId || config.obrasSpreadsheetId;
    if (!sheetId) {
      return MOCK_GARANTIAS;
    }

    const result = await fetchSheetDataSmart(sheetId, "garantias");
    if (result.status === "CONNECTED" && result.rows.length > 1) {
      return parseGarantiasRows(result.rows);
    }

    return MOCK_GARANTIAS;
  },
  ["garantias-list"],
  {
    revalidate: revalidateTime,
    tags: [SHEETS_CACHE_TAG, "garantias"],
  }
);

export const getAlertas = unstable_cache(
  async (): Promise<AlertaItem[]> => {
    const obras = await getObras();
    const alertas: AlertaItem[] = [];

    obras.forEach((obra) => {
      const desvio = Number((obra.avanceFinanciero - obra.avanceFisico).toFixed(1));

      if (desvio > 10) {
        alertas.push({
          id: `ALT-FIN-${obra.id}`,
          obraId: obra.id,
          obraCodigo: obra.codigo,
          obraNombre: obra.nombre,
          severidad: "Alta",
          tipo: "Desvío Presupuestario",
          descripcion: `Avance financiero (${obra.avanceFinanciero}%) supera al avance físico (${obra.avanceFisico}%) por más de 10 puntos.`,
          desvioPorcentaje: desvio,
          fechaDeteccion: new Date().toISOString().split("T")[0],
          accionSugerida: "Auditar últimas certificaciones y curva de inversión.",
        });
      }

      if (obra.estado === "En Ejecución" && obra.fechaFinEstimada) {
        const fechaFin = new Date(obra.fechaFinEstimada);
        const hoy = new Date();
        const diasRestantes = Math.ceil(
          (fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diasRestantes < 60 && obra.avanceFisico < 70) {
          alertas.push({
            id: `ALT-CRON-${obra.id}`,
            obraId: obra.id,
            obraCodigo: obra.codigo,
            obraNombre: obra.nombre,
            severidad: "Alta",
            tipo: "Retraso Cronograma",
            descripcion: `Restan ${diasRestantes} días de contrato con solo el ${obra.avanceFisico}% ejecutado.`,
            fechaDeteccion: new Date().toISOString().split("T")[0],
            accionSugerida: "Exigir reprogramación de cronograma de obra al contratista.",
          });
        }
      }
    });

    return alertas;
  },
  ["alertas-list"],
  {
    revalidate: revalidateTime,
    tags: [SHEETS_CACHE_TAG, "alertas"],
  }
);

export const getDashboardMetrics = unstable_cache(
  async (): Promise<DashboardMetrics> => {
    const [obras, contratistas, alertas, garantias] = await Promise.all([
      getObras(),
      getContratistas(),
      getAlertas(),
      getGarantias(),
    ]);

    const totalCertificado = obras.reduce(
      (acc, curr) => acc + (curr.montoCertificadoAcumulado || 0),
      0
    );

    const promedioFisico =
      obras.length > 0
        ? Number(
            (
              obras.reduce((acc, curr) => acc + (curr.avanceFisico || 0), 0) /
              obras.length
            ).toFixed(1)
          )
        : 0;

    const alertasAlta = alertas.filter((a) => a.severidad === "Alta").length;
    const garantiasVigentes = garantias.filter((g) => g.estado === "Vigente").length;

    return {
      totalObrasEjecucion: obras.filter((o) => o.estado === "En Ejecución").length,
      totalObrasVariacionMes: 1,
      montoCertificadoAcumulado: totalCertificado,
      montoVariacionPorcentual: 4.8,
      alertasActivasCount: alertas.length,
      alertasAltaCount: alertasAlta,
      contratistasActivosCount: contratistas.filter((c) => c.estado === "Activo").length,
      avancePromedioFisico: promedioFisico,
      totalGarantiasVigentesCount: garantiasVigentes,
    };
  },
  ["dashboard-metrics"],
  {
    revalidate: revalidateTime,
    tags: [SHEETS_CACHE_TAG, "metrics"],
  }
);

const MOCK_AVANCE_MENSUAL: AvanceMensualItem[] = [
  { mes: "May", programado: 22, real: 21 },
  { mes: "Jun", programado: 35, real: 33 },
  { mes: "Jul", programado: 48, real: 45 },
  { mes: "Ago", programado: 60, real: 56 },
  { mes: "Sep", programado: 72, real: 68 },
  { mes: "Oct", programado: 84, real: 77 },
];

export const getAvanceMensual = unstable_cache(
  async (): Promise<AvanceMensualItem[]> => {
    return MOCK_AVANCE_MENSUAL;
  },
  ["avance-mensual"],
  {
    revalidate: revalidateTime,
    tags: [SHEETS_CACHE_TAG, "avance-mensual"],
  }
);

// ============================================================================
// AUDITORÍA Y DIAGNÓSTICO EN TIEMPO REAL
// ============================================================================

export function auditSheetHeaders(
  headerRow: string[],
  sampleDataRow: string[] | undefined,
  fieldSpecs: { field: string; label: string; required: boolean; aliases: string[] }[]
): {
  detectedHeaders: DetectedHeader[];
  unmappedHeaders: DetectedHeader[];
  mappedFieldsCount: number;
  expectedFields: ExpectedFieldAudit[];
} {
  const headerMap = buildHeaderIndexMap(headerRow);
  const mappedIndices = new Set<number>();

  const expectedFields: ExpectedFieldAudit[] = fieldSpecs.map((spec) => {
    let matchedIndex: number | undefined = undefined;
    let matchedHeader: string | undefined = undefined;

    for (const alias of spec.aliases) {
      const norm = normalizeHeader(alias);
      if (headerMap[norm] !== undefined) {
        matchedIndex = headerMap[norm].index;
        matchedHeader = headerMap[norm].originalName;
        mappedIndices.add(matchedIndex);
        break;
      }
    }

    const found = matchedIndex !== undefined;
    const sampleValue = found && sampleDataRow ? sampleDataRow[matchedIndex!] : undefined;

    return {
      field: spec.field,
      label: spec.label,
      required: spec.required,
      found,
      matchedHeader,
      sampleValue: sampleValue !== undefined && sampleValue !== null ? String(sampleValue) : undefined,
    };
  });

  const detectedHeaders: DetectedHeader[] = headerRow.map((colName, idx) => {
    const isMapped = mappedIndices.has(idx);
    const matchedSpec = fieldSpecs.find((spec) => {
      for (const alias of spec.aliases) {
        if (normalizeHeader(alias) === normalizeHeader(colName)) return true;
      }
      return false;
    });

    const sampleVal = sampleDataRow ? sampleDataRow[idx] : undefined;

    return {
      name: colName,
      index: idx,
      normalized: normalizeHeader(colName),
      isMapped,
      mappedField: matchedSpec?.field,
      sampleValue: sampleVal !== undefined && sampleVal !== null ? String(sampleVal) : undefined,
    };
  });

  const unmappedHeaders = detectedHeaders.filter((h) => !h.isMapped && h.name.trim() !== "");
  const mappedFieldsCount = expectedFields.filter((f) => f.found).length;

  return {
    detectedHeaders,
    unmappedHeaders,
    mappedFieldsCount,
    expectedFields,
  };
}

/**
 * Inspecciona el estado de conexión con Google Sheets y audita las cabeceras
 * detectadas en las 4 planillas del sistema (Obras, Contratistas, Certificaciones, Garantías).
 */
export async function getSheetDiagnosticData(): Promise<SheetsDiagnosticData> {
  const config = getSheetsConfig();
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || "";
  const hasServiceAccountEmail = Boolean(serviceAccountEmail.trim());
  const hasPrivateKey = Boolean(rawKey.trim());
  const configured = hasServiceAccountEmail && hasPrivateKey;
  const mode = configured ? "LIVE_GOOGLE_SHEETS" : "FALLBACK_MOCK";

  const sheetsToInspect = [
    {
      key: "obras" as const,
      title: "Planilla Maestra de Obras",
      preferredTab: "obras",
      tabRange: "Obras!A:ZZ",
      spreadsheetId: config.obrasSpreadsheetId,
      fieldSpecs: OBRAS_FIELD_SPECS,
      mockHeaders: [
        "ID Obra", "Código Expediente", "Denominación de Obra", "Tipología",
        "Ubicación", "Contratista ID", "Razón Social Contratista", "Presupuesto Oficial",
        "Monto Contratado", "Monto Certificado Acumulado", "% Avance Físico", "% Avance Financiero",
        "Fecha Inicio", "Fecha Fin Estimada", "Estado", "Inspector Técnico a Cargo"
      ],
      mockSampleRow: [
        "OB-001", "OBR-2024-001", "Autopista Conexión Fluvial - Tramo II", "Vial",
        "Rosario, Santa Fe", "CTR-01", "Constructora del Litoral S.A.", "$ 850.000.000",
        "$ 890.000.000", "$ 614.100.000", "69.0%", "68.5%",
        "2024-01-15", "2025-06-30", "En Ejecución", "Ing. Carlos Mendoza"
      ],
    },
    {
      key: "contratistas" as const,
      title: "Planilla de Empresas Contratistas",
      preferredTab: "contratistas",
      tabRange: "Contratistas!A:ZZ",
      spreadsheetId: config.contratistasSpreadsheetId,
      fieldSpecs: CONTRATISTAS_FIELD_SPECS,
      mockHeaders: [
        "ID", "CUIT", "Razón Social", "Representante Técnico",
        "Correo Electrónico", "Teléfono", "Obras Activas", "Estado Habilitación"
      ],
      mockSampleRow: [
        "CTR-01", "30-71049281-9", "Constructora del Litoral S.A.", "Ing. Hernán Pereyra",
        "contacto@constructoradellitoral.com.ar", "+54 341 482-9900", "2", "Activo"
      ],
    },
    {
      key: "certificaciones" as const,
      title: "Planilla de Certificaciones y Actas",
      preferredTab: "certificaciones",
      tabRange: "Certificaciones!A:ZZ",
      spreadsheetId: config.certificacionesSpreadsheetId,
      fieldSpecs: CERTIFICACIONES_FIELD_SPECS,
      mockHeaders: [
        "ID Certificado", "Número de Certificado", "ID Obra", "Nombre de Obra",
        "Período", "Monto Certificado", "% Avance del Mes", "Fecha Presentación",
        "Fecha Aprobación", "Estado"
      ],
      mockSampleRow: [
        "CERT-2024-009", "9", "OB-001", "Autopista Conexión Fluvial - Tramo II",
        "2024-08", "$ 84.500.000", "8.5%", "2024-09-05",
        "2024-09-18", "Aprobado"
      ],
    },
    {
      key: "garantias" as const,
      title: "Planilla de Garantías y Pólizas de Caución",
      preferredTab: "garantias",
      tabRange: "Garantias!A:ZZ",
      spreadsheetId: config.garantiasSpreadsheetId || config.obrasSpreadsheetId,
      fieldSpecs: GARANTIAS_FIELD_SPECS,
      mockHeaders: [
        "ID Garantía", "ID Obra", "Nombre de Obra", "Contratista / Tomador",
        "Tipo de Garantía", "Aseguradora / Banco Emisor", "N° de Póliza", "Monto Asegurado",
        "Fecha Emisión", "Fecha Vencimiento", "Estado", "Observaciones"
      ],
      mockSampleRow: [
        "GAR-001", "OB-001", "Autopista Conexión Fluvial - Tramo II", "Constructora del Litoral S.A.",
        "Fiel Cumplimiento", "La Holando Sudamericana Cía de Seguros", "POL-488921-FC", "$ 89.000.000",
        "2024-01-10", "2025-07-30", "Vigente", "Cubre el 10% del contrato de obra."
      ],
    },
  ];

  const sheetsAuditResults: SheetAuditInfo[] = [];

  for (const sheetDef of sheetsToInspect) {
    let headerRow: string[] = [];
    let sampleDataRow: string[] | undefined = undefined;
    let totalRows = 0;
    let status: "CONNECTED" | "EMPTY" | "ERROR" | "FALLBACK_MOCK" = "FALLBACK_MOCK";
    let errorMessage: string | undefined = undefined;
    let resolvedRange = sheetDef.tabRange;
    let availableTabs: string[] | undefined = undefined;

    if (configured && sheetDef.spreadsheetId) {
      const res = await fetchSheetDataSmart(sheetDef.spreadsheetId, sheetDef.preferredTab);
      status = res.status;
      errorMessage = res.errorMessage;
      availableTabs = res.availableTabs;

      if (res.resolvedTabName) {
        resolvedRange = `'${res.resolvedTabName}'!A:ZZ`;
      }

      if (res.status === "CONNECTED" && res.rows.length > 0) {
        headerRow = res.rows[0];
        sampleDataRow = res.rows[1];
        totalRows = Math.max(0, res.rows.length - 1);
      } else if (res.status === "EMPTY") {
        headerRow = res.rows[0] || sheetDef.mockHeaders;
        totalRows = 0;
      } else if (res.status === "ERROR") {
        headerRow = sheetDef.mockHeaders;
        sampleDataRow = sheetDef.mockSampleRow;
        totalRows = 0;
      }
    }

    if (headerRow.length === 0) {
      headerRow = sheetDef.mockHeaders;
      sampleDataRow = sheetDef.mockSampleRow;
      totalRows = 5;
      if (status !== "ERROR") {
        status = "FALLBACK_MOCK";
      }
    }

    const audit = auditSheetHeaders(headerRow, sampleDataRow, sheetDef.fieldSpecs);

    const sampleRowObj: Record<string, string> = {};
    headerRow.forEach((col, idx) => {
      if (sampleDataRow && sampleDataRow[idx] !== undefined) {
        sampleRowObj[col || `Columna ${idx + 1}`] = String(sampleDataRow[idx]);
      }
    });

    sheetsAuditResults.push({
      sheetKey: sheetDef.key,
      title: sheetDef.title,
      tabRange: resolvedRange,
      spreadsheetId: sheetDef.spreadsheetId || "No configurado (usando demo)",
      spreadsheetUrl: sheetDef.spreadsheetId
        ? `https://docs.google.com/spreadsheets/d/${sheetDef.spreadsheetId}/edit`
        : "",
      status,
      errorMessage,
      totalRows,
      detectedHeaders: audit.detectedHeaders,
      unmappedHeaders: audit.unmappedHeaders,
      mappedFieldsCount: audit.mappedFieldsCount,
      expectedFields: audit.expectedFields,
      sampleRow: sampleRowObj,
      availableTabs,
    });
  }

  return {
    connectionStatus: {
      configured,
      hasServiceAccountEmail,
      serviceAccountEmail: serviceAccountEmail ? serviceAccountEmail : undefined,
      hasPrivateKey,
      mode,
      revalidateSeconds: revalidateTime,
    },
    sheets: sheetsAuditResults,
    lastChecked: new Date().toISOString(),
  };
}
