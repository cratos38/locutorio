-- =====================================================
-- MIGRACIÓN: ÁLBUMES DE FOTOS A SUPABASE
-- =====================================================
-- Fecha: 2026-02-14
-- Propósito: Migrar álbumes de localStorage a Supabase
-- =====================================================

-- 1. CREAR TABLA DE ÁLBUMES
CREATE TABLE IF NOT EXISTS albums (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  privacy TEXT NOT NULL CHECK (privacy IN ('publico', 'amigos', 'protegido')),
  password TEXT, -- Solo si privacy = 'protegido'
  cover_photo_url TEXT,
  photo_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREAR TABLA DE FOTOS DE ÁLBUMES
CREATE TABLE IF NOT EXISTS album_photos (
  id BIGSERIAL PRIMARY KEY,
  album_id BIGINT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  url TEXT NOT NULL, -- URL de Supabase Storage
  description TEXT,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  orden INTEGER DEFAULT 0, -- Para ordenar las fotos
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREAR ÍNDICES PARA RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);
CREATE INDEX IF NOT EXISTS idx_albums_privacy ON albums(privacy);
CREATE INDEX IF NOT EXISTS idx_album_photos_album_id ON album_photos(album_id);
CREATE INDEX IF NOT EXISTS idx_album_photos_orden ON album_photos(orden);

-- 4. CREAR STORAGE BUCKET PARA FOTOS DE ÁLBUMES
-- (Esto se hace desde el dashboard de Supabase, no SQL)
-- Nombre del bucket: 'album-photos'
-- Configuración: Public (para fotos de álbumes públicos)

-- 5. RLS POLICIES PARA TABLA ALBUMS

-- 5.1. Ver álbumes públicos (todos)
CREATE POLICY "Ver álbumes públicos"
  ON albums FOR SELECT
  USING (privacy = 'publico');

-- 5.2. Ver álbumes propios (dueño)
CREATE POLICY "Ver álbumes propios"
  ON albums FOR SELECT
  USING (auth.uid() = user_id);

-- 5.3. Ver álbumes de amigos (TODO: implementar lógica de amistad)
-- CREATE POLICY "Ver álbumes de amigos"
--   ON albums FOR SELECT
--   USING (
--     privacy = 'amigos' 
--     AND EXISTS (
--       SELECT 1 FROM friendships 
--       WHERE (user_id = auth.uid() AND friend_id = albums.user_id)
--          OR (friend_id = auth.uid() AND user_id = albums.user_id)
--     )
--   );

-- 5.4. Crear álbumes (usuarios autenticados)
CREATE POLICY "Crear álbumes propios"
  ON albums FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5.5. Actualizar álbumes propios
CREATE POLICY "Actualizar álbumes propios"
  ON albums FOR UPDATE
  USING (auth.uid() = user_id);

-- 5.6. Eliminar álbumes propios
CREATE POLICY "Eliminar álbumes propios"
  ON albums FOR DELETE
  USING (auth.uid() = user_id);

-- 6. RLS POLICIES PARA TABLA ALBUM_PHOTOS

-- 6.1. Ver fotos de álbumes públicos
CREATE POLICY "Ver fotos de álbumes públicos"
  ON album_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = album_photos.album_id 
        AND albums.privacy = 'publico'
    )
  );

-- 6.2. Ver fotos de álbumes propios
CREATE POLICY "Ver fotos de álbumes propios"
  ON album_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = album_photos.album_id 
        AND albums.user_id = auth.uid()
    )
  );

-- 6.3. Agregar fotos a álbumes propios
CREATE POLICY "Agregar fotos a álbumes propios"
  ON album_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = album_photos.album_id 
        AND albums.user_id = auth.uid()
    )
  );

-- 6.4. Eliminar fotos de álbumes propios
CREATE POLICY "Eliminar fotos de álbumes propios"
  ON album_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = album_photos.album_id 
        AND albums.user_id = auth.uid()
    )
  );

-- 7. HABILITAR RLS
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_photos ENABLE ROW LEVEL SECURITY;

-- 8. FUNCIÓN PARA ACTUALIZAR photo_count AUTOMÁTICAMENTE
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

-- 9. TRIGGER PARA ACTUALIZAR photo_count
DROP TRIGGER IF EXISTS trigger_update_album_photo_count ON album_photos;
CREATE TRIGGER trigger_update_album_photo_count
  AFTER INSERT OR DELETE ON album_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_album_photo_count();

-- =====================================================
-- NOTAS:
-- =====================================================
-- 1. Crear bucket 'album-photos' manualmente en Supabase Dashboard
-- 2. Configurar CORS si es necesario
-- 3. Implementar moderación de contenido (opcional):
--    - Usar API externa (ej: AWS Rekognition, Google Vision)
--    - Crear función edge para moderar antes de subir
-- 4. TODO: Implementar tabla de amistad (friendships)
-- =====================================================
