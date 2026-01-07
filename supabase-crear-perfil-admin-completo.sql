-- ============================================
-- CREAR PERFIL COMPLETO DE ADMIN
-- ============================================

-- PASO 1: Primero obtener el UUID de admin en auth.users
SELECT id, email FROM auth.users WHERE email = 'admin@admin.com';
-- COPIA el ID que aparece

-- PASO 2: Insertar/Actualizar admin en tabla users con TODOS los datos
-- Reemplaza <UUID_DE_AUTH> con el ID que copiaste arriba

INSERT INTO users (
    id,
    username,
    email,
    nombre,
    edad,
    genero,
    ciudad,
    vives_en,
    foto_perfil,
    status_text,
    is_admin,
    created_at,
    updated_at
) VALUES (
    '<UUID_DE_AUTH>',  -- Pega aquí el UUID de auth.users
    'admin',
    'admin@admin.com',
    'Administrador',
    30,
    'otro',
    'Todas las ciudades',
    'Global',
    'https://ui-avatars.com/api/?name=Admin&background=2BEE79&color=0F1416&size=200',
    '🔧 Soy el administrador del sistema',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (username) 
DO UPDATE SET
    id = EXCLUDED.id,
    email = EXCLUDED.email,
    nombre = EXCLUDED.nombre,
    edad = EXCLUDED.edad,
    genero = EXCLUDED.genero,
    ciudad = EXCLUDED.ciudad,
    vives_en = EXCLUDED.vives_en,
    foto_perfil = EXCLUDED.foto_perfil,
    status_text = EXCLUDED.status_text,
    is_admin = EXCLUDED.is_admin,
    updated_at = NOW();

-- PASO 3: Verificar que quedó bien
SELECT 
    id,
    username,
    email,
    nombre,
    edad,
    ciudad,
    foto_perfil,
    is_admin
FROM users
WHERE username = 'admin';

-- PASO 4: Verificar alineación con Auth
SELECT 
    au.id as auth_id,
    u.id as users_id,
    au.email,
    u.username,
    u.nombre,
    u.is_admin,
    CASE 
        WHEN au.id = u.id THEN '✅ PERFECTO - LISTO PARA LOGIN'
        ELSE '❌ TODAVÍA DESALINEADO'
    END as estado
FROM auth.users au
INNER JOIN users u ON au.id = u.id
WHERE au.email = 'admin@admin.com';

-- Debe mostrar: ✅ PERFECTO - LISTO PARA LOGIN
