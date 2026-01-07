-- ============================================
-- VERIFICAR USUARIOS EN AUTH vs USERS
-- ============================================

-- Ver TODOS los usuarios en auth.users (los que PUEDEN hacer login)
SELECT 
    id as auth_uuid,
    email,
    email_confirmed_at,
    created_at,
    '✅ Puede hacer LOGIN' as estado
FROM auth.users
ORDER BY created_at;

-- Ver TODOS los usuarios en la tabla users
SELECT 
    id as users_uuid,
    username,
    email,
    is_admin,
    created_at,
    CASE 
        WHEN is_admin THEN '👑 ADMIN'
        ELSE '👤 Usuario normal'
    END as tipo
FROM users
ORDER BY created_at;

-- Ver quién puede hacer login y quién NO
SELECT 
    u.id as users_uuid,
    u.username,
    u.email as users_email,
    u.is_admin,
    au.id as auth_uuid,
    au.email as auth_email,
    CASE 
        WHEN au.id IS NOT NULL THEN '✅ PUEDE HACER LOGIN'
        ELSE '❌ NO PUEDE HACER LOGIN (solo demo)'
    END as estado_login
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at;
