import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Photo storage on Neon Object Storage (S3-compatible). The bucket is
 * private: the browser only ever receives short-lived presigned GET URLs.
 * Credentials are a Neon branch credential with storage:read + storage:write
 * (token_id → AWS_ACCESS_KEY_ID, s3_secret_access_key → AWS_SECRET_ACCESS_KEY).
 */
const BUCKET = process.env.STORAGE_BUCKET ?? "equipment-photos";

export const EQUIPMENT_PHOTO_PREFIX = "equipment/";

export function isStorageConfigured() {
  return Boolean(
    process.env.AWS_ENDPOINT_URL_S3 && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY,
  );
}

let client: S3Client | undefined;

function s3() {
  if (!isStorageConfigured()) {
    throw new Error(
      "Armazenamento de imagens não configurado. Defina AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY (credencial de storage do Neon).",
    );
  }

  client ??= new S3Client({
    region: process.env.AWS_REGION ?? "us-east-2",
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    // Neon Object Storage only supports path-style addressing.
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
  return client;
}

export async function uploadObject(key: string, body: Buffer, contentType: string): Promise<string> {
  await s3().send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
  return key;
}

export async function deleteObject(key: string): Promise<void> {
  await s3().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

/**
 * Resolves an equipment photo reference into a browser-safe URL. Stored
 * values are either an object key under `equipment/` (private bucket →
 * presigned URL valid for 1 hour) or a local `/uploads/...` path used only
 * in development without storage configured.
 */
export async function resolveEquipmentPhotoUrl(photoPath: string | null | undefined): Promise<string | null> {
  if (!photoPath) return null;
  if (photoPath.startsWith("/uploads/")) return photoPath;
  if (!photoPath.startsWith(EQUIPMENT_PHOTO_PREFIX)) return null;

  try {
    return await getSignedUrl(s3(), new GetObjectCommand({ Bucket: BUCKET, Key: photoPath }), { expiresIn: 60 * 60 });
  } catch (error) {
    console.error("Não foi possível resolver a foto do equipamento:", error);
    return null;
  }
}
