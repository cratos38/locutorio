-- ============================================
-- BORRAR ADMIN COMPLETAMENTE DE TODAS LAS TABLAS
-- ============================================

-- 1. Borrar de tabla users
DELETE FROM users WHERE username = 'admin' OR email = 'admin@admin.com';

-- 2. Borrar de profile_photos (si existe)
DELETE FROM profile_photos 
WHERE user_id IN (SELECT id FROM users WHERE username = 'admin' OR email = 'admin@admin.com');

-- 3. Borrar de profile_photo_carousel (si existe)
DELETE FROM profile_photo_carousel 
WHERE user_id IN (SELECT id FROM users WHERE username = 'admin' OR email = 'admin@admin.com');

-- 4. Verificar que se borró TODO
SELECT 'users' as tabla, COUNT(*) as registros FROM users WHERE username = 'admin' OR email = 'admin@admin.com'
UNION ALL
SELECT 'profile_photos', COUNT(*) FROM profile_photos WHERE user_id IN (SELECT id FROM users WHERE username = 'admin' OR email = 'admin@admin.com')
UNION ALL
SELECT 'auth.users', COUNT(*) FROM auth.users WHERE email = 'admin@admin.com';

-- Todas deben devolver 0
