-- ============================================
-- CREAR CUENTA ADMIN COMPLETA (AUTH + USERS)
-- ============================================
-- IMPORTANTE: Este SQL solo funciona si tienes acceso a auth.users
-- Si no funciona, debes crear el usuario manualmente desde el Dashboard

-- ============================================
-- OPCIÓN 1: Crear desde Dashboard (RECOMENDADO)
-- ============================================
-- 1. Ve a: https://supabase.com/dashboard/project/hbzlxwbyxuzdasfaksiy
-- 2. Authentication → Users → Add user
-- 3. Email: admin@admin.com
-- 4. Password: admin
-- 5. Auto Confirm User: ✅ ON (importante!)
-- 6. Create user
-- 7. COPIAR el UUID que se genera
-- 8. Ejecutar el UPDATE abajo con ese UUID

-- ============================================
-- PASO 1: Ver el UUID del admin en users (si existe)
-- ============================================
SELECT 
    id,
    username,
    email,
    is_admin
FROM users
WHERE username = 'admin';

-- Copia el 'id' que aparece aquí

-- ============================================
-- PASO 2: Verificar si admin existe en Auth
-- ============================================
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'admin@admin.com';

-- Si NO aparece nada, entonces NO existe en Auth
-- Ve al Dashboard y créalo manualmente (pasos arriba)

-- ============================================
-- PASO 3: Después de crear en Dashboard, conectar los UUIDs
-- ============================================
-- Reemplaza <UUID_DE_AUTH> con el UUID que copiaste del Dashboard

UPDATE users 
SET id = '<UUID_DE_AUTH>'
WHERE username = 'admin';

-- Ejemplo:
-- UPDATE users 
-- SET id = 'e4e7e1ee-5c6c-447e-8e32-0c402c94ad0e'
-- WHERE username = 'admin';

-- ============================================
-- PASO 4: Verificar que quedó alineado
-- ============================================
SELECT 
    au.id as auth_uuid,
    au.email as auth_email,
    u.id as users_uuid,
    u.username,
    u.email as users_email,
    u.is_admin,
    CASE 
        WHEN au.id = u.id THEN '✅ ALINEADOS - LISTO PARA LOGIN'
        ELSE '❌ DESALINEADOS'
    END as estado
FROM auth.users au
INNER JOIN users u ON au.email = u.email
WHERE au.email = 'admin@admin.com';

-- Debe mostrar: ✅ ALINEADOS - LISTO PARA LOGIN
