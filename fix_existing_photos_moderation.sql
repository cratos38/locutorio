-- Arreglar fotos existentes en álbumes privados/amigos
-- Fecha: 2026-02-14

-- 1. Aprobar TODAS las fotos de álbumes privados (Solo Amigos)
UPDATE album_photos 
SET 
  moderation_status = 'approved',
  moderation_reason = 'Álbum privado - sin moderación',
  moderation_date = NOW()
WHERE album_id IN (
  SELECT id FROM albums WHERE privacy = 'amigos'
)
AND (moderation_status = 'pending_review' OR moderation_status IS NULL);

-- 2. Aprobar TODAS las fotos de álbumes protegidos
UPDATE album_photos 
SET 
  moderation_status = 'approved',
  moderation_reason = 'Álbum protegido - sin moderación',
  moderation_date = NOW()
WHERE album_id IN (
  SELECT id FROM albums WHERE privacy = 'protegido'
)
AND (moderation_status = 'pending_review' OR moderation_status IS NULL);

-- 3. Verificar resultados
SELECT 
  a.privacy,
  ap.moderation_status,
  COUNT(*) as total
FROM album_photos ap
JOIN albums a ON ap.album_id = a.id
GROUP BY a.privacy, ap.moderation_status
ORDER BY a.privacy, ap.moderation_status;
