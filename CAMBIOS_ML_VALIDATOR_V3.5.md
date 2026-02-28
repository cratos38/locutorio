# 🚀 CAMBIOS ML VALIDATOR v3.5

## ✅ **RESUMEN DE CAMBIOS**

Se eliminó **TODO** el código NSFW antiguo y se implementó el nuevo sistema **ML Validator v3.5** con validación en segundo plano.

---

## 📋 **ARCHIVOS MODIFICADOS**

### 1. `/src/app/albums/page.tsx` ✅
**Cambios principales:**
- ❌ **ELIMINADO**: Import de `analyzeImagesHybrid` de `/lib/nsfw-hybrid`
- ❌ **ELIMINADO**: Todo el análisis NSFW previo (líneas 456-501)
- ❌ **ELIMINADO**: Variables `photoAnalysisResults`, `isAnalyzing`
- ❌ **ELIMINADO**: Lógica de aprobación/rechazo basada en scores
- ✅ **NUEVO**: Subida directa a bucket `photos-pending`
- ✅ **NUEVO**: Inserción en tabla `photos` (nuevo schema v3.5)
- ✅ **NUEVO**: Llamada a webhook ML Validator en segundo plano

**Código clave:**
```typescript
// ✅ ML VALIDATOR v3.5: Sin análisis previo
console.log('✅ Subida inmediata activa (ML Validator v3.5)');

// 🆕 v3.5: Subir a bucket photos-pending
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('photos-pending')
  .upload(fileName, resizedFile, {...});

// 🆕 v3.5: Insertar en tabla 'photos'
const { data: photoData, error: photoError } = await supabase
  .from('photos')
  .insert({
    user_id: user.id,
    photo_type: 'album',
    album_type: privacyType === 'publico' ? 'public' : 'private',
    storage_path: fileName,
    storage_url: publicUrl,
    status: 'pending',
    is_visible: false, // Solo visible para el usuario
    display_order: i
  });

// 🆕 v3.5: Llamar al webhook ML Validator
fetch('http://192.168.1.159:5001/webhook/photo-uploaded', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    photo_id: photoData.id,
    user_id: user.id,
    photo_type: 'album',
    album_type: privacyType === 'publico' ? 'public' : 'private',
    storage_path: fileName
  })
}).catch(err => console.error('⚠️ Error llamando webhook:', err));
```

**Mensaje de éxito actualizado:**
```typescript
let message = `✅ ¡Álbum "${albumName}" creado!\n\n`;
message += `📊 Total subidas: ${totalCount} fotos\n`;
message += `⏳ Estado: Pendientes de validación\n\n`;
message += `🔬 ML VALIDATOR v3.5 (en segundo plano):\n`;
message += `- Las fotos están siendo validadas automáticamente\n`;
message += `- Recibirás notificaciones cuando sean aprobadas/rechazadas\n`;
message += `- Mientras tanto, solo tú puedes verlas\n`;
```

---

### 2. `/src/app/api/photos/upload/route.ts` ✅
**Cambios principales:**
- ✅ **CAMBIADO**: Bucket `profile-photos` → `photos-pending`
- ✅ **CAMBIADO**: Tabla `profile_photos` → `photos` (nuevo schema)
- ✅ **CAMBIADO**: Campo `estado` → `status`
- ✅ **CAMBIADO**: Campo `is_principal` → `is_primary`
- ✅ **NUEVO**: Llamada a webhook ML Validator v3.5

**Código clave:**
```typescript
// 🆕 v3.5: Subir a photos-pending
await supabase.storage
  .from('photos-pending')
  .upload(largeFileName, largeBuffer, {...});

// 🆕 v3.5: Insertar en tabla photos
const { data: photoData, error: photoError } = await supabase
  .from('photos')
  .insert({
    user_id: userId,
    photo_type: 'profile',
    storage_path: largeFileName,
    storage_url: photoUrl,
    cropped_url: mediumUrl,
    status: 'pending',
    is_primary: isPrincipal,
    is_visible: false,
    original_filename: largeFile.name,
    file_size: largeFile.size,
    mime_type: largeFile.type
  });

// 🆕 v3.5: Llamar webhook ML Validator
fetch('http://192.168.1.159:5001/webhook/photo-uploaded', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    photo_id: photoData.id,
    user_id: userId,
    photo_type: 'profile',
    storage_path: largeFileName
  })
});
```

---

## 🔄 **FLUJO NUEVO (v3.5)**

### 📸 **PERFIL:**
1. Usuario sube foto → **Guardada INMEDIATO** en `photos-pending`
2. Registro creado en tabla `photos` con `status='pending'`
3. Usuario **VE su foto inmediato** (solo él, `is_visible=false`)
4. **En segundo plano:** Webhook → ML Validator (puerto 5001)
5. ML Validator ejecuta todas las validaciones (NSFW, OCR, face, etc.)
6. ML Validator actualiza `status` → `approved` o `rejected`
7. Usuario recibe **notificación** del resultado

### 📸 **ÁLBUM:**
1. Usuario sube fotos → **Guardadas INMEDIATO** en `photos-pending`
2. Registros creados en tabla `photos` con `status='pending'`
3. Usuario **VE sus fotos inmediato** (solo él, `is_visible=false`)
4. **En segundo plano:** Webhook → ML Validator (puerto 5001)
5. ML Validator ejecuta validaciones según tipo de álbum:
   - **Público:** NSFW estricto + OCR vulgar + armas/drogas
   - **Privado:** Sin validaciones (auto-aprobado)
6. ML Validator actualiza `status` → `approved` o `rejected`
7. Usuario recibe **notificación** del resultado

---

## ✅ **VENTAJAS DEL NUEVO SISTEMA**

✅ **Subida instantánea:** Usuario no espera, ve su foto inmediato
✅ **Validación en segundo plano:** No bloquea la interfaz
✅ **Unified schema:** Una sola tabla `photos` para todo
✅ **ML Validator profesional:** Sistema dedicado con GPU
✅ **Notificaciones:** Usuario recibe alertas de aprobación/rechazo
✅ **Sin código NSFW viejo:** Eliminado completamente

---

## 🚨 **IMPORTANTE**

### **Bucket antiguo `profile-photos`:**
- Ya **NO se usa**
- Las fotos viejas siguen ahí (no borrar aún)
- Migrar manualmente si es necesario

### **Tabla antigua `profile_photos`:**
- Ya **NO se usa**
- Los registros viejos siguen ahí (no borrar aún)
- Migrar manualmente si es necesario

### **Tabla antigua `album_photos`:**
- Ya **NO se usa**
- Los registros viejos siguen ahí (no borrar aún)
- Migrar manualmente si es necesario

---

## 📦 **PRÓXIMOS PASOS**

### 1. **UI para mostrar estado** ⏳ PENDIENTE
- Mostrar badge "Pendiente", "Aprobada", "Rechazada"
- Botones: "Eliminar", "Reemplazar", "Mover a privado"

### 2. **Sistema de notificaciones** ⏳ PENDIENTE
- Toast notifications cuando foto es aprobada/rechazada
- Lista de notificaciones en el perfil

### 3. **Migración de datos** ⏳ PENDIENTE
- Script para migrar `profile_photos` → `photos`
- Script para migrar `album_photos` → `photos`

### 4. **Pruebas** ⏳ PENDIENTE
- Subir foto de perfil → Verificar validación
- Subir álbum público → Verificar validación
- Subir álbum privado → Verificar auto-aprobación

---

## 📝 **NOTAS TÉCNICAS**

### **Webhook ML Validator:**
- URL: `http://192.168.1.159:5001/webhook/photo-uploaded`
- Puerto: `5001`
- No espera respuesta (fire-and-forget)

### **ML Validator Server:**
- URL: `http://192.168.1.159:5000`
- Puerto: `5000`
- Ejecuta validaciones y actualiza BD directamente

### **Supabase:**
- Bucket nuevo: `photos-pending`
- Tabla nueva: `photos`
- Schema v3.5 con columnas:
  - `user_id`
  - `photo_type` ('profile' | 'album' | 'verification')
  - `album_type` ('public' | 'private')
  - `storage_path`
  - `storage_url`
  - `cropped_url`
  - `status` ('pending' | 'processing' | 'approved' | 'rejected' | 'auto_deleted')
  - `is_primary`
  - `is_visible`
  - `auto_delete`
  - `expires_at`

---

## 🎉 **RESUMEN FINAL**

✅ **Código NSFW antiguo eliminado completamente**
✅ **Sistema ML Validator v3.5 implementado**
✅ **Fotos de perfil usando nuevo sistema**
✅ **Fotos de álbum usando nuevo sistema**
✅ **Subida instantánea + validación en segundo plano**

---

**Fecha:** 2026-02-28
**Versión:** v3.5
**Autor:** Claude Code Agent
