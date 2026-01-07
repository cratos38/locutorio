-- ============================================
-- VERIFICAR QUÉ SE GUARDÓ DE ADMIN
-- ============================================

-- 1. Ver datos en tabla users
SELECT 
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
    created_at
FROM users 
WHERE email = 'admin@admin.com';

-- 2. Ver si hay fotos
SELECT 
    id,
    user_id,
    url,
    is_principal,
    estado,
    created_at
FROM profile_photos
WHERE user_id = (SELECT id FROM users WHERE email = 'admin@admin.com');

-- 3. Ver usuario en Auth
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'admin@admin.com';

-- Si foto_perfil está NULL o vacío, entonces NO se subió la foto
-- Si profile_photos no tiene registros, entonces NO se guardaron las fotos
