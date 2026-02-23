-- Agregar campos necesarios para validación automática de fotos de perfil

-- Agregar columna validation_data (JSONB)
ALTER TABLE profile_photos 
ADD COLUMN IF NOT EXISTS validation_data JSONB DEFAULT NULL;

-- Agregar columna rejection_reason (TEXT)
ALTER TABLE profile_photos 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT NULL;

-- Agregar columna manual_review (BOOLEAN)
ALTER TABLE profile_photos 
ADD COLUMN IF NOT EXISTS manual_review BOOLEAN DEFAULT false;

-- Agregar columna validated_at (TIMESTAMP)
ALTER TABLE profile_photos 
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Agregar nuevo estado 'revision_manual' a la columna estado
-- (Esto solo documenta el cambio - el tipo TEXT ya permite cualquier valor)
COMMENT ON COLUMN profile_photos.estado IS 'Estados: pendiente, aprobada, rechazada, revision_manual';

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profile_photos_estado ON profile_photos(estado);
CREATE INDEX IF NOT EXISTS idx_profile_photos_manual_review ON profile_photos(manual_review) WHERE manual_review = true;
CREATE INDEX IF NOT EXISTS idx_profile_photos_user_id ON profile_photos(user_id);

-- Documentar estructura final
COMMENT ON TABLE profile_photos IS 'Fotos de perfil de usuarios con validación automática';
COMMENT ON COLUMN profile_photos.validation_data IS 'Datos de validación automática (rostros, sexo, edad, calidad, etc.)';
COMMENT ON COLUMN profile_photos.rejection_reason IS 'Motivo de rechazo (automático o manual)';
COMMENT ON COLUMN profile_photos.manual_review IS 'Marca si la foto requiere revisión manual del admin';
COMMENT ON COLUMN profile_photos.validated_at IS 'Fecha y hora de validación (automática o manual)';
