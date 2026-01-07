-- ============================================
-- CREAR BUCKET DE STORAGE PARA FOTOS
-- ============================================

-- Crear bucket 'profile-photos' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Cualquiera puede ver fotos (bucket público)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'profile-photos' );

-- Política: Usuarios autenticados pueden subir fotos
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos'
);

-- Política: Usuarios pueden actualizar sus propias fotos
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos'
);

-- Política: Usuarios pueden eliminar sus propias fotos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos'
);
