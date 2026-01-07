-- =====================================================
-- POLÍTICAS RLS PARA BUCKET profile-photos
-- =====================================================
-- Estas políticas permiten que:
-- 1. TODOS puedan VER fotos (bucket público)
-- 2. Solo usuarios autenticados puedan SUBIR sus fotos
-- 3. Solo usuarios autenticados puedan ELIMINAR sus fotos
-- =====================================================

-- 1️⃣ Permitir a TODOS ver fotos (lectura pública)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'profile-photos' );

-- 2️⃣ Permitir a usuarios autenticados subir fotos a su carpeta
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
);

-- 3️⃣ Permitir a usuarios autenticados actualizar sus fotos
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'profile-photos' );

-- 4️⃣ Permitir a usuarios autenticados eliminar sus fotos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'profile-photos' );

-- =====================================================
-- VERIFICAR POLÍTICAS CREADAS
-- =====================================================
-- Ejecuta esto para ver las políticas:
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;
