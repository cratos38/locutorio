-- ============================================
-- BORRAR ADMIN VIEJO Y EMPEZAR DE CERO
-- ============================================

-- PASO 1: Borrar admin de tabla users (si existe)
DELETE FROM users WHERE username = 'admin' OR email = 'admin@admin.com';

-- PASO 2: Borrar admin de auth.users
-- IMPORTANTE: Esto se hace desde el Dashboard de Supabase
-- Authentication → Users → Buscar admin@admin.com → Click en los 3 puntos → Delete user

-- PASO 3: Verificar que se borró
SELECT * FROM users WHERE username = 'admin';
SELECT * FROM auth.users WHERE email = 'admin@admin.com';
-- Ambos deben devolver 0 resultados

-- ============================================
-- DESPUÉS DE EJECUTAR ESTO:
-- ============================================
-- 1. Ve a https://www.locutorio.com.ve/create-profile
-- 2. Regístrate con:
--    Email: admin@admin.com
--    Password: admin123 (8 caracteres)
--    Nombre: Administrador
--    ... (llena todo el formulario)
-- 3. Sube una foto
-- 4. Click en "Crear y Empezar"
-- 5. Ejecuta este SQL:
UPDATE users SET is_admin = true WHERE email = 'admin@admin.com';

-- ¡LISTO! Ahora tienes admin COMPLETO con:
-- ✅ Cuenta en auth.users (puede hacer login)
-- ✅ Perfil completo en users (todos los datos)
-- ✅ Foto subida a Storage
-- ✅ is_admin = true (superpoderes)
