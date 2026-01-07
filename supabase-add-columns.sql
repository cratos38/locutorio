-- Agregar columnas nuevas para niveles de actividades
ALTER TABLE users ADD COLUMN IF NOT EXISTS nivel_leer TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nivel_cine TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nivel_viajar TEXT;
