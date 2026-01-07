-- =====================================================
-- POLÍTICAS RLS CORRECTAS PARA BUCKET profile-photos
-- =====================================================
-- CORRECCIÓN: El bucket debe ser PRIVADO
-- Solo usuarios AUTENTICADOS (logueados) pueden ver fotos
-- =====================================================

-- ❌ ELIMINAR políticas anteriores si existen
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;

-- =====================================================
-- NUEVAS POLÍTICAS CORRECTAS
-- =====================================================

-- 1️⃣ SOLO usuarios AUTENTICADOS pueden VER fotos
--    (cuando ven publicprofile de otros usuarios)
CREATE POLICY "Authenticated users can view all photos"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'profile-photos' );

-- 2️⃣ Usuarios autenticados pueden SUBIR fotos a su carpeta
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.jwt() ->> 'sub'
);

-- 3️⃣ Usuarios pueden ACTUALIZAR solo sus propias fotos
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.jwt() ->> 'sub'
);

-- 4️⃣ Usuarios pueden ELIMINAR solo sus propias fotos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.jwt() ->> 'sub'
);

-- =====================================================
-- VERIFICAR POLÍTICAS CREADAS
-- =====================================================
SELECT 
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%profile-photos%' OR policyname LIKE '%Authenticated%'
ORDER BY policyname;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ Authenticated users can view all photos (SELECT)
-- ✅ Users can upload to own folder (INSERT)
-- ✅ Users can update own photos (UPDATE)
-- ✅ Users can delete own photos (DELETE)
