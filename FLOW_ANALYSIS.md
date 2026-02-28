# ANÁLISIS DEL FLUJO DE FOTOS DE PERFIL v3.5

## 1. UPLOAD (Usuario sube foto)
**Archivo:** src/components/PhotoManager.tsx (línea ~330)
- Crea 3 versiones: thumbnail (96px), medium (400px), large (1024px)
- POST a /api/photos/upload

**Archivo:** src/app/api/photos/upload/route.ts
- Sube 3 archivos a bucket `photos-pending`:
  - admin/1234_thumbnail.jpg
  - admin/1234_medium.jpg
  - admin/1234.jpg
- Inserta registro en tabla `photos` con status='pending'
- Campos: storage_url, cropped_url (medium), thumbnail_url

## 2. TRIGGER (Database Webhook)
**Supabase:** Database Webhook on INSERT photos
- Cambia status de 'pending' a 'processing'

## 3. POLLING (photo_processor_polling.py)
- Detecta fotos con status='processing'
- Llama al webhook en el servidor

## 4. WEBHOOK (supabase_webhook_v3.5.py)
- Descarga la foto desde storage_url
- Llama al ML Validator (http://localhost:8000/validate)
- Actualiza registro con verdict y rejection_reason
- Cambia status a 'approved' o 'rejected'

## 5. DISPLAY (Usuario ve sus fotos)
**Archivo:** src/app/userprofile/page.tsx
- Renderiza PhotoManager con username="admin"

**Archivo:** src/components/PhotoManager.tsx (línea ~250)
- GET /api/photos?username=admin&showAll=true

**Archivo:** src/app/api/photos/route.ts
- Retorna todas las fotos del usuario (pending, approved, rejected)

**Archivo:** src/components/PhotoGallery.tsx (línea ~148)
- Muestra la foto usando currentPhoto.url

## PROBLEMA ACTUAL
Las URLs en la base de datos apuntan a:
- storage_url: https://...supabase.co/storage/v1/object/public/photos-pending/admin/1772313874284.jpg
- cropped_url: https://...supabase.co/storage/v1/object/public/photos-pending/admin/1772313874284_medium.jpg

Ambas devuelven HTTP 400 (no existen físicamente)

## POSIBLES CAUSAS
1. Upload falló parcialmente (insertó en BD pero no subió archivos)
2. Webhook descarga y borra después de validar
3. Bucket photos-pending tiene problema de permisos
4. Las fotos se mueven de bucket después de aprobar
