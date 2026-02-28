# 🔧 CAMBIOS EN LA VALIDACIÓN DE ÁLBUMES

## ❌ PROBLEMA ACTUAL
El servidor v3.4 actual valida álbumes igual que perfil (rostros, nitidez, etc.)

---

## ✅ CAMBIOS REQUERIDOS

### **1. Configuración de Álbum (línea ~88-100)**

```python
'album': {
    # ÁLBUM: Solo validar NSFW explícito + OCR vulgar + Armas/Drogas
    'nsfw_enabled': True,
    'nsfw_strict': True,  # Solo rechazar explícito
    'ocr_enabled': True,
    'ocr_vulgar_only': True,  # Solo palabras vulgares + propaganda
    'object_detection_enabled': True,
    'objects_weapons_drugs_only': True,  # Solo armas + drogas
    'auto_delete_weapons_drugs': True,  # Borrar automático
    # NO validar:
    'face_detection_enabled': False,
    'face_matching_enabled': False,
    'ai_detection_enabled': False,
    'quality_check_enabled': False,
    'crop_enabled': False
}
```

---

### **2. Objetos Prohibidos (línea ~105)**

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
        # Solo armas (con borrado automático)
        'knife': {'threshold': 0.6, 'severity': 'high', 'auto_delete': True},
        'scissors': {'threshold': 0.6, 'severity': 'high', 'auto_delete': True}
        # NO validar alcohol (botellas, copas)
    }
}

# Palabras vulgares/obscenas (para álbumes)
VULGAR_WORDS = [
    'puta', 'puto', 'hijo de puta', 'hijoputa', 'coño', 'verga', 'pene', 'polla',
    'tetas', 'culo', 'mierda', 'joder', 'follar', 'chingar', 'mamar', 'chupar',
    'fuck', 'shit', 'bitch', 'asshole', 'dick', 'cock', 'pussy', 'porn', 'sex',
    'xxx', 'nude', 'naked', 'desnudo', 'caliente', 'hot', 'sexy'
]

# Propaganda (otras apps de citas)
PROPAGANDA_DOMAINS = [
    'tinder', 'bumble', 'badoo', 'match', 'okcupid', 'hinge', 'pof',
    'eharmony', 'meetic', 'happn', 'grindr', 'coffee', 'meetme'
]
```

---

### **3. Función check_nsfw() - Añadir parámetro strict_mode**

```python
def check_nsfw(img_array, strict_mode=False):
    """
    Args:
        strict_mode: Si True, solo rechazar explícito (álbumes)
                     Si False, también rechazar cuestionable (perfil)
    """
    # ... código existente ...
    
    # Al final, cambiar la lógica:
    if explicit_detections:
        verdict = 'explicit'
        is_nsfw = True
    elif not strict_mode and len(questionable_detections) >= 2:
        # Modo perfil: rechazar cuestionable
        verdict = 'questionable'
        is_nsfw = False
    else:
        # Modo álbum: permitir cuestionable
        verdict = 'safe'
        is_nsfw = False
```

---

### **4. Función check_text_content() - Añadir parámetro vulgar_only**

```python
def check_text_content(img_array, vulgar_only=False):
    """
    Args:
        vulgar_only: Si True, solo buscar palabras vulgares + propaganda (álbumes)
                     Si False, validación completa (perfil)
    """
    # ... código existente ...
    
    # Cambiar la sección de banned_words:
    if vulgar_only:
        # ÁLBUM: Solo palabras vulgares/obscenas
        banned_words = VULGAR_WORDS
    else:
        # PERFIL: Todas las palabras prohibidas
        banned_words = [
            'link', 'insta', 'instagram', 'telegram', 'venta', 'precio',
            # ... lista actual completa
        ]
    
    # Añadir detección de propaganda:
    has_propaganda = False
    propaganda_domains_found = []
    
    for detection in result:
        # ... código existente ...
        
        # Detectar propaganda de otras apps
        text_lower = text_clean.lower()
        for domain in PROPAGANDA_DOMAINS:
            if domain in text_lower:
                has_propaganda = True
                if domain not in propaganda_domains_found:
                    propaganda_domains_found.append(domain)
    
    # Al final:
    if vulgar_only:
        # Álbum: solo rechazar vulgares + propaganda
        should_reject = has_banned_word or has_propaganda
    else:
        # Perfil: rechazar todo
        should_reject = has_phone or has_url or has_banned_word or too_much_text
```

---

### **5. Función check_prohibited_objects() - Añadir parámetro photo_type**

```python
def check_prohibited_objects(img_array, photo_type='profile'):
    """
    Args:
        photo_type: 'profile' o 'album'
    """
    # ... código existente ...
    
    # Obtener objetos prohibidos según tipo
    prohibited_config = PROHIBITED_OBJECTS.get(photo_type, PROHIBITED_OBJECTS['profile'])
    
    for box in results[0].boxes:
        # ... código existente ...
        
        # Verificar si es objeto prohibido
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
    
    return {
        'has_prohibited': len(prohibited_found) > 0,
        'auto_delete_required': any(p['auto_delete'] for p in prohibited_found),
        'prohibited_objects': prohibited_found,
        'all_objects': detected_objects
    }
```

---

### **6. Función validate_and_crop_photo() - Validación condicional**

```python
def validate_and_crop_photo(photo_url, photo_type='profile', ...):
    config = VALIDATION_CONFIG.get(photo_type, VALIDATION_CONFIG['profile'])
    
    # ... descargar y redimensionar ...
    
    # VALIDACIÓN CONDICIONAL SEGÚN TIPO
    
    if photo_type == 'profile':
        # PERFIL: Todas las validaciones
        # Detectar rostros
        faces = face_recognition.face_locations(img_resized)
        if len(faces) == 0:
            return REJECT("no_face")
        if len(faces) > 1:
            return REJECT("multiple_faces")
        
        # Face Matching
        if config.get('face_matching_enabled'):
            face_match_result = check_face_matching(...)
            if face_match_result.get('should_reject'):
                return REJECT("face_matching_failed")
        
        # AI Detection
        if config.get('ai_detection_enabled'):
            ai_result = check_ai_generated(...)
            if ai_result.get('should_reject'):
                return REJECT("ai_generated")
        
        # NSFW (modo normal)
        nsfw_result = check_nsfw(img_resized, strict_mode=False)
        if nsfw_result['is_nsfw']:
            return REJECT("nsfw_content")
        
        # OCR (validación completa)
        ocr_result = check_text_content(img_resized, vulgar_only=False)
        if ocr_result['should_reject']:
            return REJECT("text_detected")
        
        # Objetos prohibidos (todos)
        obj_result = check_prohibited_objects(img_resized, photo_type='profile')
        if obj_result['has_prohibited']:
            return REJECT("prohibited_objects")
        
        # Calidad (rostro, nitidez, etc.)
        # ... validaciones de calidad ...
        
        # Smart crop
        cropped, crop_coords = smart_crop_face(...)
        
    elif photo_type == 'album':
        # ÁLBUM: Solo NSFW + OCR vulgar + Armas/Drogas
        
        # NSFW (modo estricto: solo explícito)
        nsfw_result = check_nsfw(img_resized, strict_mode=True)
        if nsfw_result['is_nsfw']:  # Solo explícito
            return REJECT("nsfw_explicit")
        
        # OCR (solo palabras vulgares + propaganda)
        ocr_result = check_text_content(img_resized, vulgar_only=True)
        if ocr_result['should_reject']:
            return REJECT("vulgar_content")
        
        # Objetos prohibidos (solo armas/drogas)
        obj_result = check_prohibited_objects(img_resized, photo_type='album')
        if obj_result['has_prohibited']:
            if obj_result['auto_delete_required']:
                # BORRADO AUTOMÁTICO
                return {
                    "verdict": "AUTO_DELETE",
                    "reason": "weapons_drugs",
                    "message": "Foto eliminada automáticamente: armas o drogas detectadas",
                    "object_data": obj_result,
                    "processing_time": round(time.time() - start_time, 2)
                }
            else:
                return REJECT("prohibited_objects")
        
        # NO crop, NO face detection, NO quality checks
        cropped_base64 = None  # No hay imagen recortada
```

---

### **7. Respuesta del servidor**

```python
# Para álbumes, NO devolver cropped_image_base64
if photo_type == 'album':
    return {
        "verdict": "APPROVE",  # o "AUTO_DELETE" para armas/drogas
        "validation_data": {
            "photo_type": "album"
        },
        "nsfw_data": nsfw_result,
        "ocr_data": ocr_result,
        "object_data": obj_result,
        "processing_time": processing_time
        # NO incluir cropped_image_base64
    }
else:
    # Perfil: incluir imagen recortada
    return {
        "verdict": "APPROVE",
        "cropped_image_base64": f"data:image/jpeg;base64,{cropped_base64}",
        # ... resto de datos
    }
```

---

## 📋 RESUMEN DE CAMBIOS

| **Validación** | **Perfil** | **Álbum** |
|----------------|------------|-----------|
| Rostros | ✅ 1 rostro | ❌ NO validar |
| Nitidez | ✅ ≥50 | ❌ NO validar |
| Resolución | ✅ ≥400px | ❌ NO validar |
| NSFW | ✅ Explícito + Cuestionable | ✅ Solo explícito |
| OCR | ✅ Todo | ✅ Solo vulgares + propaganda |
| Objetos | ✅ Todos | ✅ Solo armas (borrado automático) |
| Face Matching | ✅ | ❌ NO validar |
| AI Detection | ✅ | ❌ NO validar |
| Smart Crop | ✅ Recortar | ❌ NO recortar |

---

## 🚨 BORRADO AUTOMÁTICO

**Si detecta armas o drogas en álbum:**
```python
{
    "verdict": "AUTO_DELETE",
    "reason": "weapons_drugs",
    "message": "Foto eliminada automáticamente: armas detectadas",
    "auto_delete": True
}
```

**Webhook Handler debe:**
1. Borrar foto de Supabase Storage
2. Borrar registro de la BD
3. Enviar notificación: "Tu foto fue eliminada automáticamente por contener armas/drogas/violencia"

---

## 📝 NOTAS IMPORTANTES

1. **Álbumes privados:** NO se validan (no llegan al servidor)
2. **Álbumes públicos:** Solo validar NSFW explícito + OCR vulgar + Armas
3. **Rechazo normal:** Usuario tiene 24h para cambiar/eliminar
4. **Armas/Drogas:** Borrado inmediato sin espera

---

¿Necesitas que cree el archivo v3.5 completo con estos cambios aplicados?
