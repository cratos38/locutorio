-- ============================================
-- TABLAS PARA GESTIÓN DE FOTOS
-- ============================================

-- Tabla de fotos de perfil
CREATE TABLE IF NOT EXISTS profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT, -- Miniatura (ej: 100x100)
  is_principal BOOLEAN DEFAULT FALSE,
  estado TEXT DEFAULT 'pendiente', -- 'pendiente', 'aprobada', 'rechazada'
  orden INTEGER DEFAULT 0, -- Orden en el carrusel
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración de carrusel de fotos
CREATE TABLE IF NOT EXISTS profile_photo_carousel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN DEFAULT FALSE, -- ¿Carrusel activado?
  interval_type TEXT DEFAULT 'minutes', -- 'minutes', 'hours', 'days'
  interval_value INTEGER DEFAULT 5, -- Valor del intervalo (5 minutos, 2 horas, 1 día, etc)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de álbumes de fotos
CREATE TABLE IF NOT EXISTS photo_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  cover_photo_url TEXT, -- Foto de portada del álbum
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de fotos dentro de álbumes
CREATE TABLE IF NOT EXISTS album_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES photo_albums(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT, -- Miniatura
  caption TEXT, -- Descripción/leyenda de la foto
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profile_photos_user_id ON profile_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_photos_is_principal ON profile_photos(is_principal);
CREATE INDEX IF NOT EXISTS idx_photo_albums_user_id ON photo_albums(user_id);
CREATE INDEX IF NOT EXISTS idx_album_photos_album_id ON album_photos(album_id);

-- Row Level Security
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photo_carousel ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_photos ENABLE ROW LEVEL SECURITY;

-- Políticas: Cualquiera puede ver fotos aprobadas
CREATE POLICY "Public can view approved profile photos"
  ON profile_photos FOR SELECT
  USING (estado = 'aprobada');

-- Políticas: Usuarios pueden ver sus propias fotos
CREATE POLICY "Users can view own profile photos"
  ON profile_photos FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile photos"
  ON profile_photos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own profile photos"
  ON profile_photos FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own profile photos"
  ON profile_photos FOR DELETE
  USING (true);

-- Políticas para carrusel
CREATE POLICY "Users can manage own carousel"
  ON profile_photo_carousel FOR ALL
  USING (true);

-- Políticas para álbumes
CREATE POLICY "Public can view public albums"
  ON photo_albums FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can manage own albums"
  ON photo_albums FOR ALL
  USING (true);

-- Políticas para fotos de álbumes
CREATE POLICY "Public can view photos from public albums"
  ON album_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM photo_albums
      WHERE photo_albums.id = album_photos.album_id
      AND photo_albums.is_public = true
    )
  );

CREATE POLICY "Users can manage photos in own albums"
  ON album_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM photo_albums
      WHERE photo_albums.id = album_photos.album_id
    )
  );
