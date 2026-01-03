# 📸 Especificación Técnica: Sistema de Fotos de Perfil

## 📋 **RESUMEN**

Sistema de gestión de fotos de perfil con:
- ✅ **Múltiples fotos** (máx 6)
- ✅ **Una foto principal** (visible en búsqueda/chat/Mi Espacio)
- ✅ **Verificación** por admin/bot (pendiente → aprobada/rechazada)
- ✅ **3 tamaños** por foto (avatar, perfil, miniatura)
- ✅ **Almacenamiento** en Cloudflare R2
- ✅ **Metadata** en Cloudflare D1

---

## 🖼️ **TAMAÑOS DE FOTO**

Cada foto se almacena en **3 versiones**:

| Tamaño | Dimensiones | Uso | Peso aprox |
|--------|------------|-----|------------|
| **Avatar** | 100x130px | Mi Espacio (foto pequeña en header) | ~10-15KB |
| **Perfil** | 400x520px | Búsqueda de perfiles, Perfil completo | ~100-150KB |
| **Miniatura** | 50x65px | Chat, notificaciones, mensajería | ~3-5KB |

**Proporción**: Siempre **10:13** (vertical)

---

## 🔄 **FLUJO DE SUBIDA**

### **1. Usuario sube foto**
```
Usuario selecciona archivo (JPG/PNG, máx 500KB)
↓
Frontend valida:
  - Tamaño máximo: 500KB
  - Formatos permitidos: JPG, PNG
  - Cantidad máxima: 6 fotos
↓
Frontend crea preview temporal (URL.createObjectURL)
↓
POST /api/photos/upload
  - Body: FormData con el archivo
  - Headers: Authorization token
↓
```

### **2. Backend procesa**
```
Backend recibe archivo
↓
Valida tamaño y formato
↓
Redimensiona a 3 tamaños:
  - 100x130 (avatar)
  - 400x520 (perfil)
  - 50x65 (miniatura)
↓
Sube a Cloudflare R2:
  - r2://locutorio/photos/{user_id}/{photo_id}_avatar.jpg
  - r2://locutorio/photos/{user_id}/{photo_id}_profile.jpg
  - r2://locutorio/photos/{user_id}/{photo_id}_thumbnail.jpg
↓
Guarda en D1 Database:
  INSERT INTO user_photos (
    id, user_id, url_avatar, url_profile, url_thumbnail,
    is_principal, estado, orden
  )
↓
Retorna URLs públicas al frontend
```

### **3. Frontend actualiza UI**
```
Recibe URLs de R2
↓
Actualiza estado de fotos
↓
Muestra foto con badge "🕐 En revisión"
↓
Si es la primera foto → marca como principal automáticamente
```

---

## ✅ **VERIFICACIÓN (Admin/Bot)**

### **Panel de Admin**
```
GET /api/admin/photos/pending
↓
Retorna lista de fotos pendientes:
  - ID de foto
  - URL original
  - ID de usuario
  - Fecha de subida
  - Tiempo esperando
↓
Admin revisa foto:
  ✅ APROBAR → PUT /api/admin/photos/{id}/approve
  ❌ RECHAZAR → PUT /api/admin/photos/{id}/reject { motivo: "..." }
↓
Backend actualiza estado en D1:
  UPDATE user_photos 
  SET estado = 'aprobada/rechazada',
      fecha_verificacion = CURRENT_TIMESTAMP,
      verificado_por = {admin_id},
      motivo_rechazo = {motivo}
  WHERE id = {photo_id}
↓
Backend envía notificación al usuario:
  ✅ Aprobada: "Tu foto ha sido aprobada"
  ❌ Rechazada: "Tu foto fue rechazada. Motivo: {motivo}"
```

---

## 🔍 **USO DE FOTOS EN LA APLICACIÓN**

### **Mi Espacio (Dashboard)**
```tsx
// Muestra avatar pequeño (100x130) de la foto principal
<img src={user.avatar_url} alt="Avatar" className="w-24 h-30" />
```

### **Búsqueda de Personas**
```tsx
// Muestra foto de perfil (400x520) de la foto principal
<img src={user.profile_url} alt="Perfil" className="w-64 h-80" />
```

### **Chat/Mensajería**
```tsx
// Muestra miniatura (50x65) de la foto principal
<img src={user.thumbnail_url} alt="Foto" className="w-12 h-15" />
```

### **Perfil Completo**
```tsx
// Muestra foto de perfil (400x520) con navegación
// Si el usuario tiene múltiples fotos, permite navegar entre ellas
<PhotoGallery photos={user.photos.filter(p => p.estado === 'aprobada')} />
```

---

## 🗄️ **ESTRUCTURA DE ALMACENAMIENTO**

### **Cloudflare R2 (Almacenamiento de archivos)**
```
locutorio/
  photos/
    {user_id}/
      {photo_id}_avatar.jpg      (100x130)
      {photo_id}_profile.jpg     (400x520)
      {photo_id}_thumbnail.jpg   (50x65)
      {photo_id}_original.jpg    (guardado temporalmente para verificación)
```

### **Cloudflare D1 (Metadata)**
```sql
user_photos
  - id: "photo-uuid-123"
  - user_id: "user-456"
  - url_avatar: "https://r2.locutorio.com/photos/user-456/photo-uuid-123_avatar.jpg"
  - url_profile: "https://r2.locutorio.com/photos/user-456/photo-uuid-123_profile.jpg"
  - url_thumbnail: "https://r2.locutorio.com/photos/user-456/photo-uuid-123_thumbnail.jpg"
  - is_principal: true
  - estado: "aprobada"
  - fecha_subida: "2026-01-03 10:30:00"
  - fecha_verificacion: "2026-01-03 11:15:00"
  - verificado_por: "admin-789"
  - orden: 0
```

---

## 🔐 **REGLAS DE NEGOCIO**

1. **Máximo 6 fotos** por usuario
2. **Solo UNA foto principal** por usuario
3. **Solo fotos aprobadas** son visibles para otros usuarios
4. **Usuario siempre ve** todas sus fotos (incluso pendientes/rechazadas)
5. **Primera foto** se marca automáticamente como principal
6. **Al eliminar foto principal**, la primera restante se marca como principal
7. **Verificación en 24 horas** (máximo)
8. **Tamaño máximo**: 500KB por foto
9. **Formatos permitidos**: JPG, PNG
10. **Proporción fija**: 10:13 (vertical)

---

## 📊 **APIs NECESARIAS**

### **Frontend → Backend**
```typescript
// Subir foto
POST /api/photos/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}
Body: { file: File }
Response: { id, url_avatar, url_profile, url_thumbnail, estado }

// Listar fotos del usuario actual
GET /api/photos/me
Response: Photo[]

// Marcar como principal
PUT /api/photos/{id}/principal
Response: { success: true }

// Eliminar foto
DELETE /api/photos/{id}
Response: { success: true }
```

### **Admin Panel**
```typescript
// Listar fotos pendientes
GET /api/admin/photos/pending
Response: PendingPhoto[]

// Aprobar foto
PUT /api/admin/photos/{id}/approve
Response: { success: true }

// Rechazar foto
PUT /api/admin/photos/{id}/reject
Body: { motivo: string }
Response: { success: true }
```

---

## 🛠️ **TECNOLOGÍAS**

- **Frontend**: React/Next.js + TypeScript
- **Backend**: Hono + Cloudflare Workers
- **Almacenamiento**: Cloudflare R2 (S3-compatible)
- **Base de datos**: Cloudflare D1 (SQLite)
- **Procesamiento**: Sharp (redimensionar imágenes)
- **Autenticación**: JWT tokens

---

## 📝 **PRÓXIMOS PASOS**

1. ✅ Diseño UI (completado)
2. ✅ Esquema de base de datos (completado)
3. ⏳ Crear migración de D1
4. ⏳ Implementar API de subida
5. ⏳ Integrar con R2
6. ⏳ Implementar procesamiento de imágenes (3 tamaños)
7. ⏳ Crear panel de admin
8. ⏳ Implementar notificaciones
9. ⏳ Testing completo

---

**Última actualización**: 2026-01-03  
**Versión**: 1.0  
**Estado**: En desarrollo
