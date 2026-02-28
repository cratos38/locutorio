# GUÍA DE MIGRACIÓN DE BUCKETS v3.5

## 📦 NUEVA ESTRUCTURA DE BUCKETS

```
photos-pending (PRIVADO)
  ├─→ APPROVED    → photos-approved (PÚBLICO)
  ├─→ REJECTED    → photos-rejected (PRIVADO, se borran después de 24h)
  └─→ AUTO-DELETE → Borrar inmediatamente (armas/drogas)
```

## ✅ SCRIPTS YA ACTUALIZADOS

### 1. **supabase_webhook_v3.5.py** ✅
- Mueve fotos aprobadas a `photos-approved`
- Mueve fotos rechazadas a `photos-rejected`
- Borra fotos auto-delete de `photos-pending`
- Actualiza URLs en la BD

### 2. **src/app/api/photos/route.ts** ✅  
- Genera URLs públicas para `photos-approved`
- Genera URLs firmadas para `photos-pending` y `photos-rejected`
- Detecta automáticamente el bucket correcto

### 3. **src/app/api/photos/upload/route.ts** ✅
- Ya sube a `photos-pending` correctamente

## 🔧 SCRIPTS QUE NECESITAN ACTUALIZACIÓN

### 1. **PhotoManager.tsx**
**Ubicación:** `src/components/PhotoManager.tsx`

**Qué hace:** Muestra fotos del usuario y permite subir/eliminar

**Cambios necesarios:**
- ✅ Ya usa el API correcto (`/api/photos?showAll=true`)
- ✅ El API maneja los buckets automáticamente
- **NO REQUIERE CAMBIOS**

### 2. **PublicProfile (si existe)**
**Ubicación:** `src/app/publicprofile/[username]/page.tsx`

**Qué hace:** Muestra perfil público del usuario

**Cambios necesarios:**
- ✅ Ya usa el API correcto (`/api/photos?username=X`)
- ✅ El API solo retorna fotos approved (en bucket público)
- **NO REQUIERE CAMBIOS**

### 3. **API DELETE (si existe)**
**Ubicación:** `src/app/api/photos/[id]/route.ts`

**Qué hace:** Borra fotos

**Cambios necesarios:**
```typescript
// ANTES:
const { error } = await supabase.storage
  .from('photos-pending')
  .remove([photo.storage_path]);

// DESPUÉS: Detectar bucket dinámicamente
let bucket = 'photos-pending';
if (photo.storage_url.includes('/photos-approved/')) {
  bucket = 'photos-approved';
} else if (photo.storage_url.includes('/photos-rejected/')) {
  bucket = 'photos-rejected';
}

const { error } = await supabase.storage
  .from(bucket)
  .remove([photo.storage_path]);
```

### 4. **CRON JOB: Limpiar fotos rechazadas después de 24h**
**Ubicación:** NUEVO SCRIPT NECESARIO

**Qué hace:** Borra fotos de `photos-rejected` con más de 24h

**Crear:** `cleanup_rejected_photos.py`

```python
#!/usr/bin/env python3
"""
Borra fotos rechazadas con más de 24 horas
Ejecutar con cron cada hora
"""
import os
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

headers = {
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'apikey': SUPABASE_SERVICE_KEY,
    'Content-Type': 'application/json'
}

# 1. Obtener fotos rechazadas con más de 24h
cutoff = (datetime.utcnow() - timedelta(hours=24)).isoformat()
url = f"{SUPABASE_URL}/rest/v1/photos"
params = {
    'status': 'eq.rejected',
    'rejected_at': f'lt.{cutoff}',
    'select': 'id,storage_path'
}

response = requests.get(url, headers=headers, params=params)
photos = response.json()

print(f"📋 {len(photos)} fotos rechazadas a borrar")

for photo in photos:
    photo_id = photo['id']
    storage_path = photo['storage_path']
    
    try:
        # Extraer versiones
        base = storage_path.rsplit('.', 1)[0]
        ext = storage_path.rsplit('.', 1)[1]
        versions = [
            storage_path,
            f"{base}_medium.{ext}",
            f"{base}_thumbnail.{ext}"
        ]
        
        # Borrar archivos de storage
        for version in versions:
            delete_url = f"{SUPABASE_URL}/storage/v1/object/photos-rejected/{version}"
            requests.delete(delete_url, headers=headers)
        
        # Marcar como borrada en BD
        update_url = f"{SUPABASE_URL}/rest/v1/photos"
        update_params = {'id': f'eq.{photo_id}'}
        update_payload = {'is_deleted': True, 'deleted_at': datetime.utcnow().isoformat()}
        requests.patch(update_url, headers=headers, params=update_params, json=update_payload)
        
        print(f"✅ Borrada: {storage_path}")
    
    except Exception as e:
        print(f"❌ Error borrando {photo_id}: {e}")

print("✅ Limpieza completada")
```

**Configurar CRON:**
```bash
# Ejecutar cada hora
0 * * * * cd /home/user/webapp && python3 cleanup_rejected_photos.py >> cleanup.log 2>&1
```

## 🔍 VERIFICACIÓN

### Comprobar que todo funciona:

1. **Subir foto nueva** → debe ir a `photos-pending`
2. **Esperar validación** (2-3 min)
3. **Si APROBADA** → debe moverse a `photos-approved`
4. **Si RECHAZADA** → debe moverse a `photos-rejected`
5. **Después de 24h** → rechazadas deben borrarse

### Comprobar buckets en Supabase:

```bash
# Ver fotos en cada bucket
python3 -c "
import os, requests
from dotenv import load_dotenv
load_dotenv()

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_KEY')
headers = {'Authorization': f'Bearer {key}', 'apikey': key}

for bucket in ['photos-pending', 'photos-approved', 'photos-rejected']:
    r = requests.post(f'{url}/storage/v1/object/list/{bucket}', 
                     headers=headers, json={'prefix': 'admin/', 'limit': 10})
    files = r.json()
    print(f'{bucket}: {len(files)} archivos')
"
```

## 📋 CHECKLIST COMPLETO

- [✅] Webhook mueve fotos aprobadas
- [✅] Webhook mueve fotos rechazadas
- [✅] Webhook borra auto-delete
- [✅] API genera URLs correctas
- [✅] Frontend recibe URLs correctas
- [ ] DELETE API detecta bucket correcto
- [ ] CRON job limpia rechazadas después de 24h
- [ ] Migrar fotos antiguas de pending a approved/rejected

