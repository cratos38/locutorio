-- Agregar columnas nuevas para niveles de actividades
ALTER TABLE users ADD COLUMN IF NOT EXISTS nivel_leer TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nivel_cine TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nivel_viajar TEXT;

-- Agregar columnas para tipo de educación
ALTER TABLE users ADD COLUMN IF NOT EXISTS escuelas_privadas_publicas TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS escuelas_privadas_publicas_otra TEXT;

-- Agregar columnas para carrusel de fotos
ALTER TABLE users ADD COLUMN IF NOT EXISTS carousel_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS carousel_interval_type TEXT DEFAULT 'minutes';
ALTER TABLE users ADD COLUMN IF NOT EXISTS carousel_interval_value INTEGER DEFAULT 5;
