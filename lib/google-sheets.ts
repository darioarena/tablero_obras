import { google } from "googleapis";
import { unstable_cache } from "next/cache";
import {
  SheetConfig,
  ObraItem,
  ContratistaItem,
  CertificacionItem,
  AlertaItem,
  AvanceMensualItem,
  DashboardMetrics,
  SheetsDiagnosticData,
  SheetAuditInfo,
  DetectedHeader,
  ExpectedFieldAudit,
} from "@/types/sheets";

// ============================================================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================================================

export const SHEETS_CACHE_TAG = "google-sheets-data";
const DEFAULT_REVALIDATE_SECONDS = 300; // 5 minutos por defecto

/**
 * Obtiene la configuración de IDs de planillas desde las variables de entorno.
 * Permite tanto el objeto JSON `SHEETS_CONFIG` como variables individuales.
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
      };
    } catch (e) {
      console.warn("[GoogleSheets] Error parseando SHEETS_CONFIG como JSON, recurriendo a variables individuales.", e);
    }
  }

  return {
    obrasSpreadsheetId: process.env.SHEETS_OBRAS_ID || "",
    contratistasSpreadsheetId: process.env.SHEETS_CONTRATISTAS_ID || "",
    certificacionesSpreadsheetId: process.env.SHEETS_CERTIFICACIONES_ID || "",
  };
}

/**
 * Valida y formatea la Private Key de la Service Account
 */
function cleanPrivateKey(key?: string): string | undefined {
  if (!key) return undefined;
  // Reemplaza posibles secuencias literales de escape \n por saltos de línea reales
  return key.replace(/\\n/g, "\n");
}

/**
 * Inicializa el cliente autenticado de Google Sheets API v4
 */
function getGoogleSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const privateKey = cleanPrivateKey(rawKey);

  if (!email || !privateKey) {
    return null;
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

// ============================================================================
// DATOS MOCK DE CONTINGENCIA (FALLBACK CORP)
// ============================================================================
// Permite que la app funcione fluidamente en desarrollo o demostraciones iniciales
// antes de completar las credenciales del Service Account en Google Cloud.

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
    avanceFinanciero: 54.2, // Desvío financiero detectado
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
    contratistaId: "CTR-01",
    contratistaNombre: "Constructora del Litoral S.A.",
    presupuestoOficial: 310000000,
    montoContratado: 315000000,
    montoCertificadoAcumulado: 94500000,
    avanceFisico: 30.0,
    avanceFinanciero: 30.0,
    fechaInicio: "2024-06-15",
    fechaFinEstimada: "2025-03-31",
    estado: "En Ejecución",
    inspectorACargo: "Ing. Roberto Peña",
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
    cuit: "30-68491024-4",
    razonSocial: "Infraestructuras Andinas S.R.L.",
    representanteTecnico: "Ing. Beatriz Morales",
    email: "licitaciones@i-andinas.com.ar",
    telefono: "+54 351 556-7812",
    obrasActivasCount: 1,
    estado: "Activo",
  },
  {
    id: "CTR-03",
    cuit: "30-59281734-2",
    razonSocial: "Vialidad & Redes Urbanas S.A.",
    representanteTecnico: "Ing. Gustavo Álvarez",
    email: "administracion@vialidadyredes.com.ar",
    telefono: "+54 221 423-1190",
    obrasActivasCount: 1,
    estado: "Activo",
  },
  {
    id: "CTR-04",
    cuit: "30-71829103-6",
    razonSocial: "TecnoEdificaciones Sur S.A.",
    representanteTecnico: "Arq. Martín Zeballos",
    email: "obras@tecnoedificacionessur.com",
    telefono: "+54 299 448-9100",
    obrasActivasCount: 1,
    estado: "Activo",
  },
];

const MOCK_ALERTAS: AlertaItem[] = [
  {
    id: "ALT-01",
    obraId: "OB-002",
    obraCodigo: "OBR-2024-004",
    obraNombre: "Puente Distribuidor Acceso Norte",
    severidad: "Alta",
    tipo: "Desvío Presupuestario",
    descripcion: "Avance financiero superior en 6.2% respecto a las certificaciones físicas aprobadas en curva base.",
    desvioPorcentaje: 6.2,
    fechaDeteccion: "2024-09-28",
    accionSugerida: "Convocar a reunión de auditoría con la inspección técnica y retener liquidación adicional.",
  },
  {
    id: "ALT-02",
    obraId: "OB-004",
    obraCodigo: "OBR-2024-012",
    obraNombre: "Hospital Modular Regional de Alta Complejidad",
    severidad: "Alta",
    tipo: "Retraso Cronograma",
    descripcion: "Retraso de 18 días hábiles en hormigonado de fundaciones por demoras en provisión de áridos.",
    desvioPorcentaje: -8.0,
    fechaDeteccion: "2024-10-02",
    accionSugerida: "Notificar intimación al contratista y solicitar reformulación de cronograma con doble turno.",
  },
  {
    id: "ALT-03",
    obraId: "OB-001",
    obraCodigo: "OBR-2024-001",
    obraNombre: "Autopista Conexión Fluvial - Tramo II",
    severidad: "Media",
    tipo: "Certificación Pendiente",
    descripcion: "Certificado N° 9 del periodo agosto pendiente de firma por adecuación de precios provisorios.",
    fechaDeteccion: "2024-10-05",
    accionSugerida: "Aprobar cálculo de reajuste conforme índice INDEC de costo de la construcción.",
  },
  {
    id: "ALT-04",
    obraId: "OB-005",
    obraCodigo: "OBR-2024-019",
    obraNombre: "Pavimentación y Drenaje Parque Industrial Oeste",
    severidad: "Baja",
    tipo: "Inspección Crítica",
    descripcion: "Ensayos de densidad de subbase pendientes de entrega en libro de obra digital.",
    fechaDeteccion: "2024-10-07",
    accionSugerida: "Solicitar al laboratorio de control de calidad el informe de probetas.",
  },
];

const MOCK_AVANCE_MENSUAL: AvanceMensualItem[] = [
  { mes: "May", programado: 22, real: 21 },
  { mes: "Jun", programado: 35, real: 33 },
  { mes: "Jul", programado: 48, real: 45 },
  { mes: "Ago", programado: 60, real: 56 },
  { mes: "Sep", programado: 72, real: 68 },
  { mes: "Oct", programado: 84, real: 77 },
];

// ============================================================================
// MOTOR DE MAPEO DINÁMICO POR CABECERAS (HEADER-BASED MAPPING)
// ============================================================================

/**
 * Normaliza nombres de columnas eliminando acentos, espacios y caracteres especiales.
 * Permite emparejar "Denominación de Obra", "% Avance Físico", "monto_contratado", etc.
 */
export function normalizeHeader(header?: string): string {
  if (!header || typeof header !== "string") return "";
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/[^a-z0-9]/g, "") // quita signos de puntuación, espacios, %, $, etc.
    .trim();
}

export interface HeaderIndexMap {
  [normalized: string]: { index: number; originalName: string };
}

export function buildHeaderIndexMap(headerRow: string[]): HeaderIndexMap {
  const map: HeaderIndexMap = {};
  if (!headerRow) return map;
  headerRow.forEach((col, idx) => {
    if (col && typeof col === "string") {
      const norm = normalizeHeader(col);
      if (norm) {
        map[norm] = { index: idx, originalName: col.trim() };
      }
    }
  });
  return map;
}

export function getCellValueByAliases(
  row: string[],
  headerMap: HeaderIndexMap,
  aliases: string[],
  fallbackIndex?: number
): string {
  for (const alias of aliases) {
    const norm = normalizeHeader(alias);
    if (headerMap[norm] !== undefined) {
      const idx = headerMap[norm].index;
      if (row[idx] !== undefined && row[idx] !== null) {
        return String(row[idx]).trim();
      }
    }
  }
  // Si no se encuentra por nombre de cabecera pero existe fallback posicional
  if (fallbackIndex !== undefined && fallbackIndex < row.length) {
    const val = row[fallbackIndex];
    if (val !== undefined && val !== null) {
      return String(val).trim();
    }
  }
  return "";
}

/**
 * Identifica y extrae columnas adicionales presentes en el Sheet que no correspondan
 * a los campos estándar del sistema, guardándolas como key-value en columnasAdicionales.
 */
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

// ============================================================================
// FUNCIONES DE CONSULTA CON CACHE EN SERVIDOR (NEXT.JS DATA CACHE)
// ============================================================================

/**
 * Consulta de bajo nivel a Google Sheets API v4
 */
async function fetchSheetDataRaw(spreadsheetId: string, range: string): Promise<string[][] | null> {
  const sheets = getGoogleSheetsClient();
  if (!sheets || !spreadsheetId) return null;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return (response.data.values as string[][]) || [];
  } catch (error) {
    console.error(`[GoogleSheets] Error obteniendo rango ${range} de hoja ${spreadsheetId}:`, error);
    return null;
  }
}

/**
 * Parseo dinámico de filas de Obras mediante cabeceras
 */
function parseObrasRows(rows: string[][]): ObraItem[] {
  if (!rows || rows.length <= 1) return MOCK_OBRAS;
  const headerRow = rows[0] || [];
  const headerMap = buildHeaderIndexMap(headerRow);
  const dataRows = rows.slice(1);

  // Registrar índices mapeados para identificar columnas adicionales
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

/**
 * Parseo dinámico de filas de Contratistas mediante cabeceras
 */
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

/**
 * Parseo dinámico de filas de Certificaciones mediante cabeceras
 */
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

// ============================================================================
// SERVICIOS PÚBLICOS CACHEADOS
// ============================================================================

const revalidateTime = Number(
  process.env.SHEETS_CACHE_REVALIDATE_SECONDS || DEFAULT_REVALIDATE_SECONDS
);

/**
 * Obtiene el listado completo de obras con Next.js Data Cache (lee hasta columna ZZ para capturar nuevas columnas)
 */
export const getObras = unstable_cache(
  async (): Promise<ObraItem[]> => {
    const config = getSheetsConfig();
    if (!config.obrasSpreadsheetId) {
      return MOCK_OBRAS;
    }

    const rows = await fetchSheetDataRaw(config.obrasSpreadsheetId, "Obras!A:ZZ");
    if (!rows || rows.length === 0) {
      return MOCK_OBRAS;
    }

    return parseObrasRows(rows);
  },
  ["obras-list"],
  {
    revalidate: revalidateTime,
    tags: [SHEETS_CACHE_TAG, "obras"],
  }
);

/**
 * Obtiene el listado de contratistas con Next.js Data Cache
 */
export const getContratistas = unstable_cache(
  async (): Promise<ContratistaItem[]> => {
    const config = getSheetsConfig();
    if (!config.contratistasSpreadsheetId) {
      return MOCK_CONTRATISTAS;
    }

    const rows = await fetchSheetDataRaw(config.contratistasSpreadsheetId, "Contratistas!A:ZZ");
    if (!rows || rows.length === 0) {
      return MOCK_CONTRATISTAS;
    }

    return parseContratistasRows(rows);
  },
  ["contratistas-list"],
  {
    revalidate: revalidateTime,
    tags: [SHEETS_CACHE_TAG, "contratistas"],
  }
);

/**
 * Obtiene el listado de certificaciones con Next.js Data Cache
 */
export const getCertificaciones = unstable_cache(
  async (): Promise<CertificacionItem[]> => {
    const config = getSheetsConfig();
    if (!config.certificacionesSpreadsheetId) {
      return MOCK_CERTIFICACIONES;
    }

    const rows = await fetchSheetDataRaw(config.certificacionesSpreadsheetId, "Certificaciones!A:ZZ");
    if (!rows || rows.length === 0) {
      return MOCK_CERTIFICACIONES;
    }

    return parseCertificacionesRows(rows);
  },
  ["certificaciones-list"],
  {
    revalidate: revalidateTime,
    tags: [SHEETS_CACHE_TAG, "certificaciones"],
  }
);

/**
 * Obtiene las alertas activas de obras
 */
export const getAlertas = unstable_cache(
  async (): Promise<AlertaItem[]> => {
    const config = getSheetsConfig();
    if (config.obrasSpreadsheetId) {
      const rows = await fetchSheetDataRaw(config.obrasSpreadsheetId, "Alertas!A:ZZ");
      if (rows && rows.length > 1) {
        return rows.slice(1).map((r, i) => ({
          id: r[0] || `ALT-${i + 1}`,
          obraId: r[1] || "",
          obraCodigo: r[2] || "",
          obraNombre: r[3] || "",
          severidad: (r[4] as any) || "Media",
          tipo: (r[5] as any) || "Retraso Cronograma",
          descripcion: r[6] || "",
          fechaDeteccion: r[7] || "",
          accionSugerida: r[8] || "",
        }));
      }
    }

    return MOCK_ALERTAS;
  },
  ["alertas-list"],
  {
    revalidate: revalidateTime,
    tags: [SHEETS_CACHE_TAG, "alertas"],
  }
);

/**
 * Obtiene la curva de avance mensual agregado (Programado vs Real)
 */
export const getAvanceMensual = unstable_cache(
  async (): Promise<AvanceMensualItem[]> => {
    return MOCK_AVANCE_MENSUAL;
  },
  ["avance-mensual"],
  {
    revalidate: revalidateTime,
    tags: [SHEETS_CACHE_TAG, "metricas"],
  }
);

/**
 * Calcula los KPIs y métricas consolidadas del Dashboard
 */
export const getDashboardMetrics = unstable_cache(
  async (): Promise<DashboardMetrics> => {
    const obras = await getObras();
    const contratistas = await getContratistas();
    const alertas = await getAlertas();

    const obrasEnEjecucion = obras.filter((o) => o.estado === "En Ejecución");
    const montoCertificadoTotal = obras.reduce(
      (sum, item) => sum + (item.montoCertificadoAcumulado || 0),
      0
    );
    const contratistasActivos = contratistas.filter((c) => c.estado === "Activo").length;
    const alertasAlta = alertas.filter((a) => a.severidad === "Alta").length;

    const avancePromedio =
      obrasEnEjecucion.length > 0
        ? obrasEnEjecucion.reduce((acc, o) => acc + o.avanceFisico, 0) / obrasEnEjecucion.length
        : 0;

    return {
      totalObrasEjecucion: obrasEnEjecucion.length,
      totalObrasVariacionMes: 2, // 2 nuevas obras incorporadas en el mes
      montoCertificadoAcumulado: montoCertificadoTotal,
      montoVariacionPorcentual: 14.8, // +14.8% en el último mes
      alertasActivasCount: alertas.length,
      alertasAltaCount: alertasAlta,
      contratistasActivosCount: contratistasActivos,
      avancePromedioFisico: avancePromedio,
    };
  },
  ["dashboard-metrics"],
  {
    revalidate: revalidateTime,
    tags: [SHEETS_CACHE_TAG, "dashboard-metrics"],
  }
);

// ============================================================================
// AUDITORÍA Y DIAGNÓSTICO DE CONEXIONES SHEETS (EXCLUSIVO ADMIN)
// ============================================================================

function auditSheetHeaders(
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
 * detectadas en cada una de las planillas configuradas.
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
      tabRange: "Obras!A:ZZ",
      spreadsheetId: config.obrasSpreadsheetId,
      fieldSpecs: OBRAS_FIELD_SPECS,
      mockHeaders: [
        "ID Obra", "Código Expediente", "Denominación de Obra", "Tipología",
        "Ubicación", "Contratista ID", "Razón Social Contratista", "Presupuesto Oficial",
        "Monto Contratado", "Monto Certificado Acumulado", "% Avance Físico", "% Avance Financiero",
        "Fecha Inicio", "Fecha Fin Estimada", "Estado", "Inspector Técnico a Cargo",
        "Fuente de Financiamiento", "Plazo Días Corridos", "Expediente Municipal"
      ],
      mockSampleRow: [
        "OB-001", "OBR-2024-001", "Autopista Conexión Fluvial - Tramo II", "Vial",
        "Rosario, Santa Fe", "CTR-01", "Constructora del Litoral S.A.", "$ 850.000.000",
        "$ 890.000.000", "$ 614.100.000", "69.0%", "68.5%",
        "2024-01-15", "2025-06-30", "En Ejecución", "Ing. Carlos Mendoza",
        "Tesoro Provincial / CAF", "540", "EXP-2024-8819-OB"
      ],
    },
    {
      key: "contratistas" as const,
      title: "Planilla de Empresas Contratistas",
      tabRange: "Contratistas!A:ZZ",
      spreadsheetId: config.contratistasSpreadsheetId,
      fieldSpecs: CONTRATISTAS_FIELD_SPECS,
      mockHeaders: [
        "ID", "CUIT", "Razón Social", "Representante Técnico",
        "Correo Electrónico", "Teléfono", "Obras Activas", "Estado Habilitación",
        "Capacidad de Contratación Anual", "Padrón Proveedores N°"
      ],
      mockSampleRow: [
        "CTR-01", "30-71049281-9", "Constructora del Litoral S.A.", "Ing. Hernán Pereyra",
        "contacto@constructoradellitoral.com.ar", "+54 341 482-9900", "2", "Activo",
        "$ 2.500.000.000", "PROV-9941"
      ],
    },
    {
      key: "certificaciones" as const,
      title: "Planilla de Certificaciones y Actas",
      tabRange: "Certificaciones!A:ZZ",
      spreadsheetId: config.certificacionesSpreadsheetId,
      fieldSpecs: CERTIFICACIONES_FIELD_SPECS,
      mockHeaders: [
        "ID Certificado", "Número de Certificado", "ID Obra", "Nombre de Obra",
        "Período", "Monto Certificado", "% Avance del Mes", "Fecha Presentación",
        "Fecha Aprobación", "Estado", "Observaciones del Inspector"
      ],
      mockSampleRow: [
        "CERT-2024-009", "9", "OB-001", "Autopista Conexión Fluvial - Tramo II",
        "2024-08", "$ 84.500.000", "8.5%", "2024-09-05",
        "2024-09-18", "Aprobado", "Aprobado sin observaciones técnicas"
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

    if (configured && sheetDef.spreadsheetId) {
      try {
        const rawData = await fetchSheetDataRaw(sheetDef.spreadsheetId, sheetDef.tabRange);
        if (rawData && rawData.length > 0) {
          headerRow = rawData[0];
          sampleDataRow = rawData[1];
          totalRows = Math.max(0, rawData.length - 1);
          status = totalRows > 0 ? "CONNECTED" : "EMPTY";
        } else {
          status = "EMPTY";
        }
      } catch (err: any) {
        status = "ERROR";
        errorMessage = err?.message || "Error al conectar con la planilla.";
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
      tabRange: sheetDef.tabRange,
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
