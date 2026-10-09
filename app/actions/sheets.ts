"use server";

import { revalidateTag } from "next/cache";
import { SHEETS_CACHE_TAG } from "@/lib/google-sheets";

export async function revalidateSheetsCacheAction() {
  try {
    revalidateTag(SHEETS_CACHE_TAG);
    return {
      success: true,
      message: "Caché de Google Sheets revalidado con éxito.",
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Error al revalidar el caché de Google Sheets.",
      timestamp: new Date().toISOString(),
    };
  }
}
