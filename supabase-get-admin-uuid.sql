-- ============================================
-- OBTENER UUID CORRECTO DEL ADMIN
-- ============================================

-- Paso 1: Ver el UUID correcto de auth.users
SELECT 
    au.id as auth_uuid,
    au.email,
    au.created_at as auth_created_at
FROM auth.users au
WHERE au.email = 'admin@admin.com';

-- Paso 2: Ver el estado actual en la tabla users
SELECT 
    id,
    username,
    email,
    is_admin,
    created_at
FROM users
WHERE username = 'admin';

-- Paso 3: Ver la desalineación
SELECT 
    au.id as auth_uuid,
    u.id as users_uuid,
    au.email,
    u.username,
    CASE 
        WHEN au.id = u.id THEN '✅ ALINEADOS'
        ELSE '❌ DESALINEADOS'
    END as estado
FROM auth.users au
LEFT JOIN users u ON au.email = u.email
WHERE au.email = 'admin@admin.com';
