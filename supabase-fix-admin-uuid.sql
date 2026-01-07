-- ============================================
-- ARREGLAR UUID DEL ADMIN
-- ============================================
-- Ejecutar DESPUÉS de obtener el UUID correcto

-- INSTRUCCIONES:
-- 1. Ejecuta primero: supabase-get-admin-uuid.sql
-- 2. Copia el auth_uuid que aparece
-- 3. Reemplaza <PEGAR_UUID_AQUI> con ese UUID
-- 4. Ejecuta este archivo

-- ============================================
-- ACTUALIZAR UUID
-- ============================================

UPDATE users 
SET id = '<PEGAR_UUID_AQUI>'
WHERE username = 'admin';

-- ============================================
-- VERIFICAR
-- ============================================

-- Debe mostrar el mismo UUID que copiaste
SELECT 
    id,
    username,
    email,
    is_admin,
    created_at
FROM users
WHERE username = 'admin';

-- ============================================
-- VERIFICAR ALINEACIÓN FINAL
-- ============================================

SELECT 
    au.id as auth_uuid,
    u.id as users_uuid,
    au.email,
    u.username,
    u.is_admin,
    CASE 
        WHEN au.id = u.id THEN '✅ ALINEADOS - PERFECTO!'
        ELSE '❌ AÚN DESALINEADOS'
    END as estado
FROM auth.users au
INNER JOIN users u ON au.email = u.email
WHERE au.email = 'admin@admin.com';

-- Si ves "✅ ALINEADOS - PERFECTO!" entonces ya está listo!
-- Ahora puedes hacer logout y volver a login con admin@admin.com
