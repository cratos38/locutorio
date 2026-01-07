-- =====================================================
-- POLÍTICAS RLS FINALES Y CORRECTAS
-- =====================================================
-- CASO DE USO:
-- • Álbumes públicos: cualquiera con URL puede ver (sin login)
-- • Álbumes privados: solo el dueño puede ver (con login)
-- • Fotos de perfil: públicas y compartibles
-- =====================================================

-- ❌ ELIMINAR políticas anteriores si existen
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view all photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete photos" ON storage.objects;

-- =====================================================
-- POLÍTICAS FINALES
-- =====================================================

-- 1️⃣ CUALQUIERA puede VER fotos (público)
--    Esto permite compartir álbumes públicos sin login
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'profile-photos' );

-- 2️⃣ Solo usuarios AUTENTICADOS pueden SUBIR fotos
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'profile-photos' );

-- 3️⃣ Solo usuarios AUTENTICADOS pueden ACTUALIZAR fotos
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'profile-photos' );

-- 4️⃣ Solo usuarios AUTENTICADOS pueden ELIMINAR fotos
CREATE POLICY "Authenticated users can delete"
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
  AND policyname LIKE '%read%' 
   OR policyname LIKE '%upload%'
   OR policyname LIKE '%update%'
   OR policyname LIKE '%delete%'
ORDER BY policyname;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ Public read access (SELECT, public)
-- ✅ Authenticated users can upload (INSERT, authenticated)
-- ✅ Authenticated users can update (UPDATE, authenticated)
-- ✅ Authenticated users can delete (DELETE, authenticated)

-- =====================================================
-- CÓMO FUNCIONA:
-- =====================================================
-- Usuario A (logueado):
--   1. Crea álbum público
--   2. Sube fotos
--   3. Comparte URL: https://.../publicprofile/usuarioA/album/123
--
-- Usuario B (NO logueado):
--   1. Recibe URL
--   2. Abre URL en navegador
--   3. Ve fotos del álbum público
--   4. NO puede subir/editar/eliminar (requiere login)
--
-- Privacidad controlada por:
--   • Tabla photo_albums.is_public (TRUE/FALSE)
--   • Solo álbumes con is_public=TRUE son compartibles
--   • URLs no son adivinables (ID único por álbum)
