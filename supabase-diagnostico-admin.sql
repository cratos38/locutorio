-- ============================================
-- DIAGNÓSTICO COMPLETO - ¿QUÉ ESTÁ PASANDO?
-- ============================================

-- 1. Verificar usuario admin en auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    '✅ Usuario en Auth' as estado
FROM auth.users
WHERE email = 'admin@admin.com';

-- 2. Verificar usuario admin en tabla users
SELECT 
    id,
    username,
    email,
    is_admin,
    nombre,
    edad,
    ciudad,
    foto_perfil,
    created_at,
    '✅ Usuario en tabla users' as estado
FROM users
WHERE username = 'admin';

-- 3. Verificar si están ALINEADOS
SELECT 
    au.id as auth_id,
    u.id as users_id,
    au.email,
    u.username,
    u.nombre,
    u.is_admin,
    CASE 
        WHEN au.id = u.id THEN '✅ ALINEADOS'
        ELSE '❌ DESALINEADOS'
    END as estado
FROM auth.users au
FULL OUTER JOIN users u ON au.id = u.id
WHERE au.email = 'admin@admin.com' OR u.username = 'admin';

-- 4. Verificar fotos de admin
SELECT 
    id,
    user_id,
    url,
    is_principal,
    estado,
    created_at
FROM profile_photos
WHERE user_id = (SELECT id FROM users WHERE username = 'admin');

-- Si esto no devuelve nada, entonces admin NO tiene fotos todavía
