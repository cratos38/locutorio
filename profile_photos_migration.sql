-- =====================================================
-- Script de migración para tabla profile_photos
-- Agrega campos necesarios para validación automática
-- =====================================================

-- 1. Agregar columna validation_data (JSONB)
ALTER TABLE profile_photos 
ADD COLUMN IF NOT EXISTS validation_data JSONB DEFAULT NULL;

-- 2. Agregar columna rejection_reason (TEXT)
ALTER TABLE profile_photos 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT NULL;

-- 3. Agregar columna manual_review (BOOLEAN)
ALTER TABLE profile_photos 
ADD COLUMN IF NOT EXISTS manual_review BOOLEAN DEFAULT false;

-- 4. Agregar columna validated_at (TIMESTAMP)
ALTER TABLE profile_photos 
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 5. Agregar comentarios descriptivos
COMMENT ON COLUMN profile_photos.estado IS 'Estados posibles: pendiente, aprobada, rechazada, revision_manual';
COMMENT ON COLUMN profile_photos.validation_data IS 'Datos de validación automática en formato JSON (rostros, sexo, edad, calidad, etc.)';
COMMENT ON COLUMN profile_photos.rejection_reason IS 'Motivo de rechazo (automático o manual)';
COMMENT ON COLUMN profile_photos.manual_review IS 'Marca si la foto requiere revisión manual del admin';
COMMENT ON COLUMN profile_photos.validated_at IS 'Fecha y hora de validación (automática o manual)';

-- 6. Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profile_photos_estado 
ON profile_photos(estado);

CREATE INDEX IF NOT EXISTS idx_profile_photos_manual_review 
ON profile_photos(manual_review) 
WHERE manual_review = true;

CREATE INDEX IF NOT EXISTS idx_profile_photos_user_id 
ON profile_photos(user_id);

CREATE INDEX IF NOT EXISTS idx_profile_photos_validated_at 
ON profile_photos(validated_at);

-- 7. Documentar la tabla
COMMENT ON TABLE profile_photos IS 'Fotos de perfil de usuarios con validación automática mediante IA';

-- =====================================================
-- Verificación: Ejecuta este SELECT para confirmar
-- =====================================================
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profile_photos' 
-- ORDER BY ordinal_position;
