// Cloudflare R2 Storage Client
// Compatible con AWS S3 API

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuración del cliente R2
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;

// Cliente S3 configurado para Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Nombres de los buckets
export const R2_BUCKETS = {
  PHOTOS_PROFILE_PENDING: 'photos-profile-pending',
  PHOTOS_PROFILE_APPROVED: 'photos-profile-approved',
  PHOTOS_PROFILE_REJECTED: 'photos-profile-rejected',
  PHOTOS_ALBUMS_PENDING: 'photos-albums-pending',
  PHOTOS_ALBUMS_APPROVED: 'photos-albums-approved',
  PHOTOS_ALBUMS_REJECTED: 'photos-albums-rejected',
  USERS_FILES: 'users-files',
  PHOTO_REPORTS: 'photo-reports',
  PHOTO_APPEALS: 'photo-appeals',
};

// URLs públicas de los buckets aprobados
export const R2_PUBLIC_URLS = {
  PHOTOS_PROFILE_APPROVED: process.env.NEXT_PUBLIC_R2_PROFILE_APPROVED_URL!,
  PHOTOS_ALBUMS_APPROVED: process.env.NEXT_PUBLIC_R2_ALBUMS_APPROVED_URL!,
};

/**
 * Sube un archivo a R2
 * @param bucket - Nombre del bucket
 * @param key - Ruta/nombre del archivo en R2
 * @param body - Contenido del archivo (Buffer o Uint8Array)
 * @param contentType - MIME type del archivo
 * @returns URL del archivo
 */
export async function uploadToR2(
  bucket: string,
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Si el bucket es público, retornar URL pública
  if (bucket === R2_BUCKETS.PHOTOS_PROFILE_APPROVED) {
    return `${R2_PUBLIC_URLS.PHOTOS_PROFILE_APPROVED}/${key}`;
  }
  if (bucket === R2_BUCKETS.PHOTOS_ALBUMS_APPROVED) {
    return `${R2_PUBLIC_URLS.PHOTOS_ALBUMS_APPROVED}/${key}`;
  }

  // Para buckets privados, retornar la ruta (se generará signed URL después)
  return `${bucket}/${key}`;
}

/**
 * Genera una URL firmada (signed URL) para acceso temporal a un archivo privado
 * @param bucket - Nombre del bucket
 * @param key - Ruta/nombre del archivo
 * @param expiresIn - Tiempo de expiración en segundos (default: 1 hora)
 * @returns URL firmada
 */
export async function getSignedR2Url(
  bucket: string,
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Elimina un archivo de R2
 * @param bucket - Nombre del bucket
 * @param key - Ruta/nombre del archivo
 */
export async function deleteFromR2(bucket: string, key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Mueve una foto de pending a approved/rejected
 * @param userId - ID del usuario
 * @param photoType - 'profile' o 'album'
 * @param fileName - Nombre del archivo
 * @param approved - true si fue aprobada, false si fue rechazada
 * @param albumId - ID del álbum (opcional, solo para fotos de álbumes)
 */
export async function movePhotoToFinalBucket(
  userId: string,
  photoType: 'profile' | 'album',
  fileName: string,
  approved: boolean,
  albumId?: string
): Promise<{
  originalUrl: string;
  mediumUrl: string;
  thumbnailUrl: string;
}> {
  const sourceBucket = photoType === 'profile' 
    ? R2_BUCKETS.PHOTOS_PROFILE_PENDING 
    : R2_BUCKETS.PHOTOS_ALBUMS_PENDING;
    
  const destBucket = approved
    ? (photoType === 'profile' ? R2_BUCKETS.PHOTOS_PROFILE_APPROVED : R2_BUCKETS.PHOTOS_ALBUMS_APPROVED)
    : (photoType === 'profile' ? R2_BUCKETS.PHOTOS_PROFILE_REJECTED : R2_BUCKETS.PHOTOS_ALBUMS_REJECTED);

  // Construir rutas
  const basePath = photoType === 'profile'
    ? `${userId}`
    : `${userId}/${albumId}`;

  const originalKey = `${basePath}/${fileName}`;
  const mediumKey = `${basePath}/${fileName.replace(/\.(jpg|jpeg|png)$/i, '_medium.$1')}`;
  const thumbnailKey = `${basePath}/${fileName.replace(/\.(jpg|jpeg|png)$/i, '_thumbnail.$1')}`;

  // TODO: Implementar copia real entre buckets
  // Por ahora, retornamos las URLs que se deberían usar
  
  const baseUrl = approved
    ? (photoType === 'profile' ? R2_PUBLIC_URLS.PHOTOS_PROFILE_APPROVED : R2_PUBLIC_URLS.PHOTOS_ALBUMS_APPROVED)
    : ''; // Para rechazadas, se usarán signed URLs

  if (approved) {
    return {
      originalUrl: `${baseUrl}/${originalKey}`,
      mediumUrl: `${baseUrl}/${mediumKey}`,
      thumbnailUrl: `${baseUrl}/${thumbnailKey}`,
    };
  } else {
    // Para fotos rechazadas, retornar rutas para generar signed URLs después
    return {
      originalUrl: `${destBucket}/${originalKey}`,
      mediumUrl: `${destBucket}/${mediumKey}`,
      thumbnailUrl: `${destBucket}/${thumbnailKey}`,
    };
  }
}

/**
 * Obtiene la URL pública o genera signed URL según el bucket
 * @param storagePath - Ruta completa del archivo (ej: "bucket/user/photo.jpg")
 * @param expiresIn - Tiempo de expiración para signed URLs (default: 1 hora)
 * @returns URL accesible
 */
export async function getAccessibleUrl(
  storagePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const [bucket, ...keyParts] = storagePath.split('/');
  const key = keyParts.join('/');

  // Si es un bucket público, retornar URL pública directamente
  if (bucket === R2_BUCKETS.PHOTOS_PROFILE_APPROVED) {
    return `${R2_PUBLIC_URLS.PHOTOS_PROFILE_APPROVED}/${key}`;
  }
  if (bucket === R2_BUCKETS.PHOTOS_ALBUMS_APPROVED) {
    return `${R2_PUBLIC_URLS.PHOTOS_ALBUMS_APPROVED}/${key}`;
  }

  // Para buckets privados, generar signed URL
  return await getSignedR2Url(bucket, key, expiresIn);
}

export default r2Client;
