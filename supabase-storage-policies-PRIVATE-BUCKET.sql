-- =====================================================
-- POLÍTICAS RLS CORRECTAS - BUCKET PRIVADO
-- =====================================================
-- REGLA PRINCIPAL:
-- SOLO usuarios LOGUEADOS pueden ver fotos
-- NADIE sin login puede ver NADA
-- =====================================================

-- ❌ ELIMINAR todas las políticas anteriores
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view all photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- =====================================================
-- NUEVAS POLÍTICAS CORRECTAS (BUCKET PRIVADO)
-- =====================================================

-- 1️⃣ SOLO usuarios AUTENTICADOS (logueados) pueden VER fotos
--    Usuario B (logueado) puede ver fotos de Usuario A
--    Usuario A (sin login) NO puede ver ni sus propias fotos
CREATE POLICY "Only authenticated users can view photos"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'profile-photos' );

-- 2️⃣ SOLO usuarios AUTENTICADOS pueden SUBIR fotos
CREATE POLICY "Only authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'profile-photos' );

-- 3️⃣ SOLO usuarios AUTENTICADOS pueden ACTUALIZAR fotos
CREATE POLICY "Only authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'profile-photos' );

-- 4️⃣ SOLO usuarios AUTENTICADOS pueden ELIMINAR fotos
CREATE POLICY "Only authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'profile-photos' );

-- =====================================================
-- VERIFICAR POLÍTICAS CREADAS
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND bucket_id = 'profile-photos'
ORDER BY policyname;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ Only authenticated users can view photos (SELECT, authenticated)
-- ✅ Only authenticated users can upload (INSERT, authenticated)
-- ✅ Only authenticated users can update (UPDATE, authenticated)
-- ✅ Only authenticated users can delete (DELETE, authenticated)

-- =====================================================
-- CÓMO FUNCIONA:
-- =====================================================
-- Usuario A (logueado):
--   ✅ Crea perfil y sube fotos
--   ✅ Sale del sistema (logout)
--
-- Usuario B, C, D... (logueados):
--   ✅ Pueden ver perfil de Usuario A
--   ✅ Pueden ver fotos de Usuario A
--   ✅ NO importa si Usuario A está online
--
-- Usuario A (SIN login):
--   ❌ NO puede ver su propio perfil
--   ❌ NO puede ver sus propias fotos
--   ❌ Necesita loguearse para ver
--
-- NADIE sin login puede ver NADA:
--   ❌ Sin autenticación = sin acceso
--   ❌ URLs directas no funcionan sin login
--   ❌ Bucket privado + RLS = protección total
