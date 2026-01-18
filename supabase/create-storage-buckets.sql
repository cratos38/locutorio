-- ============================================================================
-- CREAR BUCKETS DE STORAGE PARA FOTOS
-- ============================================================================
-- IMPORTANTE: Ejecutar este SQL en Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Pegar y ejecutar
-- ============================================================================

-- Bucket para fotos de perfil (principal y carrusel)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Bucket para fotos de álbumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'album-photos',
  'album-photos',
  true,
  10485760, -- 10MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Bucket para documentos de identidad (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'identity-documents',
  'identity-documents',
  false,
  10485760, -- 10MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- ============================================================================
-- POLÍTICAS DE ACCESO PARA STORAGE
-- ============================================================================

-- Eliminar políticas existentes si hay conflicto
DROP POLICY IF EXISTS "profile_photos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_owner_delete" ON storage.objects;
DROP POLICY IF EXISTS "album_photos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "album_photos_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "identity_docs_owner_access" ON storage.objects;

-- PROFILE-PHOTOS: Lectura pública
CREATE POLICY "profile_photos_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile-photos');

-- PROFILE-PHOTOS: Insertar para usuarios autenticados
CREATE POLICY "profile_photos_auth_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'profile-photos');

-- PROFILE-PHOTOS: Eliminar solo el propietario (basado en path que incluye user_id)
CREATE POLICY "profile_photos_owner_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'profile-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ALBUM-PHOTOS: Lectura pública
CREATE POLICY "album_photos_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'album-photos');

-- ALBUM-PHOTOS: Insertar para usuarios autenticados
CREATE POLICY "album_photos_auth_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'album-photos');

-- IDENTITY-DOCUMENTS: Solo el propietario puede ver/subir
CREATE POLICY "identity_docs_owner_access" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'identity-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- VERIFICAR QUE SE CREARON
-- ============================================================================
SELECT id, name, public, file_size_limit FROM storage.buckets 
WHERE id IN ('profile-photos', 'album-photos', 'identity-documents');
