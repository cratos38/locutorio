# 🔄 ACTUALIZACIÓN - 2026-03-01

**Fecha:** 2026-03-01  
**Última actualización:** 2026-03-01 - 18:30  
**Tema principal:** Migración a InsightFace v4.0 + Fix Avatar  
**Estado:** ✅ COMPLETADO

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Problema Inicial: Avatar no se mostraba](#problema-inicial-avatar-no-se-mostraba)
3. [Migración a InsightFace v4.0](#migración-a-insightface-v40)
4. [Esquema Real de Supabase](#esquema-real-de-supabase)
5. [Umbrales de Face Matching](#umbrales-de-face-matching)
6. [Soluciones Implementadas](#soluciones-implementadas)
7. [Pendientes para Fase 2](#pendientes-para-fase-2)

---

## RESUMEN EJECUTIVO

### ✅ Logros del día:
1. **InsightFace v4.0 funcionando** - Migración completa de face_recognition (dlib) a InsightFace (ArcFace)
2. **Avatar funciona** - Se muestra en "Mi Espacio" y se actualiza automáticamente
3. **URLs firmadas regeneradas** - Solución al problema de tokens JWT expirados
4. **Detección de fotos robadas** - Sistema que compara contra todos los usuarios
5. **Umbrales optimizados** - Ajustados a 0.55 para mejor balance

### 🔴 Problemas encontrados y resueltos:
- Avatar mostraba `undefined` → columnas incorrectas en API
- URLs con doble `?` → cache-busting mal implementado
- Token JWT expirado → regeneración de URLs firmadas
- Face matching muy estricto → umbral bajado de 0.6 a 0.55

---

## PROBLEMA INICIAL: AVATAR NO SE MOSTRABA

### Síntomas:
```javascript
📸 Avatar URL: undefined
📊 Total fotos: 1
```

### Causa raíz:
El código buscaba columnas que **no existen** en Supabase:

```typescript
// ❌ ANTES (columnas inexistentes)
principalPhoto.url_thumbnail || principalPhoto.url_medium || principalPhoto.url

// ✅ AHORA (columnas reales)
principalPhoto.url_thumbnail || principalPhoto.cropped_url || principalPhoto.storage_url
```

### Problema adicional - URL con doble `?`:
```
https://...jpg?token=XXX?t=123456
                    ↑ primer ?  ↑ segundo ? (ERROR)
```

**Solución:**
```typescript
// Si ya tiene query string (?), usar &, sino usar ?
const separator = fotoPrincipal.includes('?') ? '&' : '?';
fotoPrincipal = `${fotoPrincipal}${separator}t=${Date.now()}`;
```

### Problema de tokens expirados:
**Error:** `{"statusCode":"400","error":"InvalidJWT","message":"Invalid Compact JWS"}`

**Causa:** Las URLs firmadas del ML Validator expiran después de 1 hora.

**Solución:** Regenerar URLs firmadas en el API `/api/profile`:
```typescript
const { data: signedData } = await supabase.storage
  .from(bucket)
  .createSignedUrl(path, 3600); // 1 hora
```

---

## MIGRACIÓN A INSIGHTFACE V4.0

### Versiones del ML Validator:

| Versión | Librería | Face Matching | Estado |
|---------|----------|---------------|--------|
| v3.1 | face_recognition (dlib) | ❌ No tenía | Obsoleto |
| v3.2 | face_recognition (dlib) | ❌ No funcionaba bien | Obsoleto |
| v3.3 | face_recognition (dlib) | ⚠️ Threshold 0.4 (distance) | Obsoleto |
| v3.4 | face_recognition (dlib) | ⚠️ Threshold 0.4 (distance) | Obsoleto |
| v3.5 | face_recognition (dlib) | ❌ Face matching desactivado | Obsoleto |
| **v4.0** | **InsightFace (ArcFace)** | ✅ **Threshold 0.55 (similarity)** | **✅ ACTIVO** |

### Diferencias clave:

#### face_recognition (dlib) - v3.x:
- **Embedding:** 128 dimensiones
- **Métrica:** Distancia euclidiana (menor = más similar)
- **Threshold:** `distance < 0.4` = misma persona
- **Precisión:** Baja, no detectaba variaciones de ángulo/luz

#### InsightFace (ArcFace) - v4.0:
- **Embedding:** 512 dimensiones
- **Métrica:** Similitud coseno (mayor = más similar)
- **Threshold:** `similarity > 0.55` = misma persona
- **Precisión:** Alta, detecta variaciones de ángulo/luz

### Conversión de umbrales:
```
distance = 1 - similarity

distance < 0.4  →  similarity > 0.6
distance < 0.6  →  similarity > 0.4
```

---

## ESQUEMA REAL DE SUPABASE

### Tabla `photos` - Columnas existentes:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'photos';
```

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid | ID único de la foto |
| `user_id` | uuid | ID del usuario propietario |
| `storage_url` | text | URL de la foto original (1024px) |
| `cropped_url` | text | URL de la foto medium (400px) |
| `is_primary` | boolean | Si es la foto principal del perfil |
| `status` | text | Estado: pending, approved, rejected |
| `storage_path` | text | Ruta en el bucket (ej: admin/123456.jpg) |
| `photo_type` | text | Tipo: profile, album |
| `album_id` | uuid | ID del álbum (null para fotos de perfil) |
| `created_at` | timestamp | Fecha de creación |

### ❌ Columnas que NO existen (pero el código buscaba):
- `url` (se usa `storage_url`)
- `url_medium` (se usa `cropped_url`)
- `url_thumbnail` (no existe todavía)
- `is_principal` (se usa `is_primary`)
- `estado` (se usa `status`)
- `orden` (se usa `display_order`)

### 🔧 Mapeo correcto:

```typescript
// Consulta a Supabase
.select('id, storage_url, cropped_url, is_primary, status, storage_path')

// Mapeo al formato del frontend
{
  id: photo.id,
  url: photo.storage_url,           // Original (1024px)
  url_medium: photo.cropped_url,    // Medium (400px)
  url_thumbnail: photo.cropped_url, // Temporalmente usar medium
  esPrincipal: photo.is_primary,
  estado: photo.status === 'approved' ? 'aprobada' : 
          photo.status === 'rejected' ? 'rechazada' : 'pendiente'
}
```

---

## UMBRALES DE FACE MATCHING

### Configuración actual (v4.0):

| Tipo de verificación | Umbral | Lógica | Resultado |
|---------------------|--------|--------|-----------|
| **Blacklist (celebridades)** | > 0.4 | `if similarity > 0.4` | ❌ Rechaza (blacklist) |
| **Fotos robadas (otros usuarios)** | > 0.55 | `if similarity > 0.55` | ❌ Rechaza (stolen_photo) |
| **Verificar mismo usuario** | > 0.55 | `if similarity > 0.55` | ✅ Aprueba (user_verified) |
| **Usuario no coincide** | ≤ 0.55 | `if similarity <= 0.55` | ❌ Rechaza (user_mismatch) |

### Ubicación del código:
```bash
~/ml-validator/server.py
Función: check_face_matching()
```

### Ejemplo de flujo:
1. Usuario sube foto → se extrae embedding (512 dimensiones)
2. **Check 1:** ¿Es de la blacklist? (similarity > 0.4) → Rechaza
3. **Check 2:** ¿Es de otro usuario? (similarity > 0.55) → Rechaza como stolen_photo
4. **Check 3:** ¿Es del mismo usuario? (similarity > 0.55) → Aprueba
5. **Check 4:** Si no hay embedding previo → Aprueba y guarda

### Valores de similarity observados:
- **Misma persona, mismo ángulo:** 0.95-0.98
- **Misma persona, ángulo diferente:** 0.55-0.75
- **Misma persona, luz diferente:** 0.50-0.65
- **Persona diferente:** 0.10-0.35
- **Foto robada de otro usuario:** 0.90-0.99

### Ajustes realizados hoy:
```python
# ANTES (muy estricto)
if similarity > 0.6:  # Solo aceptaba fotos muy similares
    return 'user_verified'

# AHORA (más tolerante)
if similarity > 0.55:  # Acepta variaciones de ángulo/luz
    return 'user_verified'
```

---

## SOLUCIONES IMPLEMENTADAS

### 1. Fix API `/api/profile` (route.ts)

**Problema:** Buscaba columnas inexistentes.

**Solución:**
```typescript
// Usar columnas reales de Supabase
.select('id, storage_url, cropped_url, is_primary, status, storage_path')

// Regenerar URLs firmadas para buckets privados
if (bucket === 'photos-pending' || bucket === 'photos-rejected') {
  const { data: signedData } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600); // 1 hora
}
```

**Commits:**
- `f54950b` - "fix: Use real Supabase column names"
- `8ef177c` - "fix: Regenerate signed URLs for private bucket photos"

### 2. Fix dashboard avatar (dashboard/page.tsx)

**Problema 1:** Buscaba `url_thumbnail` que no existe.

**Solución:**
```typescript
// Buscar en orden: thumbnail → cropped → medium → storage → url
fotoPrincipal = principalPhoto.url_thumbnail || 
                principalPhoto.cropped_url || 
                principalPhoto.url_medium || 
                principalPhoto.storage_url || 
                principalPhoto.url;
```

**Problema 2:** Doble `?` en la URL.

**Solución:**
```typescript
// Detectar si ya tiene query string
const separator = fotoPrincipal.includes('?') ? '&' : '?';
fotoPrincipal = `${fotoPrincipal}${separator}t=${Date.now()}`;
```

**Commits:**
- `0277b6b` - "fix: Use cropped_url as fallback for avatar display"
- `b92f58e` - "fix: Use & instead of ? when adding cache-busting to signed URLs"

### 3. Fix subida de fotos (api/photos/upload/route.ts)

**Problema:** Intentaba guardar `url_thumbnail` en columna inexistente.

**Solución:**
```typescript
// Comentar temporalmente hasta crear la columna
// url_thumbnail: thumbnailUrl, // COMENTADO

// Solo guardar columnas existentes
storage_url: photoUrl,
cropped_url: mediumUrl,
is_primary: isPrincipal,
```

**Commits:**
- `d50a6a2` - "fix: Comment url_thumbnail until column exists in Supabase"

### 4. ML Validator - Ajuste de umbrales

**Problema:** Threshold 0.6 era muy estricto (rechazaba misma persona en otro ángulo).

**Solución:**
```python
# Cambio en ~/ml-validator/server.py
# ANTES
if similarity > 0.6:
    return 'user_verified'

# AHORA
if similarity > 0.55:
    return 'user_verified'
```

**Acción manual:** Editado directamente en el servidor con nano.

### 5. Detección de fotos robadas

**Problema:** No verificaba si la foto pertenecía a otro usuario.

**Solución:**
```python
# Nuevo código en check_face_matching()
for other_user_id, other_embedding in user_faces_db.items():
    if other_user_id == user_id:
        continue
    similarity = cosine_similarity(other_embedding, current_embedding)
    if similarity > 0.55:
        return {
            'match_type': 'stolen_photo',
            'message': f"Esta foto pertenece a otro usuario (similarity: {similarity:.3f})"
        }
```

**Commits:**
- `625a45d` - "feat: Add stolen photo detection - compare against all users"

---

## PENDIENTES PARA FASE 2

### 🔴 Alta prioridad:

#### 1. Notificaciones no llegan
- **Problema:** Las notificaciones push no llegan a los usuarios
- **Acción:** Revisar sistema de notificaciones (Firebase, WebPush, etc.)

#### 2. Fotos para revisión manual no aparecen en admin
- **Problema:** Fotos que requieren revisión manual no se muestran en el panel admin
- **Posibles causas:**
  - API `/api/admin/profile-photos` no filtra correctamente
  - Estado "manual_review" no existe o no se usa
  - Frontend no muestra la sección correcta

#### 3. Reorganizar estructura de carpetas en Supabase
- **Problema actual:** Fotos aprobadas quedan en `photos-pending` (privado)
- **Solución propuesta:**
  - `photos-pending/` → Privado (fotos pendientes de validación)
  - `photos-approved/` → Público (fotos aprobadas visibles)
  - `photos-rejected/` → Privado (fotos rechazadas)
- **Acción:** Implementar movimiento automático de fotos después de validación

### 🟡 Media prioridad:

#### 4. Agregar columna `url_thumbnail` (96x96px)
- **Problema:** Avatar carga foto de 400x400px (lento)
- **Solución:** Crear miniaturas de 96x96px
- **SQL:**
  ```sql
  ALTER TABLE photos ADD COLUMN url_thumbnail TEXT;
  ```
- **Acción:** Actualizar código de subida para generar thumbnail

#### 5. Implementar movimiento automático de fotos
- **Ubicación:** ML Validator (`~/ml-validator/server.py`)
- **Lógica:**
  ```python
  if verdict == "APPROVE":
      # Mover de photos-pending a photos-approved
      supabase.storage.from_('photos-pending').move(path, 'photos-approved/' + path)
      # Actualizar URL en base de datos
  ```

#### 6. Álbumes públicos/privados
- **Revisión:** Validación diferenciada según tipo de álbum
- **Estado:** Por implementar

### 🟢 Baja prioridad:

#### 7. Optimización de tiempos de carga
- Avatar tarda ~1500ms en cargar
- Opciones:
  - CDN para imágenes
  - Miniaturas más pequeñas
  - Cache más agresivo

#### 8. Logs y monitoreo mejorado
- Centralizar logs del ML Validator
- Dashboard de métricas (aprobadas/rechazadas/pending)

---

## ARCHIVOS MODIFICADOS HOY

### Frontend (Next.js):
```
src/app/dashboard/page.tsx
src/app/api/profile/route.ts
src/app/api/photos/upload/route.ts
```

### Backend (ML Validator):
```
~/ml-validator/server.py  (editado manualmente en servidor)
~/ml-validator/user_faces_db.json  (borrado y recreado vacío)
```

### Commits del día:
```
c8600ab - debug: Add console logs for avatar URL debugging
21ba946 - fix: Add url_thumbnail to photo upload INSERT (v4.0 schema)
dc699ae - revert: Rollback to v3.5 column names + add url_thumbnail
d50a6a2 - fix: Comment url_thumbnail until column exists in Supabase
f54950b - fix: Use real Supabase column names (storage_url, cropped_url, is_primary, status)
0277b6b - fix: Use cropped_url as fallback for avatar display
8ef177c - fix: Regenerate signed URLs for private bucket photos (expires after 1h)
b92f58e - fix: Use & instead of ? when adding cache-busting to signed URLs
625a45d - feat: Add stolen photo detection - compare against all users
```

---

## CONFIGURACIÓN DEL SERVIDOR ML VALIDATOR

### Ubicación:
```
Servidor: 192.168.1.159
Puerto: 5000
Directorio: ~/ml-validator/
```

### Servicios activos (screen sessions):
```bash
screen -ls
# mlvalidator - Puerto 5000 (Flask service)
# polling     - Polling de Supabase cada 10s
# webhook     - Procesamiento de fotos pendientes
```

### Archivos importantes:
```
~/ml-validator/server.py              # Código principal v4.0
~/ml-validator/user_faces_db.json     # Embeddings de usuarios (512 dim)
~/ml-validator/face_blacklist.json    # Blacklist de celebridades
~/ml-validator/start_all.sh           # Script de inicio
~/ml-validator/ml-validator.log       # Logs
```

### Comandos útiles:
```bash
# Ver logs en tiempo real
screen -r mlvalidator

# Reiniciar servicios
screen -S mlvalidator -X quit
screen -S polling -X quit
screen -S webhook -X quit
sleep 2
~/ml-validator/start_all.sh

# Verificar health
curl http://localhost:5000/health | python3 -m json.tool

# Ver umbrales activos
grep -n "similarity > 0\." server.py | grep -v "#"
```

---

## LECCIONES APRENDIDAS

### ❌ Errores cometidos:
1. **Asumir nombres de columnas** sin verificar el esquema real de Supabase
2. **Cambiar muchas cosas a la vez** sin probar paso a paso
3. **No verificar si query string ya existe** antes de agregar cache-busting
4. **Intentar usar columnas futuras** (`url_thumbnail`) antes de crearlas

### ✅ Buenas prácticas aplicadas:
1. **Verificar esquema de BD primero** con `SELECT column_name FROM information_schema.columns`
2. **Commits atómicos** - Un fix por commit
3. **Regenerar URLs firmadas** en tiempo real para evitar expiración
4. **Cache-busting inteligente** - Detectar `?` existente antes de agregar parámetros
5. **Fallbacks múltiples** - Intentar varias columnas en orden

### 🎯 Recomendaciones:
1. **Documentar esquema de BD** en DECISIONES_MASTER.md
2. **Crear columna url_thumbnail** antes de usarla en código
3. **Implementar tests** para verificar URLs firmadas
4. **Centralizar mapeo de columnas** en un archivo de utilidades
5. **Agregar tipos TypeScript** para la tabla photos

---

## ESTADO FINAL

### ✅ Funcionando:
- [x] Subida de fotos de perfil
- [x] Avatar en "Mi Espacio"
- [x] Actualización automática del avatar
- [x] Face matching con InsightFace v4.0
- [x] Detección de fotos robadas entre usuarios
- [x] URLs firmadas regeneradas (válidas 1 hora)
- [x] Umbrales ajustados (0.55 para usuario, 0.55 para stolen, 0.4 para blacklist)

### ⚠️ Con limitaciones:
- [ ] Avatar carga lento (usa 400x400px en lugar de 96x96px)
- [ ] Fotos aprobadas quedan en bucket privado (pending)
- [ ] Sin movimiento automático a photos-approved

### ❌ Pendiente:
- [ ] Notificaciones
- [ ] Panel admin para fotos de revisión manual
- [ ] Reorganización de buckets
- [ ] Columna url_thumbnail
- [ ] Álbumes públicos/privados

---

**Próxima sesión:** Fase 2 - Notificaciones + Admin panel + Reorganización de buckets

---

_Documento generado automáticamente el 2026-03-01_
