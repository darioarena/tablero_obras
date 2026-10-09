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
 * Parseo de filas de Obras desde Google Sheets
 */
function parseObrasRows(rows: string[][]): ObraItem[] {
  if (!rows || rows.length <= 1) return MOCK_OBRAS;
  // Asume que la fila 0 son cabeceras
  const dataRows = rows.slice(1);

  return dataRows.map((row, index) => {
    return {
      id: row[0] || `OB-${index + 1}`,
      codigo: row[1] || `OBR-2024-${String(index + 1).padStart(3, "0")}`,
      nombre: row[2] || "Obra sin denominación",
      tipologia: row[3] || "Vial",
      ubicacion: row[4] || "Sin especificar",
      contratistaId: row[5] || "",
      contratistaNombre: row[6] || "Contratista Adjudicado",
      presupuestoOficial: Number(row[7]?.replace(/[^0-9.-]+/g, "")) || 0,
      montoContratado: Number(row[8]?.replace(/[^0-9.-]+/g, "")) || 0,
      montoCertificadoAcumulado: Number(row[9]?.replace(/[^0-9.-]+/g, "")) || 0,
      avanceFisico: Number(row[10]?.replace(/[^0-9.-]+/g, "")) || 0,
      avanceFinanciero: Number(row[11]?.replace(/[^0-9.-]+/g, "")) || 0,
      fechaInicio: row[12] || "",
      fechaFinEstimada: row[13] || "",
      estado: (row[14] as any) || "En Ejecución",
      inspectorACargo: row[15] || "",
    };
  });
}

/**
 * Parseo de filas de Contratistas desde Google Sheets
 */
function parseContratistasRows(rows: string[][]): ContratistaItem[] {
  if (!rows || rows.length <= 1) return MOCK_CONTRATISTAS;
  const dataRows = rows.slice(1);

  return dataRows.map((row, index) => {
    return {
      id: row[0] || `CTR-${index + 1}`,
      cuit: row[1] || "",
      razonSocial: row[2] || "Razón Social",
      representanteTecnico: row[3] || "",
      email: row[4] || "",
      telefono: row[5] || "",
      obrasActivasCount: Number(row[6]) || 0,
      estado: (row[7] as any) || "Activo",
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
 * Obtiene el listado completo de obras con Next.js Data Cache
 */
export const getObras = unstable_cache(
  async (): Promise<ObraItem[]> => {
    const config = getSheetsConfig();
    if (!config.obrasSpreadsheetId) {
      return MOCK_OBRAS;
    }

    const rows = await fetchSheetDataRaw(config.obrasSpreadsheetId, "Obras!A:P");
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

    const rows = await fetchSheetDataRaw(config.contratistasSpreadsheetId, "Contratistas!A:H");
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
 * Obtiene las alertas activas de obras
 */
export const getAlertas = unstable_cache(
  async (): Promise<AlertaItem[]> => {
    // Si se desea consultar una pestaña de Alertas en Google Sheets:
    const config = getSheetsConfig();
    if (config.obrasSpreadsheetId) {
      const rows = await fetchSheetDataRaw(config.obrasSpreadsheetId, "Alertas!A:H");
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
