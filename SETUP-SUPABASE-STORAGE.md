# Configuración de Supabase Storage para Fotos de Perfil

## Estado Actual

✅ **Completado:**
- Tablas de fotos creadas (`profile_photos`, `profile_photo_carousel`, `photo_albums`, `album_photos`)
- API de subida implementada (`/api/photos/upload`)
- API de listado implementada (`/api/photos`)
- Integración en PhotoManager completada

❌ **Pendiente:**
- Crear bucket `profile-photos` en Supabase Storage

---

## Paso 1: Crear Bucket en Supabase

### Opción A: Usando la interfaz web de Supabase (RECOMENDADO)

1. **Ir a Supabase Dashboard:**
   - https://supabase.com/dashboard/project/hbzlxwbyxuzdasfaksiy
   
2. **Storage > Create a new bucket:**
   - Click en "Create a new bucket"
   - Nombre: `profile-photos`
   - ✅ Public bucket: **ACTIVADO**
   - ✅ File size limit: `5242880` bytes (5 MB)
   - ✅ Allowed MIME types: `image/jpeg,image/png`
   - Click "Create bucket"

3. **Configurar políticas RLS (si no se crean automáticamente):**
   - Storage > profile-photos > Policies
   - Si no hay políticas, ejecutar el SQL de "Opción B" abajo

### Opción B: Usando SQL (ALTERNATIVA)

Si prefieres hacerlo con SQL, ejecuta esto en SQL Editor:

\`\`\`sql
-- Crear bucket para fotos de perfil
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para el bucket
-- 1. Permitir a todos VER fotos públicas (estado = 'aprobada')
CREATE POLICY "Public can view approved photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-photos' AND
  auth.role() = 'anon'
);

-- 2. Permitir a usuarios autenticados SUBIR sus propias fotos
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.jwt() ->> 'username'
);

-- 3. Permitir a usuarios autenticados VER sus propias fotos
CREATE POLICY "Users can view own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-photos' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.jwt() ->> 'username'
);

-- 4. Permitir a usuarios autenticados ELIMINAR sus propias fotos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.jwt() ->> 'username'
);

-- 5. Permitir a usuarios autenticados ACTUALIZAR sus propias fotos
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.jwt() ->> 'username'
);
\`\`\`

---

## Paso 2: Verificar la Configuración

Después de crear el bucket, ejecuta:

\`\`\`bash
node check-supabase-setup.mjs
\`\`\`

Deberías ver:

\`\`\`
✅ Bucket "profile-photos" existe
\`\`\`

---

## Paso 3: Probar la Funcionalidad

1. **Crear una cuenta:**
   - Ve a https://www.locutorio.com.ve/register
   - Registra un nuevo usuario

2. **Subir foto:**
   - Ve a https://www.locutorio.com.ve/create-profile
   - Sube una foto
   - La foto debería subirse a Supabase Storage

3. **Verificar en Supabase:**
   - Dashboard > Storage > profile-photos
   - Deberías ver la carpeta del usuario con la foto

4. **Ver perfil público:**
   - Ve a https://www.locutorio.com.ve/publicprofile/{username}
   - La foto debería estar visible

---

## Estructura de Carpetas

Las fotos se guardan en:

\`\`\`
profile-photos/
  ├── username1/
  │   ├── foto-1234567890.jpg
  │   └── foto-0987654321.jpg
  ├── username2/
  │   └── foto-1111111111.jpg
  └── ...
\`\`\`

Cada usuario tiene su propia carpeta identificada por su `username`.

---

## Debugging

### Si la subida falla:

1. **Verificar logs en consola del navegador:**
   - F12 > Console
   - Buscar errores de fetch o Supabase

2. **Verificar logs del servidor:**
   - En la consola donde corre `npm run dev`
   - Buscar errores de la API `/api/photos/upload`

3. **Verificar permisos:**
   - Dashboard > Storage > profile-photos > Policies
   - Asegurarse de que las políticas RLS estén activas

4. **Verificar el bucket:**
   - Dashboard > Storage > profile-photos
   - Click en "Edit bucket"
   - Verificar que:
     - Public: true
     - File size limit: 5242880 bytes
     - Allowed MIME types: image/jpeg, image/png

---

## Notas Importantes

- **Las fotos suben a Supabase Storage, NO a la tabla directamente**
- **La tabla `profile_photos` guarda las URLs, NO los archivos**
- **Las políticas RLS protegen el acceso a las fotos**
- **El bucket debe ser público para que las fotos se vean en perfiles públicos**
- **El tamaño máximo es 5MB por foto**
- **Solo se permiten JPEG y PNG**

---

## Contacto

Si tienes problemas, verifica:
1. El bucket existe y es público
2. Las políticas RLS están activas
3. Los logs de consola y servidor
4. Las variables de entorno en .env.local

---

**Fecha:** 2026-01-07  
**Estado:** Pendiente de crear bucket  
**Última verificación:** check-supabase-setup.mjs
