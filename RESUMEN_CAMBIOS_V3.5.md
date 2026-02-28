# ML Photo Validator v3.5 - Resumen de Cambios

## ✅ COMPLETADO - server-v3.5-complete.py

### 📦 Descarga
```bash
cd ~/ml-validator
wget -O server.py "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/server-v3.5-complete.py"
```

**Verificar:**
```bash
wc -l server.py   # Debe mostrar: 1669 server.py
head -20 server.py  # Verificar versión v3.5
```

**Instalar y ejecutar:**
```bash
source venv/bin/activate
python server.py
```

---

## 🔄 Cambios Principales en v3.5

### 1. **Tres Tipos de Validación**

#### 🖼️ **PERFIL** (`type: 'profile'`) - SIN CAMBIOS
- ✅ Exactamente 1 rostro
- ✅ Rostro ≥ 10% de la imagen
- ✅ Nitidez ≥ 50 (review ≥ 30)
- ✅ Resolución mínima 400px
- ✅ NSFW: rechazar explícito + cuestionable
- ✅ OCR: bloquear TODO (texto, URLs, teléfonos, palabras prohibidas)
- ✅ Objetos prohibidos: armas + drogas + alcohol
- ✅ Face matching (blacklist + perfil usuario)
- ✅ Detección AI/deepfake
- ✅ Recortar y redimensionar a 600px

**Ejemplos de rechazo:**
- Múltiples rostros
- Rostro muy pequeño o borroso
- Contenido NSFW (explícito o cuestionable)
- Texto con URLs, teléfonos, promociones
- Armas, drogas, alcohol visibles
- Foto de celebridad (blacklist)
- Imagen generada por IA

---

#### 📸 **ÁLBUM PÚBLICO** (`type: 'album_public'`) - NUEVO
**Solo 3 validaciones:**

1. **NSFW (modo STRICT)**
   - ❌ Rechazar: contenido explícito (genitales, actos sexuales)
   - ✅ Permitir: bikini, traje de baño, ropa interior, ropa ajustada, 80% piel expuesta
   - ⚠️ Niños pequeños en playa/piscina → Revisión manual (contexto familiar)

2. **OCR (modo VULGAR_ONLY)**
   - ❌ Rechazar solo si contiene:
     - **Palabras vulgares/obscenas**:
       - Español: puta, coño, verga, follar, mamar, chupar, etc.
       - Inglés: fuck, shit, bitch, dick, cock, pussy, etc.
     - **Propaganda / URLs de otras apps**:
       - Patrón genérico: `palabra.com`, `palabra.org`, `palabra.net`, etc.
       - Ejemplos: tinder.com, bumble.com, instagram.com, onlyfans.com
   - ✅ Permitir: texto normal (nombres, lugares, fechas)

3. **Objetos Prohibidos (modo WEAPONS_DRUGS_ONLY)**
   - ❌ Detectar solo: armas (knife, scissors) + drogas
   - ✅ Permitir: alcohol (bottle, wine glass, cup) - fiestas, bares, cumpleaños
   - 🗑️ **BORRADO AUTOMÁTICO**: Si detecta armas/drogas → eliminar inmediatamente (sin esperar 24h)

**NO se valida:**
- ❌ Número de rostros (pueden ser fotos grupales con amigos/familia)
- ❌ Tamaño de rostros
- ❌ Nitidez
- ❌ Resolución mínima
- ❌ Face matching
- ❌ Detección AI/deepfake
- ❌ NO se recorta la imagen (mantener original)

---

#### 🔒 **ÁLBUM PRIVADO** (`type: 'album_private'`) - NUEVO
- ✅ **Aprobado automáticamente sin validaciones**
- Usuario puede subir lo que quiera (solo él lo ve)

---

### 2. **Política de Rechazo Actualizada**

#### ⚠️ Rechazos con Borrado Automático (sin esperar 24h)
- Armas (knife, scissors) en álbum público
- Drogas detectadas en álbum público

**Respuesta JSON:**
```json
{
  "verdict": "REJECT",
  "reason": "prohibited_objects_critical",
  "message": "Objetos prohibidos detectados (auto-eliminación): knife (87%)",
  "auto_delete": true,
  "object_data": {...}
}
```

**Acción en Supabase:**
- Borrar foto inmediatamente
- Notificar usuario: "Foto eliminada por violar políticas: armas/drogas"

---

#### 🕐 Rechazos con 24 Horas para Corregir
- NSFW explícito en álbum público
- Palabras vulgares/propaganda en álbum público
- Cualquier rechazo en perfil

**Respuesta JSON:**
```json
{
  "verdict": "REJECT",
  "reason": "text_detected",
  "message": "Contenido no permitido: lenguaje vulgar (puta, fuck)",
  "auto_delete": false,
  "ocr_data": {...}
}
```

**Acción en Supabase:**
- Marcar foto como `status: 'rejected'`
- Notificar usuario: "Tienes 24h para modificar/mover a privado/eliminar"
- Cron job elimina automáticamente después de 24h si no se corrige

---

### 3. **Nuevas Funciones Actualizadas**

#### `check_nsfw(img_array, strict_mode=False)`
```python
# PERFIL (strict_mode=False): Rechazar explícito + cuestionable
nsfw_result = check_nsfw(img_resized, strict_mode=False)

# ÁLBUM (strict_mode=True): Solo rechazar explícito
nsfw_result = check_nsfw(img_resized, strict_mode=True)
```

**Veredictos:**
- `explicit`: Genitales, actos sexuales → **SIEMPRE rechazar**
- `questionable`: Bikini, ropa interior, piel expuesta → **Solo rechazar en perfil**
- `safe`: Todo OK

---

#### `check_text_content(img_array, mode='full')`
```python
# PERFIL (mode='full'): Validar TODO
ocr_result = check_text_content(img_resized, mode='full')
# Rechaza: teléfonos, URLs, palabras prohibidas, texto largo (>50 chars)

# ÁLBUM (mode='vulgar_only'): Solo vulgar + propaganda
ocr_result = check_text_content(img_resized, mode='vulgar_only')
# Rechaza SOLO: palabras vulgares + URLs (.com, .org, .net, etc.)
```

**Patrón URL genérico:**
```python
url_pattern = r'\b\w+\.(com|org|net|co|info|io|app|xyz|me|club|tv|es|mx|ar)\b'
```

**Ejemplos detectados:**
- ✅ `visitame.com` → Rechazar (propaganda)
- ✅ `tinder.com` → Rechazar (otra app)
- ✅ `instagram.com` → Rechazar (propaganda)
- ❌ `"Fiesta 2024"` → Permitir (texto normal)

---

#### `check_prohibited_objects(img_array, mode='all')`
```python
# PERFIL (mode='all'): Todos los objetos
obj_result = check_prohibited_objects(img_resized, mode='all')
# Detecta: knife, scissors, bottle, wine glass, cup

# ÁLBUM (mode='weapons_drugs_only'): Solo armas + drogas
obj_result = check_prohibited_objects(img_resized, mode='weapons_drugs_only')
# Detecta SOLO: knife, scissors (con auto_delete=True)
```

---

### 4. **Configuración Actualizada**

```python
VALIDATION_CONFIG = {
    'profile': {
        # Sin cambios (todas las validaciones)
    },
    'album_public': {
        'nsfw_enabled': True,
        'nsfw_strict': True,  # Solo explícito
        'ocr_enabled': True,
        'ocr_mode': 'vulgar_only',  # Solo vulgar + propaganda
        'object_detection_enabled': True,
        'object_mode': 'weapons_drugs_only',  # Solo armas + drogas
        'auto_delete_weapons_drugs': True,  # Borrado automático
        # NO validar rostros, nitidez, AI
        'face_detection_enabled': False,
        'crop_enabled': False
    },
    'album_private': {
        # Sin validaciones
    }
}
```

---

### 5. **Objetos Prohibidos por Tipo**

```python
PROHIBITED_OBJECTS = {
    'profile': {
        'knife': {'threshold': 0.6, 'severity': 'high', 'auto_delete': False},
        'scissors': {'threshold': 0.6, 'severity': 'medium', 'auto_delete': False},
        'bottle': {'threshold': 0.7, 'severity': 'medium', 'auto_delete': False},
        'wine glass': {'threshold': 0.7, 'severity': 'medium', 'auto_delete': False},
        'cup': {'threshold': 0.8, 'severity': 'low', 'auto_delete': False}
    },
    'album_public': {
        'knife': {'threshold': 0.6, 'severity': 'critical', 'auto_delete': True},
        'scissors': {'threshold': 0.6, 'severity': 'critical', 'auto_delete': True}
        # NO validar alcohol (bottle, wine glass, cup)
    }
}
```

---

## 📊 Comparación de Validaciones

| Validación | Perfil | Álbum Público | Álbum Privado |
|------------|--------|---------------|---------------|
| Rostros (cantidad) | ✅ Exactamente 1 | ❌ No | ❌ No |
| Rostros (tamaño ≥10%) | ✅ Sí | ❌ No | ❌ No |
| Nitidez (≥50) | ✅ Sí | ❌ No | ❌ No |
| Resolución (≥400px) | ✅ Sí | ❌ No | ❌ No |
| NSFW | ✅ Explícito + Cuestionable | ✅ Solo Explícito | ❌ No |
| OCR | ✅ TODO | ✅ Solo Vulgar + URLs | ❌ No |
| Objetos | ✅ Armas + Drogas + Alcohol | ✅ Solo Armas + Drogas | ❌ No |
| Face Matching | ✅ Sí | ❌ No | ❌ No |
| AI/Deepfake | ✅ Sí | ❌ No | ❌ No |
| Recorte | ✅ Sí (600px) | ❌ No | ❌ No |
| Auto-Delete | ❌ No | ✅ Sí (armas/drogas) | ❌ No |

---

## 🧪 Ejemplos de Uso

### Perfil
```bash
curl -X POST http://192.168.1.159:5000/validate \
  -H "Content-Type: application/json" \
  -d '{
    "photoUrl": "https://ejemplo.com/perfil.jpg",
    "type": "profile",
    "userId": "user_123"
  }'
```

### Álbum Público
```bash
curl -X POST http://192.168.1.159:5000/validate \
  -H "Content-Type: application/json" \
  -d '{
    "photoUrl": "https://ejemplo.com/album.jpg",
    "type": "album_public",
    "userId": "user_123"
  }'
```

**Respuesta aprobada (bikini permitido):**
```json
{
  "verdict": "APPROVE",
  "photo_type": "album_public",
  "nsfw_data": {
    "verdict": "safe",
    "strict_mode": true
  },
  "processing_time": 1.2
}
```

**Respuesta rechazada (arma detectada):**
```json
{
  "verdict": "REJECT",
  "reason": "prohibited_objects_critical",
  "message": "Objetos prohibidos detectados (auto-eliminación): knife (87%)",
  "auto_delete": true,
  "object_data": {...},
  "processing_time": 1.8
}
```

### Álbum Privado
```bash
curl -X POST http://192.168.1.159:5000/validate \
  -H "Content-Type: application/json" \
  -d '{
    "photoUrl": "https://ejemplo.com/privado.jpg",
    "type": "album_private"
  }'
```

**Respuesta (siempre aprobado):**
```json
{
  "verdict": "APPROVE",
  "message": "Álbum privado aprobado sin validaciones",
  "photo_type": "album_private",
  "processing_time": 0.1
}
```

---

## 🎯 Próximos Pasos

1. **Instalar v3.5** en tu servidor Ubuntu
2. **Verificar funcionamiento** con curl
3. **Integrar con Supabase**:
   - Webhook detecta nuevas fotos en `photos-pending/`
   - Llama a `/validate` con `type: 'profile' | 'album_public' | 'album_private'`
   - Si `auto_delete: true` → borrar inmediatamente
   - Si `auto_delete: false` → dar 24h para corregir
4. **Crear cron job** para eliminar fotos rechazadas después de 24h

---

## 📝 Notas Importantes

- ⚠️ **Álbumes públicos**: Pueden tener múltiples rostros (fotos grupales con amigos/familia)
- ✅ **Bikini/traje de baño**: Permitido en álbumes públicos
- 🗑️ **Armas/drogas**: Borrado automático sin esperar 24h
- 🍺 **Alcohol**: Permitido en álbumes (fiestas, bares, cumpleaños)
- 🔒 **Álbumes privados**: Sin validaciones (total libertad)

---

**Versión:** 3.5  
**Archivo:** server-v3.5-complete.py (1669 líneas)  
**Fecha:** 2026-02-28
