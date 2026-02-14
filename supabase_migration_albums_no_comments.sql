CREATE TABLE IF NOT EXISTS albums (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  privacy TEXT NOT NULL CHECK (privacy IN ('publico', 'amigos', 'protegido')),
  password TEXT,
  cover_photo_url TEXT,
  photo_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS album_photos (
  id BIGSERIAL PRIMARY KEY,
  album_id BIGINT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  description TEXT,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);
CREATE INDEX IF NOT EXISTS idx_albums_privacy ON albums(privacy);
CREATE INDEX IF NOT EXISTS idx_album_photos_album_id ON album_photos(album_id);
CREATE INDEX IF NOT EXISTS idx_album_photos_orden ON album_photos(orden);

CREATE POLICY "Ver albums publicos"
  ON albums FOR SELECT
  USING (privacy = 'publico');

CREATE POLICY "Ver albums propios"
  ON albums FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Crear albums propios"
  ON albums FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Actualizar albums propios"
  ON albums FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Eliminar albums propios"
  ON albums FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Ver fotos de albums publicos"
  ON album_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = album_photos.album_id 
        AND albums.privacy = 'publico'
    )
  );

CREATE POLICY "Ver fotos de albums propios"
  ON album_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = album_photos.album_id 
        AND albums.user_id = auth.uid()
    )
  );

CREATE POLICY "Agregar fotos a albums propios"
  ON album_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = album_photos.album_id 
        AND albums.user_id = auth.uid()
    )
  );

CREATE POLICY "Eliminar fotos de albums propios"
  ON album_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = album_photos.album_id 
        AND albums.user_id = auth.uid()
    )
  );

ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_photos ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION update_album_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE albums 
    SET photo_count = photo_count + 1,
        updated_at = NOW()
    WHERE id = NEW.album_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE albums 
    SET photo_count = GREATEST(0, photo_count - 1),
        updated_at = NOW()
    WHERE id = OLD.album_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_album_photo_count ON album_photos;
CREATE TRIGGER trigger_update_album_photo_count
  AFTER INSERT OR DELETE ON album_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_album_photo_count();
