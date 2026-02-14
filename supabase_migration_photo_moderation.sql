-- Migracion: Sistema de moderacion de fotos
-- Fecha: 2026-02-14
-- Descripcion: Agregar columnas para moderar fotos de albumes publicos

-- 1. Agregar columnas de moderacion a album_photos
ALTER TABLE album_photos 
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending_review',
ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
ADD COLUMN IF NOT EXISTS moderation_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS moderation_date TIMESTAMPTZ;

-- 2. Agregar constraint para validar estados (solo si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_moderation_status'
  ) THEN
    ALTER TABLE album_photos 
    ADD CONSTRAINT check_moderation_status 
      CHECK (moderation_status IN ('pending_review', 'approved', 'rejected'));
  END IF;
END $$;

-- 3. Crear indice para consultas rapidas
CREATE INDEX IF NOT EXISTS idx_album_photos_moderation 
  ON album_photos(moderation_status, created_at);

-- 4. Crear indice para fotos pendientes
CREATE INDEX IF NOT EXISTS idx_album_photos_pending 
  ON album_photos(album_id, moderation_status) 
  WHERE moderation_status = 'pending_review';

-- 5. Actualizar fotos existentes como aprobadas (legacy)
UPDATE album_photos 
SET moderation_status = 'approved',
    moderation_date = NOW()
WHERE moderation_status IS NULL;

-- 6. Comentarios
COMMENT ON COLUMN album_photos.moderation_status IS 'Estado de moderacion: pending_review, approved, rejected';
COMMENT ON COLUMN album_photos.moderation_reason IS 'Razon del rechazo si aplica';
COMMENT ON COLUMN album_photos.moderation_score IS 'Score de NSFW (0.00 - 1.00)';
COMMENT ON COLUMN album_photos.moderation_date IS 'Fecha de ultima moderacion';
