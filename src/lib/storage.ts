const BUCKET = process.env.SUPABASE_BUCKET ?? "equipment-photos";

export const EQUIPMENT_PHOTO_PREFIX = "equipment/";

export function isStorageConfigured() {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));
}

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Armazenamento de imagens não configurado. Defina SUPABASE_URL e SUPABASE_SECRET_KEY (ou SUPABASE_SERVICE_ROLE_KEY).",
    );
  }

  return { url, key, isLegacy: !process.env.SUPABASE_SECRET_KEY };
}

function encodePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function headers(key: string, isLegacy: boolean, extra?: HeadersInit) {
  return {
    apikey: key,
    ...(isLegacy ? { Authorization: `Bearer ${key}` } : {}),
    ...extra,
  };
}

async function assertResponse(response: Response, operation: string) {
  if (response.ok) return;
  const body = await response.text().catch(() => "");
  throw new Error(`Falha ao ${operation} no Supabase Storage (${response.status}).${body ? ` ${body}` : ""}`);
}

export async function uploadObject(path: string, body: Buffer, contentType: string): Promise<string> {
  const { url, key, isLegacy } = config();
  const response = await fetch(`${url}/storage/v1/object/${BUCKET}/${encodePath(path)}`, {
    method: "POST",
    headers: headers(key, isLegacy, { "Content-Type": contentType, "Cache-Control": "3600", "x-upsert": "false" }),
    body: body as unknown as BodyInit,
  });
  await assertResponse(response, "enviar a imagem");
  return path;
}

export async function deleteObject(path: string): Promise<void> {
  const { url, key, isLegacy } = config();
  const response = await fetch(`${url}/storage/v1/object/${BUCKET}/${encodePath(path)}`, {
    method: "DELETE",
    headers: headers(key, isLegacy),
  });
  await assertResponse(response, "remover a imagem");
}

async function createSignedUrl(path: string, expiresIn = 60 * 60): Promise<string> {
  const { url, key, isLegacy } = config();
  const response = await fetch(`${url}/storage/v1/object/sign/${BUCKET}/${encodePath(path)}`, {
    method: "POST",
    headers: headers(key, isLegacy, { "Content-Type": "application/json" }),
    body: JSON.stringify({ expiresIn }),
  });
  await assertResponse(response, "gerar a URL assinada");

  const data = (await response.json()) as { signedURL?: string };
  if (!data.signedURL) throw new Error("Supabase não retornou uma URL assinada para a imagem.");
  return data.signedURL.startsWith("http") ? data.signedURL : `${url}/storage/v1${data.signedURL}`;
}

/**
 * Resolves an equipment photo reference into a browser-safe URL. Stored
 * values are either a Supabase object path under `equipment/` (private
 * bucket → short-lived signed URL) or a local `/uploads/...` path used only
 * in development without Supabase configured.
 */
export async function resolveEquipmentPhotoUrl(photoPath: string | null | undefined): Promise<string | null> {
  if (!photoPath) return null;
  if (photoPath.startsWith("/uploads/")) return photoPath;
  if (!photoPath.startsWith(EQUIPMENT_PHOTO_PREFIX)) return null;

  try {
    return await createSignedUrl(photoPath);
  } catch (error) {
    console.error("Não foi possível resolver a foto do equipamento:", error);
    return null;
  }
}
