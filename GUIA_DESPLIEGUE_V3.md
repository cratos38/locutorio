# Guía de Despliegue: ML Validator v3.0

**Fecha:** 2026-02-26  
**Servidor:** Ubuntu 22.04 (192.168.1.159)  
**Usuario:** adminadmin

---

## 📋 Resumen de Mejoras v3.0

### ✅ Problemas Resueltos

1. **Crop Inteligente Mejorado**
   - ✅ Margen superior 120% (vs 50% anterior) para peinados altos
   - ✅ Margen lateral 80% (configurable)
   - ✅ Centrado basado en centro del rostro, no en esquinas
   - ✅ No corta peinados ni cabello voluminoso

2. **Nitidez Solo en Rostro**
   - ✅ Calcula Laplacian variance SOLO en zona del rostro (+30% margen)
   - ✅ Ignora blur en cuerpo/fondo
   - ✅ Acepta fotos con profundidad de campo (rostro nítido, fondo borroso)

3. **Cálculo de % de Rostro Correcto**
   - ✅ Redimensiona imagen a max 1200px ANTES de calcular porcentaje
   - ✅ Resultados consistentes sin importar tamaño original
   - ✅ Más rápido (menos cómputo con imágenes pequeñas)

4. **Umbrales Ajustados**
   - ✅ % Rostro: 10% mínimo (vs 15% anterior)
   - ✅ Nitidez: 50 mínimo (solo rostro), 30 para revisión manual
   - ✅ Configuración separada para perfil vs álbum

---

## 🚀 Pasos de Instalación

### 1. Conectar al Servidor

```bash
# Desde Windows PowerShell
ssh adminadmin@192.168.1.159

# Desde PuTTY
Host: 192.168.1.159
Port: 22
User: adminadmin
```

### 2. Navegar al Proyecto

```bash
cd ~/ml-validator
source venv/bin/activate  # Activar entorno virtual
```

### 3. Verificar Estado Actual

```bash
# Ver procesos Python activos
ps aux | grep python

# Si hay un servidor corriendo, detenerlo
kill <PID>

# O cerrar la ventana de PuTTY donde corre el servidor
```

### 4. Instalar Archivos Nuevos

**Opción A: Transferir desde esta sesión**

Los archivos ya han sido creados en `/home/user/webapp/`:
- `ml-validator-server-v3.py` - Servidor mejorado
- `ml-validator-test-v3.html` - UI de prueba mejorada
- `PLAN_MEJORAS_VALIDACION_FOTOS.md` - Documentación

Transferir con SCP:

```powershell
# Desde Windows PowerShell (en /home/user/webapp)
scp ml-validator-server-v3.py adminadmin@192.168.1.159:~/ml-validator/server.py
scp ml-validator-test-v3.html adminadmin@192.168.1.159:~/ml-validator/test.html
scp PLAN_MEJORAS_VALIDACION_FOTOS.md adminadmin@192.168.1.159:~/ml-validator/
```

**Opción B: Copiar manualmente**

1. Abrir los archivos en este chat
2. Copiar el contenido
3. En el servidor Ubuntu:

```bash
cd ~/ml-validator
nano server.py
# Pegar contenido de ml-validator-server-v3.py
# Guardar: Ctrl+O, Enter, Ctrl+X

nano test.html
# Pegar contenido de ml-validator-test-v3.html
# Guardar: Ctrl+O, Enter, Ctrl+X
```

### 5. Verificar Archivos

```bash
cd ~/ml-validator
ls -lh
# Deberías ver:
# - server.py (~23 KB)
# - test.html (~19 KB)
# - venv/ (directorio)
```

### 6. Iniciar Servidor v3.0

```bash
cd ~/ml-validator
source venv/bin/activate
python server.py
```

**Salida esperada:**

```
======================================================================
🚀 ML VALIDATOR v3.0 - SMART CROP & FACE-ONLY SHARPNESS
======================================================================

📍 ENDPOINTS:
   • Health:   GET  http://192.168.1.159:5000/health
   • Validate: POST http://192.168.1.159:5000/validate
   • Test UI:  GET  http://192.168.1.159:5000/test.html

⚙️ CONFIGURACIÓN:
   • Profile:  min_face=10%, min_sharpness=50, crop_margin=80%
   • Album:    min_face=5%,  min_sharpness=40, crop_margin=50%

⚡ GPU HABILITADA: 1 dispositivo(s)
   • /device:GPU:0

======================================================================
🎯 MEJORAS v3.0:
   ✅ Crop inteligente con márgenes generosos
   ✅ Margen superior 120% para peinados altos
   ✅ Nitidez medida SOLO en zona del rostro
   ✅ Redimensionamiento antes de calcular % rostro
   ✅ Umbrales ajustados por tipo de foto
======================================================================

 * Running on http://127.0.0.1:5000
 * Running on http://192.168.1.159:5000
```

---

## 🧪 Pruebas

### 1. Health Check

**Desde navegador (Windows):**
```
http://192.168.1.159:5000/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "service": "ml-validator",
  "version": "3.0",
  "gpu_enabled": true,
  "tensorflow_version": "2.15.0",
  "features": {
    "smart_crop": true,
    "face_only_sharpness": true,
    "adaptive_thresholds": true,
    "profile_validation": true,
    "album_validation": true
  }
}
```

### 2. Test UI

**Abrir en navegador:**
```
http://192.168.1.159:5000/test.html
```

**Características de la UI v3.0:**
- ✅ Diseño moderno con gradiente violeta
- ✅ Badges de características (Smart Crop, Face-Only Sharpness, GPU)
- ✅ Selector de fotos de ejemplo categorizadas
- ✅ Vista previa de imagen original
- ✅ Comparación lado a lado: Original vs Crop
- ✅ Métricas con colores (verde=bueno, naranja=warning, rojo=malo)
- ✅ JSON completo del resultado

### 3. Casos de Prueba

#### ✅ **APROBAR: Retrato cercano**

URL: `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d`

**Resultado esperado:**
```
✅ APROBADA
📈 % Rostro: 25-35%
🔎 Nitidez: 100-200
⏱️ Tiempo: 0.8-1.2s
```

**Validar que:**
- ✅ Crop incluye toda la cabeza + cuello
- ✅ No corta peinado
- ✅ Imagen centrada correctamente
- ✅ Tamaño final 600×600 px

---

#### ✅ **APROBAR: Hombre con barba**

URL: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e`

**Resultado esperado:**
```
✅ APROBADA
📈 % Rostro: 15-25%
🔎 Nitidez: 80-150
⏱️ Tiempo: 0.8-1.2s
```

**Validar que:**
- ✅ Barba incluida completamente
- ✅ Margen superior correcto
- ✅ No corta parte superior de la cabeza

---

#### ⚠️ **REVISIÓN MANUAL: Cuerpo completo**

URL: `https://images.unsplash.com/photo-1519085360753-af0119f7cbe7`

**Resultado esperado:**
```
⚠️ REVISIÓN MANUAL
📈 % Rostro: 6-10%
🔎 Nitidez: 50-80
Razón: "rostro pequeño (8.5%)"
```

**Validar que:**
- ⚠️ Se genera el crop correctamente
- ⚠️ Crop incluye toda la cabeza
- ⚠️ No rechaza automáticamente (antes era REJECT)

---

#### ❌ **RECHAZAR: Múltiples rostros**

URL: `https://images.unsplash.com/photo-1511632765486-a01980e01a18`

**Resultado esperado:**
```
❌ RECHAZADA
Razón: "multiple_faces"
Mensaje: "Se detectaron 3 rostros. Las fotos de perfil deben tener solo una persona"
```

---

#### ❌ **RECHAZAR: Sin rostros**

URL: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4`

**Resultado esperado:**
```
❌ RECHAZADA
Razón: "no_face"
Mensaje: "No se detectó ningún rostro en la foto"
```

---

### 4. Probar Casos Reales (Fotos del Usuario)

**Fotos con problemas anteriores:**

1. **Foto 1: Mujer perfil (antes: 6.9%)**
   - Antes: MANUAL_REVIEW (rostro pequeño)
   - Ahora: Debería calcular 25-35% → APPROVE
   - Validar: crop no corta peinado

2. **Foto 2: Hombre con peinado alto**
   - Antes: cortaba el peinado
   - Ahora: margen superior 120% → peinado completo
   - Validar: crop incluye toda la cabeza

3. **Foto 3: Mujer con fondo borroso**
   - Antes: REJECT (foto borrosa)
   - Ahora: nitidez solo en rostro → APPROVE
   - Validar: ignora blur del fondo

---

## 📊 Verificar Logs del Servidor

Cuando valides una foto, el terminal debe mostrar:

```
======================================================================
🔍 VALIDANDO FOTO: PROFILE
📍 URL: https://images.unsplash.com/photo-...
======================================================================
📥 Descargando imagen...
✅ Imagen descargada: 4000×6000 px
📐 Redimensionando imagen...
✅ Imagen redimensionada: 800×1200 px
🔍 Detectando rostros...
✅ Rostros detectados: 1

📊 ANÁLISIS DEL ROSTRO:
   Coordenadas: Top=250, Right=600, Bottom=900, Left=200
   Tamaño rostro: 400×650 px
   Área rostro: 260,000 px²
   Área imagen: 960,000 px²
   📈 PORCENTAJE: 27.08%

✂️ RECORTANDO IMAGEN:
   Coordenadas crop: L=50, T=150, R=750, B=1050
   ✅ Crop: 700×900 px

🔎 ANALIZANDO NITIDEZ:
   Varianza Laplacian (solo rostro): 145.23
   📈 NITIDEZ: ACEPTABLE ✅

📐 Crop redimensionado: 600×600 px

✅ APROBADA
======================================================================
```

**Puntos clave a validar:**
- ✅ Imagen redimensionada a ~800-1200 px
- ✅ % Rostro calculado con imagen redimensionada (no original)
- ✅ Nitidez calculada solo en zona del rostro
- ✅ Crop con coordenadas correctas
- ✅ Tiempo de procesamiento < 2s

---

## 🔧 Comparación v2.0 vs v3.0

| Aspecto | v2.0 (Anterior) | v3.0 (Nuevo) |
|---------|-----------------|--------------|
| **Crop margen lateral** | 50% | 80% (configurable) |
| **Crop margen superior** | 50% | 120% (peinados) |
| **Crop margen inferior** | 50% | 80% (cuello) |
| **Cálculo % rostro** | Imagen original (inconsistente) | Imagen redimensionada (consistente) |
| **Nitidez** | Toda la imagen | Solo zona del rostro |
| **Umbral % rostro** | 15% | 10% |
| **Umbral nitidez** | 50 (global) | 50 (solo rostro), 30 (review) |
| **Fotos aprobadas** | ~40-50% | ~70-75% (objetivo) |
| **Falsos negativos** | ~20% | <5% (objetivo) |
| **Tiempo procesamiento** | 1-2s | 0.8-1.2s |

---

## ⚙️ Configuración Avanzada

### Ajustar Umbrales

Editar `server.py`, sección `VALIDATION_CONFIG`:

```python
VALIDATION_CONFIG = {
    'profile': {
        'min_face_percentage': 10,      # Cambiar aquí
        'min_sharpness': 50,            # Cambiar aquí
        'min_sharpness_review': 30,     # Cambiar aquí
        'crop_margin': 80,              # Cambiar aquí
        'crop_margin_top': 120,         # Cambiar aquí
        'crop_margin_bottom': 80,       # Cambiar aquí
        # ...
    }
}
```

### Configurar Tamaño del Crop

```python
'target_size': 600    # 600×600 px para perfil
'target_size': 800    # 800×600 px para álbum
```

### Configurar Aspect Ratio

```python
'crop_aspect': 'square'    # 1:1 cuadrado
'crop_aspect': 'portrait'  # 3:4 retrato
```

---

## 🐛 Resolución de Problemas

### Problema 1: Crop sigue cortando peinados

**Solución:** Aumentar `crop_margin_top`

```python
'crop_margin_top': 150,  # 150% de margen superior
```

### Problema 2: Muchas fotos van a revisión manual

**Solución:** Bajar umbrales

```python
'min_face_percentage': 8,     # de 10% a 8%
'min_sharpness': 40,          # de 50 a 40
```

### Problema 3: GPU no se detecta

**Verificar TensorFlow:**

```bash
source ~/ml-validator/venv/bin/activate
python -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"
```

**Si no aparece GPU:**

```bash
# Verificar driver NVIDIA
nvidia-smi

# Reinstalar TensorFlow 2.15
pip uninstall -y tensorflow
pip install tensorflow==2.15.0
```

### Problema 4: Error al descargar imagen

**Mensaje:** `UnidentifiedImageError` o `403 Forbidden`

**Solución:** Verificar que la URL sea accesible desde el servidor

```bash
curl -I "https://images.unsplash.com/photo-..."
```

---

## 🚀 Próximos Pasos

### Fase 1 (Completado) ✅
- [x] Crop inteligente mejorado
- [x] Nitidez solo en rostro
- [x] Cálculo % rostro correcto
- [x] Umbrales ajustados

### Fase 2 (Pendiente)
- [ ] Integrar NSFW detection (nsfwjs/nudenet)
- [ ] Integrar OCR para textos/watermarks (pytesseract)
- [ ] Detección de celebridades (face matching)
- [ ] Detección de imágenes generadas por IA

### Fase 3 (Pendiente)
- [ ] Sistema asíncrono con webhooks Supabase
- [ ] Cola de procesamiento (Celery/RQ)
- [ ] Panel de administración para revisión manual
- [ ] Estadísticas y métricas

### Fase 4 (Pendiente)
- [ ] Álbumes de fotos automáticos
- [ ] Guardar original.jpg y cropped.jpg en Supabase Storage
- [ ] Integración con frontend Vercel
- [ ] Notificaciones al usuario

---

## 📝 Notas Importantes

### ⚠️ Limitaciones Actuales

1. **Validaciones faltantes:**
   - NSFW (contenido explícito)
   - OCR (textos, watermarks, números de teléfono)
   - Celebridades
   - IA-generated
   - Género/edad mismatch

2. **Sistema síncrono:**
   - Usuario espera respuesta (1-2s)
   - No hay cola de procesamiento
   - Sin webhooks Supabase

3. **Sin persistencia:**
   - No guarda resultados en BD
   - No guarda imágenes procesadas
   - Sin historial de validaciones

### ✅ Recomendaciones

1. **Probar con 10-20 fotos reales** antes de ajustar umbrales
2. **Documentar casos edge** (fotos con sombrero, lentes oscuros, etc.)
3. **Medir métricas** (% APPROVE, % REJECT, % MANUAL_REVIEW)
4. **Ajustar umbrales** según los resultados

---

## 📧 Soporte

Si encuentras problemas:

1. Revisar logs del servidor (terminal PuTTY)
2. Revisar logs del navegador (F12 → Console)
3. Probar con `/health` endpoint
4. Verificar conectividad: `curl http://192.168.1.159:5000/health`

---

**Última actualización:** 2026-02-26 21:00 UTC  
**Versión:** 3.0  
**Estado:** ✅ Listo para pruebas
