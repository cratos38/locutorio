#!/usr/bin/env python3
"""
ML Photo Validator v3.0 - Smart Crop & Face-Only Sharpness
===========================================================

Mejoras implementadas:
- ✅ Crop inteligente con márgenes generosos (80%)
- ✅ Margen superior 120% para peinados altos
- ✅ Nitidez medida SOLO en zona del rostro (ignora fondo/cuerpo)
- ✅ Redimensionamiento antes de calcular % de rostro
- ✅ Umbrales ajustados y configurables por tipo de foto

Servidor: 192.168.1.159:5000
"""

from flask import Flask, request, jsonify
import face_recognition
import cv2
import numpy as np
import traceback
import time
from PIL import Image
import requests
from io import BytesIO
import base64
import hashlib

app = Flask(__name__)

# ============================================================================
# CONFIGURACIÓN POR TIPO DE FOTO
# ============================================================================

VALIDATION_CONFIG = {
    'profile': {
        'min_face_percentage': 10,          # 10% mínimo (vs 15% anterior)
        'min_sharpness': 50,                # Nitidez solo en rostro
        'min_sharpness_review': 30,         # Umbral para revisión manual
        'min_resolution': 400,              # Resolución mínima del crop
        'max_faces': 1,                     # Solo 1 rostro para perfil
        'crop_margin': 80,                  # Margen lateral 80%
        'crop_margin_top': 120,             # Margen superior 120% (peinados)
        'crop_margin_bottom': 80,           # Margen inferior 80% (cuello)
        'crop_aspect': 'square',            # 1:1 para perfil
        'target_size': 600                  # Redimensionar crop a 600x600
    },
    'album': {
        'min_face_percentage': 5,
        'min_sharpness': 40,
        'min_sharpness_review': 25,
        'min_resolution': 300,
        'max_faces': 5,
        'crop_margin': 50,
        'crop_margin_top': 80,
        'crop_margin_bottom': 80,
        'crop_aspect': 'portrait',          # 3:4 para álbum
        'target_size': 800
    }
}

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

def resize_image(img, max_size=1200):
    """
    Redimensiona imagen manteniendo aspect ratio
    
    Args:
        img: numpy array de la imagen
        max_size: tamaño máximo del lado más largo
    
    Returns:
        imagen redimensionada como numpy array
    """
    height, width = img.shape[:2]
    
    # Si ya es pequeña, no redimensionar
    if height <= max_size and width <= max_size:
        return img
    
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


def download_image(url):
    """
    Descarga imagen desde URL
    
    Args:
        url: URL de la imagen
    
    Returns:
        numpy array RGB de la imagen original (sin redimensionar)
    """
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    
    img = Image.open(BytesIO(response.content))
    
    # Convertir a RGB si es necesario
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    return np.array(img)


def calculate_face_sharpness(img, face_location, expand_factor=1.3):
    """
    Calcula la nitidez SOLO en la zona del rostro, ignorando fondo/cuerpo
    
    Args:
        img: imagen numpy array (RGB)
        face_location: (top, right, bottom, left) de face_recognition
        expand_factor: factor de expansión de la zona (default: 1.3 = 30% extra)
    
    Returns:
        sharpness: valor de varianza de Laplacian
                  > 100 = muy nítido
                  50-100 = aceptable
                  30-50 = poco nítido
                  < 30 = muy borroso
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
    
    # Convertir a escala de grises
    face_gray = cv2.cvtColor(face_roi, cv2.COLOR_RGB2GRAY)
    
    # Calcular Laplacian variance SOLO en el rostro
    laplacian_var = cv2.Laplacian(face_gray, cv2.CV_64F).var()
    
    return laplacian_var


def smart_crop_face(img, face_location, config):
    """
    Recorta inteligentemente alrededor del rostro con márgenes generosos
    
    Args:
        img: imagen numpy array
        face_location: (top, right, bottom, left) de face_recognition
        config: diccionario de configuración (VALIDATION_CONFIG)
    
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
    
    # Márgenes configurables por tipo de foto
    margin_percent = config['crop_margin']
    margin_top_percent = config['crop_margin_top']
    margin_bottom_percent = config['crop_margin_bottom']
    
    # Calcular márgenes
    margin_x = int(face_width * (margin_percent / 100))
    margin_y_top = int(face_height * (margin_top_percent / 100))      # Más arriba para peinados
    margin_y_bottom = int(face_height * (margin_bottom_percent / 100))  # Menos abajo
    
    # Calcular límites del crop centrado en el rostro
    crop_left = max(0, face_center_x - (face_width // 2) - margin_x)
    crop_right = min(width, face_center_x + (face_width // 2) + margin_x)
    crop_top = max(0, top - margin_y_top)
    crop_bottom = min(height, bottom + margin_y_bottom)
    
    # Ajustar para mantener aspect ratio
    crop_width = crop_right - crop_left
    crop_height = crop_bottom - crop_top
    
    aspect_ratio = config['crop_aspect']
    
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
        crop_bottom = min(height, crop_bottom + (diff - diff // 2))
    else:
        # Demasiado alto, aumentar ancho
        target_width = int(crop_height * target_ratio)
        diff = target_width - crop_width
        crop_left = max(0, crop_left - diff // 2)
        crop_right = min(width, crop_right + (diff - diff // 2))
    
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


# ============================================================================
# FUNCIÓN PRINCIPAL DE VALIDACIÓN
# ============================================================================

def validate_and_crop_photo(photo_url, photo_type='profile', user_gender=None, user_age=None):
    """
    Valida y recorta una foto de perfil/álbum
    
    Flujo:
    1. Descargar imagen original
    2. Redimensionar a max 1200px para consistencia
    3. Detectar rostros
    4. Calcular % de rostro (con imagen redimensionada)
    5. Crop inteligente (márgenes generosos)
    6. Calcular nitidez SOLO en zona del rostro
    7. Validar resolución del crop
    8. Devolver resultado + cropped image
    
    Args:
        photo_url: URL de la foto a validar
        photo_type: 'profile' o 'album'
        user_gender: género del usuario (para validación futura)
        user_age: edad del usuario (para validación futura)
    
    Returns:
        dict con verdict, cropped_image_base64, validation_data, etc.
    """
    start_time = time.time()
    
    try:
        # Obtener configuración para el tipo de foto
        config = VALIDATION_CONFIG.get(photo_type, VALIDATION_CONFIG['profile'])
        
        print("\n" + "="*70)
        print(f"🔍 VALIDANDO FOTO: {photo_type.upper()}")
        print(f"📍 URL: {photo_url[:80]}...")
        print("="*70)
        
        # =====================================================================
        # 1. DESCARGAR IMAGEN ORIGINAL
        # =====================================================================
        print("📥 Descargando imagen...")
        img_original = download_image(photo_url)
        print(f"✅ Imagen descargada: {img_original.shape[1]}×{img_original.shape[0]} px")
        
        # =====================================================================
        # 2. REDIMENSIONAR A TAMAÑO CONSISTENTE (max 1200px)
        # =====================================================================
        print("📐 Redimensionando imagen...")
        img_resized = resize_image(img_original, max_size=1200)
        print(f"✅ Imagen redimensionada: {img_resized.shape[1]}×{img_resized.shape[0]} px")
        
        # =====================================================================
        # 3. DETECTAR ROSTROS
        # =====================================================================
        print("🔍 Detectando rostros...")
        faces = face_recognition.face_locations(img_resized)
        num_faces = len(faces)
        print(f"✅ Rostros detectados: {num_faces}")
        
        if num_faces == 0:
            print("❌ RECHAZADA: Sin rostros")
            return {
                "verdict": "REJECT",
                "reason": "no_face",
                "message": "No se detectó ningún rostro en la foto",
                "processing_time": round(time.time() - start_time, 2)
            }
        
        # Validar número de rostros según tipo de foto
        if photo_type == 'profile' and num_faces > config['max_faces']:
            print(f"❌ RECHAZADA: {num_faces} rostros (máximo {config['max_faces']} para perfil)")
            return {
                "verdict": "REJECT",
                "reason": "multiple_faces",
                "message": f"Se detectaron {num_faces} rostros. Las fotos de perfil deben tener solo una persona",
                "processing_time": round(time.time() - start_time, 2)
            }
        
        if photo_type == 'album' and num_faces > config['max_faces']:
            print(f"⚠️ REVISIÓN MANUAL: {num_faces} rostros (máximo {config['max_faces']} para álbum)")
            return {
                "verdict": "MANUAL_REVIEW",
                "reason": "too_many_faces",
                "message": f"Se detectaron {num_faces} rostros. Requiere revisión manual",
                "processing_time": round(time.time() - start_time, 2)
            }
        
        # =====================================================================
        # 4. CALCULAR % DE ROSTRO (con imagen redimensionada)
        # =====================================================================
        top, right, bottom, left = faces[0]
        
        print("\n📊 ANÁLISIS DEL ROSTRO:")
        print(f"   Coordenadas: Top={top}, Right={right}, Bottom={bottom}, Left={left}")
        print(f"   Tamaño rostro: {right-left}×{bottom-top} px")
        
        face_area = (bottom - top) * (right - left)
        img_area = img_resized.shape[0] * img_resized.shape[1]
        face_percentage = (face_area / img_area) * 100
        
        print(f"   Área rostro: {face_area:,} px²")
        print(f"   Área imagen: {img_area:,} px²")
        print(f"   📈 PORCENTAJE: {face_percentage:.2f}%")
        
        # Validar porcentaje mínimo
        if face_percentage < 5:
            print("❌ RECHAZADA: Rostro muy pequeño (<5%)")
            return {
                "verdict": "REJECT",
                "reason": "face_too_small",
                "message": f"El rostro ocupa solo {face_percentage:.1f}% de la foto. Debe ocupar al menos 5%",
                "processing_time": round(time.time() - start_time, 2)
            }
        
        if face_percentage < config['min_face_percentage']:
            print(f"⚠️ REVISIÓN MANUAL: Rostro pequeño ({face_percentage:.1f}% < {config['min_face_percentage']}%)")
            # No retornar aún, continuar con crop y nitidez
        
        # =====================================================================
        # 5. CROP INTELIGENTE
        # =====================================================================
        print("\n✂️ RECORTANDO IMAGEN:")
        cropped, crop_coords = smart_crop_face(img_resized, faces[0], config)
        print(f"   Coordenadas crop: L={crop_coords['left']}, T={crop_coords['top']}, "
              f"R={crop_coords['right']}, B={crop_coords['bottom']}")
        print(f"   ✅ Crop: {crop_coords['width']}×{crop_coords['height']} px")
        
        # =====================================================================
        # 6. VALIDAR RESOLUCIÓN DEL CROP
        # =====================================================================
        crop_width = crop_coords['width']
        crop_height = crop_coords['height']
        min_resolution = config['min_resolution']
        
        if crop_width < min_resolution or crop_height < min_resolution:
            print(f"❌ RECHAZADA: Resolución muy baja ({crop_width}×{crop_height} < {min_resolution})")
            return {
                "verdict": "REJECT",
                "reason": "low_resolution",
                "message": f"Resolución muy baja después del recorte ({crop_width}×{crop_height}). "
                          f"Mínimo requerido: {min_resolution}×{min_resolution} px",
                "processing_time": round(time.time() - start_time, 2)
            }
        
        # =====================================================================
        # 7. CALCULAR NITIDEZ SOLO EN ZONA DEL ROSTRO
        # =====================================================================
        print("\n🔎 ANALIZANDO NITIDEZ:")
        sharpness = calculate_face_sharpness(img_resized, faces[0])
        print(f"   Varianza Laplacian (solo rostro): {sharpness:.2f}")
        
        if sharpness > 100:
            sharpness_label = "MUY NÍTIDA ✨"
        elif sharpness > config['min_sharpness']:
            sharpness_label = "ACEPTABLE ✅"
        elif sharpness > config['min_sharpness_review']:
            sharpness_label = "POCO NÍTIDA ⚠️"
        else:
            sharpness_label = "MUY BORROSA ❌"
        
        print(f"   📈 NITIDEZ: {sharpness_label}")
        
        if sharpness < config['min_sharpness_review']:
            print(f"❌ RECHAZADA: Foto muy borrosa (nitidez {sharpness:.1f} < {config['min_sharpness_review']})")
            return {
                "verdict": "REJECT",
                "reason": "blurry",
                "message": f"La foto está muy borrosa (nitidez: {sharpness:.1f}). Debe ser al menos {config['min_sharpness_review']}",
                "processing_time": round(time.time() - start_time, 2)
            }
        
        if sharpness < config['min_sharpness']:
            print(f"⚠️ REVISIÓN MANUAL: Nitidez baja ({sharpness:.1f} < {config['min_sharpness']})")
            # Continuar, pero marcar para revisión manual
        
        # =====================================================================
        # 8. REDIMENSIONAR CROP AL TAMAÑO OBJETIVO
        # =====================================================================
        target_size = config['target_size']
        cropped_resized = resize_image(cropped, max_size=target_size)
        print(f"\n📐 Crop redimensionado: {cropped_resized.shape[1]}×{cropped_resized.shape[0]} px")
        
        # =====================================================================
        # 9. CONVERTIR A BASE64
        # =====================================================================
        cropped_pil = Image.fromarray(cropped_resized)
        buffer = BytesIO()
        cropped_pil.save(buffer, format='JPEG', quality=90)
        cropped_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        # =====================================================================
        # 10. DETERMINAR VEREDICTO FINAL
        # =====================================================================
        processing_time = round(time.time() - start_time, 2)
        
        # Si nitidez o % rostro están en zona de revisión manual
        if (sharpness < config['min_sharpness'] or 
            face_percentage < config['min_face_percentage']):
            
            reasons = []
            if sharpness < config['min_sharpness']:
                reasons.append(f"nitidez baja ({sharpness:.1f})")
            if face_percentage < config['min_face_percentage']:
                reasons.append(f"rostro pequeño ({face_percentage:.1f}%)")
            
            print(f"\n⚠️ REVISIÓN MANUAL: {', '.join(reasons)}")
            print("="*70 + "\n")
            
            return {
                "verdict": "MANUAL_REVIEW",
                "reason": "quality_review",
                "message": f"Requiere revisión manual: {', '.join(reasons)}",
                "cropped_image_base64": f"data:image/jpeg;base64,{cropped_base64}",
                "original_size": f"{img_original.shape[1]}×{img_original.shape[0]}",
                "resized_size": f"{img_resized.shape[1]}×{img_resized.shape[0]}",
                "cropped_size": f"{cropped_resized.shape[1]}×{cropped_resized.shape[0]}",
                "crop_coords": crop_coords,
                "validation_data": {
                    "faces_detected": num_faces,
                    "face_percentage": round(face_percentage, 2),
                    "sharpness": round(sharpness, 2),
                    "resolution": f"{img_resized.shape[1]}×{img_resized.shape[0]}"
                },
                "processing_time": processing_time
            }
        
        # APROBADA
        print("\n✅ APROBADA")
        print("="*70 + "\n")
        
        return {
            "verdict": "APPROVE",
            "cropped_image_base64": f"data:image/jpeg;base64,{cropped_base64}",
            "original_size": f"{img_original.shape[1]}×{img_original.shape[0]}",
            "resized_size": f"{img_resized.shape[1]}×{img_resized.shape[0]}",
            "cropped_size": f"{cropped_resized.shape[1]}×{cropped_resized.shape[0]}",
            "crop_coords": crop_coords,
            "validation_data": {
                "faces_detected": num_faces,
                "face_percentage": round(face_percentage, 2),
                "sharpness": round(sharpness, 2),
                "resolution": f"{img_resized.shape[1]}×{img_resized.shape[0]}"
            },
            "processing_time": processing_time
        }
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print(traceback.format_exc())
        print("="*70 + "\n")
        
        return {
            "verdict": "ERROR",
            "reason": "processing_error",
            "message": str(e),
            "traceback": traceback.format_exc(),
            "processing_time": round(time.time() - start_time, 2)
        }


# ============================================================================
# RUTAS DE LA API
# ============================================================================

@app.route('/test.html', methods=['GET'])
def test_page():
    """Sirve la página HTML de prueba"""
    try:
        with open('test.html', 'r') as f:
            return f.read()
    except FileNotFoundError:
        return jsonify({"error": "test.html no encontrado"}), 404


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    import tensorflow as tf
    
    gpu_available = len(tf.config.list_physical_devices('GPU')) > 0
    
    return jsonify({
        "status": "ok",
        "service": "ml-validator",
        "version": "3.0",
        "gpu_enabled": gpu_available,
        "tensorflow_version": tf.__version__,
        "features": {
            "smart_crop": True,
            "face_only_sharpness": True,
            "adaptive_thresholds": True,
            "profile_validation": True,
            "album_validation": True
        }
    })


@app.route('/validate', methods=['POST'])
def validate():
    """
    Endpoint principal de validación
    
    Body JSON:
    {
        "photoUrl": "https://...",
        "type": "profile" | "album",  // opcional, default "profile"
        "userGender": "male" | "female",  // opcional
        "userAge": 25  // opcional
    }
    
    Response:
    {
        "verdict": "APPROVE" | "REJECT" | "MANUAL_REVIEW" | "ERROR",
        "cropped_image_base64": "data:image/jpeg;base64,...",  // si APPROVE/MANUAL_REVIEW
        "validation_data": {...},
        "processing_time": 1.23
    }
    """
    data = request.get_json()
    
    if not data or 'photoUrl' not in data:
        return jsonify({"error": "photoUrl requerido en el body JSON"}), 400
    
    photo_url = data['photoUrl']
    photo_type = data.get('type', 'profile')
    user_gender = data.get('userGender')
    user_age = data.get('userAge')
    
    result = validate_and_crop_photo(photo_url, photo_type, user_gender, user_age)
    
    return jsonify(result)


# ============================================================================
# INICIO DEL SERVIDOR
# ============================================================================

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🚀 ML VALIDATOR v3.0 - SMART CROP & FACE-ONLY SHARPNESS")
    print("="*70)
    print("\n📍 ENDPOINTS:")
    print("   • Health:   GET  http://192.168.1.159:5000/health")
    print("   • Validate: POST http://192.168.1.159:5000/validate")
    print("   • Test UI:  GET  http://192.168.1.159:5000/test.html")
    print("\n⚙️ CONFIGURACIÓN:")
    print("   • Profile:  min_face=10%, min_sharpness=50, crop_margin=80%")
    print("   • Album:    min_face=5%,  min_sharpness=40, crop_margin=50%")
    
    import tensorflow as tf
    gpus = tf.config.list_physical_devices('GPU')
    
    if gpus:
        print(f"\n⚡ GPU HABILITADA: {len(gpus)} dispositivo(s)")
        for gpu in gpus:
            print(f"   • {gpu.name}")
    else:
        print("\n⚠️ CPU MODE (GPU no detectada)")
    
    print("\n" + "="*70)
    print("🎯 MEJORAS v3.0:")
    print("   ✅ Crop inteligente con márgenes generosos")
    print("   ✅ Margen superior 120% para peinados altos")
    print("   ✅ Nitidez medida SOLO en zona del rostro")
    print("   ✅ Redimensionamiento antes de calcular % rostro")
    print("   ✅ Umbrales ajustados por tipo de foto")
    print("="*70 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
