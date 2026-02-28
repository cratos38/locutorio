# Plan de Mejoras: Sistema de Validación de Fotos

**Fecha:** 2026-02-26  
**Estado:** En desarrollo

## 🎯 Problemas Identificados

### 1. **Crop Inteligente Deficiente**
- ❌ Corta peinados y parte superior de la cabeza
- ❌ No centra bien el rostro
- ❌ El margen es insuficiente o mal calculado

**Ejemplos:**
- Foto de hombre: se corta el peinado superior
- Fotos con cabello voluminoso: se pierde parte del estilo

### 2. **Detección de Nitidez Demasiado Estricta**
- ❌ Rechaza fotos donde el cuerpo está borroso pero la cara está nítida
- ❌ Usa Laplacian variance sobre toda la imagen en lugar de solo el rostro
- ❌ No distingue entre blur en zona importante (cara) vs zona irrelevante (fondo/cuerpo)

### 3. **Porcentaje de Rostro Mal Calculado**
- ❌ Usa imagen completa en lugar de imagen redimensionada
- ❌ Valores muy bajos para fotos que deberían ser aceptables

---

## 🔧 Soluciones Propuestas

### **Solución 1: Mejorar el Crop Inteligente**

#### **Cambios en `smart_crop_face()`:**

```python
def smart_crop_face(img, face_location, margin_percent=80, aspect_ratio='square'):
    """
    Recorta inteligentemente alrededor del rostro con márgenes generosos
    
    Args:
        img: imagen numpy array
        face_location: (top, right, bottom, left) de face_recognition
        margin_percent: porcentaje de margen extra (default: 80%)
        aspect_ratio: 'square' (1:1) o 'portrait' (3:4)
    
    Returns:
        cropped_img: imagen recortada
        crop_coords: diccionario con coordenadas del crop
    """
    height, width = img.shape[:2]
    top, right, bottom, left = face_location
    
    face_width = right - left
    face_height = bottom - top
    face_center_x = left + (face_width // 2)
    face_center_y = top + (face_height // 2)
    
    # Margen generoso para incluir peinado y hombros
    margin_x = int(face_width * (margin_percent / 100))
    margin_y_top = int(face_height * 1.2)  # 120% arriba para peinados altos
    margin_y_bottom = int(face_height * 0.8)  # 80% abajo para cuello/hombros
    
    # Calcular límites del crop
    crop_left = max(0, face_center_x - (face_width // 2) - margin_x)
    crop_right = min(width, face_center_x + (face_width // 2) + margin_x)
    crop_top = max(0, top - margin_y_top)  # Más espacio arriba
    crop_bottom = min(height, bottom + margin_y_bottom)
    
    # Ajustar para mantener aspect ratio
    crop_width = crop_right - crop_left
    crop_height = crop_bottom - crop_top
    
    if aspect_ratio == 'square':
        target_ratio = 1.0
    elif aspect_ratio == 'portrait':
        target_ratio = 3.0 / 4.0  # ancho/alto
    else:
        target_ratio = crop_width / crop_height
    
    current_ratio = crop_width / crop_height
    
    if current_ratio > target_ratio:
        # Demasiado ancho, aumentar altura
        target_height = int(crop_width / target_ratio)
        diff = target_height - crop_height
        crop_top = max(0, crop_top - diff // 2)
        crop_bottom = min(height, crop_bottom + diff // 2)
    else:
        # Demasiado alto, aumentar ancho
        target_width = int(crop_height * target_ratio)
        diff = target_width - crop_width
        crop_left = max(0, crop_left - diff // 2)
        crop_right = min(width, crop_right + diff // 2)
    
    # Extraer el crop
    cropped = img[crop_top:crop_bottom, crop_left:crop_right]
    
    crop_coords = {
        'left': int(crop_left),
        'top': int(crop_top),
        'right': int(crop_right),
        'bottom': int(crop_bottom),
        'width': int(crop_right - crop_left),
        'height': int(crop_bottom - crop_top)
    }
    
    return cropped, crop_coords
```

**Mejoras:**
- ✅ Margen superior 120% (vs 50%) para peinados altos
- ✅ Margen inferior 80% para incluir cuello/hombros
- ✅ Margen lateral 80% (configurable)
- ✅ Centrado basado en centro del rostro, no en esquinas
- ✅ Soporte para aspect ratio cuadrado (1:1) o retrato (3:4)

---

### **Solución 2: Nitidez Solo en Zona del Rostro**

#### **Nueva función `calculate_face_sharpness()`:**

```python
def calculate_face_sharpness(img, face_location, expand_factor=1.3):
    """
    Calcula la nitidez SOLO en la zona del rostro, ignorando fondo/cuerpo
    
    Args:
        img: imagen numpy array (RGB)
        face_location: (top, right, bottom, left)
        expand_factor: factor de expansión de la zona (default: 1.3 = 30% extra)
    
    Returns:
        sharpness: valor de varianza de Laplacian (>100 = nítido, 50-100 = aceptable, <50 = borroso)
    """
    height, width = img.shape[:2]
    top, right, bottom, left = face_location
    
    face_width = right - left
    face_height = bottom - top
    
    # Expandir la zona un poco (para incluir bordes del rostro)
    margin_x = int(face_width * ((expand_factor - 1.0) / 2))
    margin_y = int(face_height * ((expand_factor - 1.0) / 2))
    
    roi_left = max(0, left - margin_x)
    roi_right = min(width, right + margin_x)
    roi_top = max(0, top - margin_y)
    roi_bottom = min(height, bottom + margin_y)
    
    # Extraer ROI (región de interés)
    face_roi = img[roi_top:roi_bottom, roi_left:roi_right]
    
    # Convertir a escala de grises si es necesario
    if len(face_roi.shape) == 3:
        face_gray = cv2.cvtColor(face_roi, cv2.COLOR_RGB2GRAY)
    else:
        face_gray = face_roi
    
    # Calcular Laplacian variance SOLO en el rostro
    laplacian_var = cv2.Laplacian(face_gray, cv2.CV_64F).var()
    
    return laplacian_var
```

**Mejoras:**
- ✅ Mide nitidez SOLO en la cara (+ 30% margen)
- ✅ Ignora blur en cuerpo/fondo
- ✅ Más preciso para fotos con profundidad de campo

**Umbrales ajustados:**
- `sharpness > 100` → APPROVE (muy nítido)
- `50 < sharpness <= 100` → APPROVE (aceptable)
- `30 < sharpness <= 50` → MANUAL_REVIEW (poco nítido)
- `sharpness <= 30` → REJECT (muy borroso)

---

### **Solución 3: Redimensionar Antes de Calcular Porcentaje**

#### **Flujo correcto:**

```python
def validate_and_crop_photo(photo_url, photo_type='profile'):
    # 1. Descargar imagen original (cualquier tamaño)
    img_original = download_image(photo_url)
    
    # 2. Redimensionar a tamaño estándar (ej: max 1200px)
    img_resized = resize_image(img_original, max_size=1200)
    
    # 3. Detectar rostros EN LA IMAGEN REDIMENSIONADA
    faces = face_recognition.face_locations(img_resized)
    
    # 4. Calcular porcentaje con imagen redimensionada
    face_area = (bottom - top) * (right - left)
    img_area = img_resized.shape[0] * img_resized.shape[1]  # ← imagen redimensionada
    face_percentage = (face_area / img_area) * 100
    
    # 5. Crop inteligente
    cropped, crop_coords = smart_crop_face(img_resized, faces[0], margin_percent=80)
    
    # 6. Calcular nitidez SOLO en rostro
    sharpness = calculate_face_sharpness(img_resized, faces[0])
    
    # 7. Validar
    if face_percentage < 5:
        return REJECT("rostro muy pequeño")
    if sharpness < 30:
        return REJECT("foto muy borrosa")
    if sharpness < 50:
        return MANUAL_REVIEW("nitidez baja")
    if face_percentage < 10:
        return MANUAL_REVIEW("rostro pequeño")
    
    return APPROVE(cropped, validation_data)
```

**Mejoras:**
- ✅ Redimensionar primero a tamaño consistente (ej: 1200px max)
- ✅ Calcular % de rostro con imagen redimensionada
- ✅ Resultados consistentes sin importar tamaño original
- ✅ Más rápido (imágenes pequeñas = menos cómputo)

---

### **Solución 4: Función Auxiliar de Redimensionamiento**

```python
def resize_image(img, max_size=1200):
    """
    Redimensiona imagen manteniendo aspect ratio
    
    Args:
        img: numpy array de la imagen
        max_size: tamaño máximo del lado más largo
    
    Returns:
        imagen redimensionada
    """
    height, width = img.shape[:2]
    
    if height <= max_size and width <= max_size:
        return img  # No necesita redimensionar
    
    # Calcular nuevo tamaño manteniendo aspect ratio
    if height > width:
        new_height = max_size
        new_width = int(width * (max_size / height))
    else:
        new_width = max_size
        new_height = int(height * (max_size / width))
    
    # Redimensionar con LANCZOS (mejor calidad)
    img_pil = Image.fromarray(img)
    img_pil = img_pil.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    return np.array(img_pil)
```

---

## 📊 Tabla de Umbrales Finales

| Métrica | REJECT | MANUAL_REVIEW | APPROVE |
|---------|--------|---------------|---------|
| **% Rostro** | < 5% | 5% - 10% | > 10% |
| **Nitidez (solo rostro)** | < 30 | 30 - 50 | > 50 |
| **Resolución crop** | < 300px | 300px - 400px | > 400px |
| **Número de rostros (perfil)** | 0 o >1 | - | 1 |
| **Número de rostros (álbum)** | 0 | >5 | 1-5 |

---

## 🔄 Flujo de Validación Completo (v3.0)

```
1. Usuario sube foto
   ↓
2. Descargar imagen original (cualquier tamaño)
   ↓
3. Redimensionar a max 1200px (mantener aspect ratio)
   ↓
4. Detectar rostros con face_recognition
   ↓
5. Validar número de rostros
   - Perfil: 0 o >1 → REJECT
   - Álbum: 0 → REJECT, >5 → MANUAL_REVIEW
   ↓
6. Calcular % de rostro (con imagen redimensionada)
   - < 5% → REJECT
   - 5-10% → MANUAL_REVIEW
   - > 10% → continuar
   ↓
7. Crop inteligente (margen 80%, más espacio arriba)
   ↓
8. Validar resolución del crop
   - < 300px → REJECT
   - 300-400px → MANUAL_REVIEW
   - > 400px → continuar
   ↓
9. Calcular nitidez SOLO en zona del rostro
   - < 30 → REJECT
   - 30-50 → MANUAL_REVIEW
   - > 50 → continuar
   ↓
10. APPROVE
    - Guardar original.jpg (para álbum)
    - Guardar cropped.jpg (para perfil)
    - Devolver base64 de ambas
```

---

## ⚡ Optimizaciones Adicionales

### **1. Cache de Resultados**
- Evitar procesar la misma foto varias veces
- Guardar hash MD5 de la foto + resultado

### **2. Batch Processing**
- Procesar múltiples fotos en paralelo (GPU)
- Cola de procesamiento con Celery/RQ

### **3. Detección Progresiva**
- Primera pasada: detección rápida (low quality)
- Segunda pasada: validación completa (high quality)
- Rechazar rápido si primera pasada falla

### **4. Configuración por Tipo de Foto**

```python
VALIDATION_CONFIG = {
    'profile': {
        'min_face_percentage': 10,
        'min_sharpness': 50,
        'min_resolution': 400,
        'max_faces': 1,
        'crop_margin': 80,
        'crop_aspect': 'square'  # 1:1
    },
    'album': {
        'min_face_percentage': 5,
        'min_sharpness': 40,
        'min_resolution': 300,
        'max_faces': 5,
        'crop_margin': 50,
        'crop_aspect': 'portrait'  # 3:4
    }
}
```

---

## 🧪 Testing

### **Casos de Prueba:**

1. **Selfie cercano** (≥30% rostro)
   - ✅ APPROVE
   - ✅ Crop incluye toda la cabeza + cuello

2. **Retrato medio** (15-25% rostro)
   - ✅ APPROVE
   - ✅ Crop centrado correctamente

3. **Foto de cuerpo completo** (5-10% rostro)
   - ⚠️ MANUAL_REVIEW
   - ✅ Crop incluye toda la cabeza

4. **Foto grupal** (múltiples rostros)
   - ❌ REJECT (perfil)
   - ⚠️ MANUAL_REVIEW si >5 (álbum)

5. **Foto con fondo borroso, cara nítida**
   - ✅ APPROVE
   - ✅ Nitidez medida solo en rostro

6. **Foto con peinado alto/voluminoso**
   - ✅ APPROVE
   - ✅ Crop con margen superior 120%

---

## 📋 Checklist de Implementación

- [ ] Actualizar `smart_crop_face()` con márgenes mejorados
- [ ] Implementar `calculate_face_sharpness()` (solo ROI)
- [ ] Implementar `resize_image()` antes de detección
- [ ] Ajustar umbrales de validación
- [ ] Actualizar `validate_and_crop_photo()` con nuevo flujo
- [ ] Agregar logs detallados (dimensiones, coordenadas, métricas)
- [ ] Probar con 10+ fotos reales
- [ ] Documentar ejemplos antes/después
- [ ] Crear configuración por tipo de foto

---

## 🎯 Métricas Esperadas (v3.0)

| Métrica | v2.0 (actual) | v3.0 (objetivo) |
|---------|---------------|------------------|
| **APPROVE automático** | 40-50% | 70-75% |
| **MANUAL_REVIEW** | 30-40% | 15-20% |
| **REJECT** | 15-20% | 10-15% |
| **Falsos negativos** | ~20% | < 5% |
| **Tiempo procesamiento** | 1-2s | 0.8-1.2s |

---

## 🚀 Próximos Pasos

1. ✅ **Implementar mejoras en `server.py`** (este documento)
2. ⏳ **Testing exhaustivo** con fotos reales
3. ⏳ **Ajustar umbrales** según resultados
4. ⏳ **Integrar NSFW/OCR/Celebridades** (Fase 2)
5. ⏳ **Sistema asíncrono** con webhooks Supabase (Fase 3)

---

**Última actualización:** 2026-02-26 20:30 UTC
