-- Agregar columnas nuevas para niveles de actividades
ALTER TABLE users ADD COLUMN IF NOT EXISTS nivel_leer TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nivel_cine TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nivel_viajar TEXT;

-- Agregar columnas para tipo de educación
ALTER TABLE users ADD COLUMN IF NOT EXISTS escuelas_privadas_publicas TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS escuelas_privadas_publicas_otra TEXT;
