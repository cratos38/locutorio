-- Migration: Sistema de denuncias de fotos (2026-02-14)
-- Permite a los usuarios denunciar contenido inapropiado en álbumes públicos

-- 1. Crear tabla de denuncias
CREATE TABLE IF NOT EXISTS photo_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES album_photos(id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN (
    'contenido_explicito',
    'violencia',
    'spam',
    'acoso',
    'derechos_autor',
    'otro'
  )),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_photo_reports_photo_id ON photo_reports(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_reports_reporter ON photo_reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_photo_reports_status ON photo_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_reports_album ON photo_reports(album_id);

-- 3. Evitar denuncias duplicadas del mismo usuario
CREATE UNIQUE INDEX IF NOT EXISTS idx_photo_reports_unique 
  ON photo_reports(photo_id, reporter_user_id) 
  WHERE status = 'pending';

-- 4. Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_photo_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER photo_reports_updated_at
  BEFORE UPDATE ON photo_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_photo_reports_updated_at();

-- 5. Políticas RLS (Row Level Security)
ALTER TABLE photo_reports ENABLE ROW LEVEL SECURITY;

-- Los usuarios autenticados pueden crear denuncias
CREATE POLICY "Usuarios autenticados pueden denunciar fotos"
  ON photo_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_user_id);

-- Los usuarios pueden ver sus propias denuncias
CREATE POLICY "Usuarios pueden ver sus propias denuncias"
  ON photo_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_user_id OR auth.uid() = reviewed_by);

-- Los administradores pueden ver y actualizar todas las denuncias
-- (Por ahora, permite actualizar a cualquier usuario autenticado - ajustar según necesidad)
CREATE POLICY "Administradores pueden gestionar denuncias"
  ON photo_reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Comentarios en columnas
COMMENT ON TABLE photo_reports IS 'Denuncias de contenido inapropiado en fotos de álbumes';
COMMENT ON COLUMN photo_reports.reason IS 'Motivo de la denuncia';
COMMENT ON COLUMN photo_reports.status IS 'Estado: pending (nuevo), reviewing (en revisión), resolved (resuelto), rejected (rechazado)';
COMMENT ON COLUMN photo_reports.description IS 'Descripción adicional del usuario que denuncia';
COMMENT ON COLUMN photo_reports.admin_notes IS 'Notas internas del administrador';

-- 7. Verificar la instalación
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'photo_reports'
ORDER BY ordinal_position;
