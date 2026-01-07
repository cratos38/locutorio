-- =====================================================
-- CREAR CUENTA DE SUPER ADMIN
-- =====================================================
-- Esta cuenta tiene acceso total a la plataforma
-- Email: admin@admin.com
-- Username: admin
-- Password: admin (se configura en Supabase Auth)
-- =====================================================

-- Primero, crear el usuario en tabla users
-- Nota: El ID debe coincidir con el ID de Supabase Auth
-- Por ahora usamos un UUID fijo que luego actualizaremos
INSERT INTO users (
  id,
  username,
  email,
  nombre,
  edad,
  genero,
  ciudad,
  vives_en,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid, -- ID fijo para admin
  'admin',
  'admin@admin.com',
  'Administrador',
  30,
  'otro',
  'Todas',
  'Global',
  NOW(),
  NOW()
)
ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- =====================================================
-- INSTRUCCIONES PARA CREAR EN SUPABASE AUTH:
-- =====================================================
-- 1. Ir a Supabase Dashboard
-- 2. Authentication > Users
-- 3. Add user
-- 4. Email: admin@admin.com
-- 5. Password: admin
-- 6. Auto Confirm User: ✅ ACTIVADO (importante!)
-- 7. Copiar el UUID generado
-- 8. Actualizar la tabla users con ese UUID:
--
--    UPDATE users 
--    SET id = '<UUID_DE_SUPABASE_AUTH>'
--    WHERE username = 'admin';
--
-- =====================================================
-- PERMISOS ESPECIALES (opcional)
-- =====================================================
-- Si queremos que admin tenga permisos especiales en RLS:

-- Agregar campo is_admin a tabla users (si no existe)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Marcar cuenta admin como super admin
UPDATE users SET is_admin = TRUE WHERE username = 'admin';

-- =====================================================
-- POLÍTICAS RLS PARA ADMIN
-- =====================================================
-- Admin puede ver todo (ejemplo)

-- Ver todas las fotos (incluso de otros usuarios)
CREATE POLICY "Admin can view all photos"
ON profile_photos FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = TRUE
  )
);

-- Admin puede editar cualquier foto
CREATE POLICY "Admin can update all photos"
ON profile_photos FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = TRUE
  )
);

-- Admin puede eliminar cualquier foto
CREATE POLICY "Admin can delete all photos"
ON profile_photos FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = TRUE
  )
);

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. La cuenta admin NO necesita verificar email
--    (se marca como "Auto Confirm" en Supabase Auth)
--
-- 2. El password "admin" es solo para desarrollo
--    En producción debe cambiarse por algo seguro
--
-- 3. El campo is_admin permite dar permisos especiales
--    en toda la aplicación
--
-- 4. Las políticas RLS permiten que admin vea/edite
--    cualquier contenido
-- =====================================================
