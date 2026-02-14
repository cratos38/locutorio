-- Script para aprobar todas las fotos existentes (2026-02-14)
-- Ejecutar después de desactivar el sistema NSFW automático

-- 1. Aprobar todas las fotos pendientes en todos los álbumes
UPDATE album_photos
SET 
  moderation_status = 'approved',
  moderation_reason = 'Auto-aprobado tras desactivar NSFW automático',
  moderation_date = NOW()
WHERE moderation_status = 'pending_review' OR moderation_status IS NULL;

-- 2. Aprobar todas las fotos rechazadas (ya que el sistema tenía falsos positivos)
UPDATE album_photos
SET 
  moderation_status = 'approved',
  moderation_reason = 'Aprobado tras corrección de falsos positivos',
  moderation_date = NOW()
WHERE moderation_status = 'rejected';

-- 3. Verificar resultados
SELECT 
  moderation_status,
  COUNT(*) AS total_fotos,
  COUNT(DISTINCT album_id) AS total_albumes
FROM album_photos
GROUP BY moderation_status
ORDER BY moderation_status;

-- 4. Mostrar fotos aprobadas recientemente (últimas 24 horas)
SELECT 
  ap.id,
  ap.album_id,
  a.title AS album_title,
  ap.moderation_status,
  ap.moderation_reason,
  ap.moderation_date
FROM album_photos ap
JOIN albums a ON ap.album_id = a.id
WHERE ap.moderation_date >= NOW() - INTERVAL '24 hours'
ORDER BY ap.moderation_date DESC
LIMIT 20;
