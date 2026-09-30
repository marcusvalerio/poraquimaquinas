import { headers } from "next/headers";
import QRCode from "qrcode";
import { z } from "zod";

const shortText = (label: string, max = 120) =>
  z
    .string()
    .trim()
    .min(1, `Preencha o campo ${label}.`)
    .max(max, `${label} deve ter no máximo ${max} caracteres.`);

const longText = (label: string) => shortText(label, 5000);

export const equipmentSchema = z.object({
  conjunto: shortText("Conjunto"),
  subconjunto: shortText("Subconjunto"),
  linha: shortText("Linha"),
  equipamento: shortText("Equipamento"),
  codigoSap: shortText("Código SAP", 60),
  descricaoTecnica: longText("Descrição técnica"),
  funcaoSubconjunto: longText("Função / utilização do subconjunto"),
});

export type EquipmentInput = z.infer<typeof equipmentSchema>;

export function parseEquipmentForm(formData: FormData) {
  const raw = Object.fromEntries(
    Object.keys(equipmentSchema.shape).map((key) => [key, String(formData.get(key) ?? "")]),
  );
  return equipmentSchema.safeParse(raw);
}

/** Photo formats every mobile browser can render (HEIC is Safari-only). */
export const EQUIPMENT_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidQrIdentifier(value: string) {
  return UUID_RE.test(value);
}

/**
 * Base URL encoded in printed QR Codes. Prefers the configured public domain
 * (NEXTAUTH_URL) so a label printed from any environment always points at
 * production; falls back to the current request host for local development.
 */
export async function getPublicBaseUrl() {
  const configured = process.env.NEXTAUTH_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function getPublicEquipmentUrl(qrIdentifier: string) {
  return `${await getPublicBaseUrl()}/equipamento/${qrIdentifier}`;
}

const QR_OPTIONS = { errorCorrectionLevel: "M" as const, margin: 2 };

export function renderQrSvg(url: string) {
  return QRCode.toString(url, { ...QR_OPTIONS, type: "svg" });
}

export function renderQrPng(url: string) {
  return QRCode.toBuffer(url, { ...QR_OPTIONS, type: "png", width: 1024 });
}
