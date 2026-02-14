-- Tabla para reclamaciones de fotos rechazadas
CREATE TABLE IF NOT EXISTS photo_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES album_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  admin_notes TEXT,
  admin_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  
  -- Un usuario solo puede reclamar UNA VEZ por foto
  UNIQUE(photo_id, user_id)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_photo_appeals_photo ON photo_appeals(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_appeals_user ON photo_appeals(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_appeals_status ON photo_appeals(status);
CREATE INDEX IF NOT EXISTS idx_photo_appeals_created ON photo_appeals(created_at DESC);

-- RLS Policies
ALTER TABLE photo_appeals ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden crear reclamaciones de sus propias fotos rechazadas
CREATE POLICY "Users can appeal their own rejected photos"
  ON photo_appeals FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM album_photos ap
      JOIN albums a ON ap.album_id = a.id
      WHERE ap.id = photo_id
      AND a.user_id = auth.uid()
      AND ap.moderation_status = 'rejected'
    )
  );

-- Los usuarios pueden ver sus propias reclamaciones
CREATE POLICY "Users can view their own appeals"
  ON photo_appeals FOR SELECT
  USING (auth.uid() = user_id);

-- Admins pueden ver y actualizar todas las reclamaciones
CREATE POLICY "Admins can view all appeals"
  ON photo_appeals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update appeals"
  ON photo_appeals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

COMMENT ON TABLE photo_appeals IS 'Reclamaciones de usuarios sobre fotos rechazadas incorrectamente';
COMMENT ON COLUMN photo_appeals.reason IS 'Motivo de la reclamación (ej: "Tatuaje, no desnudez")';
COMMENT ON COLUMN photo_appeals.status IS 'Estado: pending, reviewing, approved (foto desbloqueada), rejected (reclamación rechazada)';
