import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { EQUIPMENT_PHOTO_PREFIX, deleteObject, isStorageConfigured, uploadObject } from "@/lib/storage";

const MAX_SIZE = 8 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Confirms the file's actual bytes match the declared image format instead of
 * trusting the browser-reported MIME type or the filename extension.
 */
function matchesImageSignature(type: string, bytes: Buffer): boolean {
  if (bytes.length < 12) return false;
  switch (type) {
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/png":
      return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case "image/webp":
      return bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
    default:
      return false;
  }
}

/**
 * Validates and persists an equipment photo. In production it goes to the
 * private Neon Object Storage bucket under `equipment/`; without storage configured it
 * fails loudly in production and falls back to public/uploads in development.
 */
export async function saveEquipmentPhoto(file: File): Promise<string> {
  const extension = EXTENSIONS[file.type];
  if (!extension) throw new Error("Formato de imagem não suportado. Use JPG, PNG ou WEBP.");
  if (file.size > MAX_SIZE) throw new Error("Imagem excede o tamanho máximo de 8MB.");

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!matchesImageSignature(file.type, buffer)) {
    throw new Error("O arquivo enviado não é uma imagem válida.");
  }

  const filename = `${randomUUID()}.${extension}`;

  if (isStorageConfigured()) {
    return uploadObject(`${EQUIPMENT_PHOTO_PREFIX}${filename}`, buffer, file.type);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Armazenamento de imagens não configurado. Defina as variáveis AWS_* do Neon Object Storage antes de operar em produção.",
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "equipment");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/equipment/${filename}`;
}

export async function removeEquipmentPhoto(photoPath: string | null | undefined) {
  if (!photoPath || !photoPath.startsWith(EQUIPMENT_PHOTO_PREFIX) || !isStorageConfigured()) return;
  await deleteObject(photoPath);
}
