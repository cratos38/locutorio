-- ============================================
-- DIAGNOSTICAR PROBLEMA ADMIN vs ANAM
-- ============================================

-- Ver TODOS los usuarios en auth.users
SELECT 
    id as auth_uuid,
    email,
    created_at
FROM auth.users
ORDER BY created_at;

-- Ver TODOS los usuarios en users
SELECT 
    id as users_uuid,
    username,
    email,
    is_admin,
    created_at
FROM users
ORDER BY created_at;

-- Ver la relación completa
SELECT 
    au.id as auth_uuid,
    au.email as auth_email,
    u.id as users_uuid,
    u.username,
    u.email as users_email,
    u.is_admin,
    CASE 
        WHEN au.id = u.id THEN '✅ MATCH'
        ELSE '❌ NO MATCH'
    END as estado
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
ORDER BY au.created_at;

-- PROBLEMA POTENCIAL: ¿Hay dos registros con el mismo UUID?
SELECT 
    id,
    username,
    email,
    is_admin,
    COUNT(*) as cantidad
FROM users
GROUP BY id, username, email, is_admin
HAVING COUNT(*) > 1;
