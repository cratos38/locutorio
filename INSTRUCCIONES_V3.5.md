# 🛠️ INSTRUCCIONES PARA ACTUALIZAR A V3.5

##  Estado: El servidor v3.4 que tienes funcionando necesita estos cambios

---

## OPCIÓN 1: Descargar v3.5 completo (RECOMENDADO)

**Cuando esté listo, te daré el enlace de descarga**

---

## OPCIÓN 2: Modificar manualmente (avanzado)

Si prefieres modificar el servidor actual, aquí están los cambios exactos:

### 📝 Cambios en el código

#### 1. Línea ~3: Actualizar versión
```python
"""
ML Photo Validator v3.5 - Álbum Validation Fixed
```

#### 2. Líneas ~86-102: Config de álbum
**REEMPLAZAR:**
```python
'album': {
    'min_face_percentage': 5,
    ...
}
```

**POR:**
```python
'album': {
    'nsfw_enabled': True,
    'nsfw_strict': True,
    'ocr_enabled': True,
    'ocr_vulgar_only': True,
    'object_detection_enabled': True,
    'objects_weapons_drugs_only': True,
    'auto_delete_weapons_drugs': True,
    'face_detection_enabled': False,
    'face_matching_enabled': False,
    'ai_detection_enabled': False,
    'quality_check_enabled': False,
    'crop_enabled': False
}
```

#### 3. Líneas ~106-112: Objetos prohibidos
**REEMPLAZAR:**
```python
PROHIBITED_OBJECTS = {
    'knife': {'threshold': 0.6, 'severity': 'high'},
    ...
}
```

**POR:**
```python
PROHIBITED_OBJECTS = {
    'profile': {
        'knife': {'threshold': 0.6, 'severity': 'high', 'auto_delete': False},
        'scissors': {'threshold': 0.6, 'severity': 'medium', 'auto_delete': False},
        'bottle': {'threshold': 0.7, 'severity': 'medium', 'auto_delete': False},
        'wine glass': {'threshold': 0.7, 'severity': 'medium', 'auto_delete': False},
        'cup': {'threshold': 0.8, 'severity': 'low', 'auto_delete': False}
    },
    'album': {
        'knife': {'threshold': 0.6, 'severity': 'high', 'auto_delete': True},
        'scissors': {'threshold': 0.6, 'severity': 'high', 'auto_delete': True}
    }
}

VULGAR_WORDS = [
    'puta', 'puto', 'hijo de puta', 'hijoputa', 'coño', 'verga', 'pene', 'polla',
    'tetas', 'culo', 'mierda', 'joder', 'follar', 'chingar', 'mamar', 'chupar',
    'fuck', 'shit', 'bitch', 'asshole', 'dick', 'cock', 'pussy', 'porn', 'sex',
    'xxx', 'nude', 'naked', 'desnudo', 'caliente', 'hot', 'sexy'
]

PROPAGANDA_DOMAINS = [
    'tinder', 'bumble', 'badoo', 'match', 'okcupid', 'hinge', 'pof', 'plenty',
    'eharmony', 'meetic', 'happn', 'grindr', 'her', 'coffee', 'meetme'
]
```

#### 4. Función check_nsfw() - Añadir parámetro
**Cambiar definición:**
```python
def check_nsfw(img_array, strict_mode=False):
```

**Cambiar lógica final (línea ~295-303):**
```python
if explicit_detections:
    verdict = 'explicit'
    is_nsfw = True
elif not strict_mode and len(questionable_detections) >= 2:
    verdict = 'questionable'
    is_nsfw = False
else:
    verdict = 'safe'
    is_nsfw = False

return {
    'is_nsfw': is_nsfw,
    'verdict': verdict,
    'confidence': round(max_confidence, 3),
    'explicit_detections': explicit_detections,
    'questionable_detections': questionable_detections,
    'strict_mode': strict_mode
}
```

#### 5. Función check_text_content() - Añadir parámetro
**Cambiar definición:**
```python
def check_text_content(img_array, vulgar_only=False):
```

**Añadir después de los patrones (~línea 350):**
```python
if vulgar_only:
    banned_words = VULGAR_WORDS
else:
    banned_words = [
        'link', 'insta', 'instagram', ...  # lista actual
    ]

# Añadir detección de propaganda
has_propaganda = False
propaganda_domains_found = []

for detection in result:
    # ... código existente ...
    
    # Detectar propaganda
    text_lower = text_clean.lower()
    for domain in PROPAGANDA_DOMAINS:
        if domain in text_lower:
            has_propaganda = True
            if domain not in propaganda_domains_found:
                propaganda_domains_found.append(domain)

# Al final, cambiar lógica de rechazo:
if vulgar_only:
    should_reject = has_banned_word or has_propaganda
else:
    should_reject = has_phone or has_url or has_banned_word or too_much_text
```

#### 6. Función check_prohibited_objects() - Añadir parámetro
**Cambiar definición:**
```python
def check_prohibited_objects(img_array, photo_type='profile'):
```

**Cambiar inicio (~línea 410):**
```python
prohibited_config = PROHIBITED_OBJECTS.get(photo_type, PROHIBITED_OBJECTS['profile'])
```

**Cambiar verificación de objetos (~línea 432):**
```python
if label in prohibited_config:
    config = prohibited_config[label]
    threshold = config['threshold']
    severity = config['severity']
    auto_delete = config.get('auto_delete', False)
    
    if conf >= threshold:
        prohibited_found.append({
            'object': label,
            'confidence': round(conf, 3),
            'severity': severity,
            'auto_delete': auto_delete
        })
```

**Cambiar return (~línea 445):**
```python
return {
    'has_prohibited': len(prohibited_found) > 0,
    'auto_delete_required': any(p['auto_delete'] for p in prohibited_found),
    'prohibited_objects': prohibited_found,
    'all_objects': detected_objects
}
```

#### 7. Función validate_and_crop_photo() - Validación condicional

**ESTE ES EL CAMBIO MÁS GRANDE**

Busca la línea que dice:
```python
print("🔍 VALIDANDO FOTO v3.X: {photo_type.upper()}")
```

**REEMPLAZAR TODO EL CÓDIGO DE VALIDACIÓN** con lógica condicional:

```python
if photo_type == 'profile':
    # PERFIL: Todas las validaciones (código actual)
    
elif photo_type == 'album':
    # ÁLBUM: Solo NSFW + OCR vulgar + Armas
    
    print("\n🔞 ANALIZANDO CONTENIDO NSFW:")
    nsfw_result = check_nsfw(img_resized, strict_mode=True)
    print(f"   Veredicto: {nsfw_result['verdict'].upper()}")
    
    if nsfw_result['is_nsfw']:
        print(f"❌ RECHAZADA: Contenido explícito")
        return {
            "verdict": "REJECT",
            "reason": "nsfw_explicit",
            "message": "Contenido explícito detectado",
            "nsfw_data": nsfw_result,
            "processing_time": round(time.time() - start_time, 2)
        }
    
    print("\n📝 ANALIZANDO TEXTO (OCR - VULGAR):")
    ocr_result = check_text_content(img_resized, vulgar_only=True)
    
    if ocr_result['should_reject']:
        print(f"❌ RECHAZADA: {ocr_result['reject_reason']}")
        return {
            "verdict": "REJECT",
            "reason": "vulgar_content",
            "message": f"Contenido inapropiado: {ocr_result['reject_reason']}",
            "ocr_data": ocr_result,
            "processing_time": round(time.time() - start_time, 2)
        }
    
    print("\n🔍 DETECTANDO OBJETOS:")
    obj_result = check_prohibited_objects(img_resized, photo_type='album')
    
    if obj_result['has_prohibited']:
        if obj_result['auto_delete_required']:
            print(f"❌ BORRADO AUTOMÁTICO: Armas/Drogas detectadas")
            return {
                "verdict": "AUTO_DELETE",
                "reason": "weapons_drugs",
                "message": "Foto eliminada automáticamente: armas o drogas detectadas",
                "object_data": obj_result,
                "processing_time": round(time.time() - start_time, 2)
            }
    
    # Álbum aprobado (sin crop)
    print("\n✅ APROBADA")
    return {
        "verdict": "APPROVE",
        "validation_data": {
            "photo_type": "album"
        },
        "nsfw_data": nsfw_result,
        "ocr_data": ocr_result,
        "object_data": obj_result,
        "processing_time": round(time.time() - start_time, 2)
    }
```

---

## ⚠️ IMPORTANTE

Estos cambios son complejos. **Te recomiendo esperar a que yo cree el archivo v3.5 completo** y lo subas directamente.

¿Quieres que siga creando el archivo v3.5 completo?  
**Responde "SÍ" para que lo cree completo.**
