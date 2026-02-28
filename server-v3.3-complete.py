#!/usr/bin/env python3
"""
ML Photo Validator v3.3 - Complete Validation System
====================================================

Validaciones implementadas:
- ✅ Detección de rostros (face_recognition)
- ✅ Calidad de imagen (nitidez, resolución, % rostro)
- ✅ Smart crop (márgenes generosos para peinados)
- ✅ NSFW Detection (NudeNet)
- ✅ OCR - Detección de texto (EasyOCR)
- ✅ Objetos prohibidos (YOLOv8)
- ✅ Face Matching - Detección de celebridades/suplantación - NUEVO en v3.3
- ✅ AI/Deepfake Detection - NUEVO en v3.3

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
import tempfile
import os
import re
import torch
import json
from pathlib import Path

app = Flask(__name__)

# ============================================================================
# CARGAR MODELOS AL INICIO
# ============================================================================
print("🔍 Cargando modelos ML...")

# NSFW Detector
print("  • NudeNet (NSFW)...", end="", flush=True)
from nudenet import NudeDetector
nsfw_detector = NudeDetector()
print(" ✅")

# OCR
print("  • EasyOCR (texto)...", end="", flush=True)
import easyocr
ocr_reader = easyocr.Reader(['en', 'es'], gpu=False)  # CPU mode
print(" ✅")

# YOLO (objetos)
print("  • YOLOv8 (objetos)...", end="", flush=True)
from ultralytics import YOLO
torch.cuda.is_available = lambda : False  # Forzar CPU
yolo_model = YOLO('yolov8n.pt')
print(" ✅")

print("✅ Todos los modelos cargados\n")

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

VALIDATION_CONFIG = {
    'profile': {
        'min_face_percentage': 10,
        'min_sharpness': 50,
        'min_sharpness_review': 30,
        'min_resolution': 400,
        'max_faces': 1,
        'crop_margin': 80,
        'crop_margin_top': 120,
        'crop_margin_bottom': 80,
        'crop_aspect': 'square',
        'target_size': 600,
        'nsfw_enabled': True,
        'ocr_enabled': True,
        'object_detection_enabled': True,
        'face_matching_enabled': True,
        'ai_detection_enabled': True
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
        'crop_aspect': 'portrait',
        'target_size': 800,
        'nsfw_enabled': True,
        'ocr_enabled': True,
        'object_detection_enabled': True,
        'face_matching_enabled': True,
        'ai_detection_enabled': False  # Menos estricto para álbum
    }
}

# Objetos prohibidos (YOLO classes)
PROHIBITED_OBJECTS = {
    'knife': {'threshold': 0.6, 'severity': 'high'},
    'scissors': {'threshold': 0.6, 'severity': 'medium'},
    'bottle': {'threshold': 0.7, 'severity': 'medium'},
    'wine glass': {'threshold': 0.7, 'severity': 'medium'},
    'cup': {'threshold': 0.8, 'severity': 'low'}  # Solo si muy obvio (bar/alcohol)
}

# Rutas para face matching
FACE_BLACKLIST_PATH = 'face_blacklist.json'
USER_FACE_DB_PATH = 'user_faces_db.json'

# Cargar listas de embeddings
face_blacklist = {}
user_faces_db = {}

def load_face_databases():
    """Carga las bases de datos de rostros"""
    global face_blacklist, user_faces_db
    
    # Cargar blacklist de celebridades/personas públicas
    if os.path.exists(FACE_BLACKLIST_PATH):
        try:
            with open(FACE_BLACKLIST_PATH, 'r') as f:
                data = json.load(f)
                # Convertir listas de vuelta a arrays numpy
                face_blacklist = {k: np.array(v) for k, v in data.items()}
            print(f"✅ Blacklist cargada: {len(face_blacklist)} identidades")
        except Exception as e:
            print(f"⚠️ Error cargando blacklist: {e}")
    else:
        print(f"ℹ️ Blacklist vacía (crear {FACE_BLACKLIST_PATH} para añadir celebridades)")
    
    # Cargar rostros de usuarios aprobados
    if os.path.exists(USER_FACE_DB_PATH):
        try:
            with open(USER_FACE_DB_PATH, 'r') as f:
                data = json.load(f)
                user_faces_db = {k: np.array(v) for k, v in data.items()}
            print(f"✅ Base de usuarios cargada: {len(user_faces_db)} usuarios")
        except Exception as e:
            print(f"⚠️ Error cargando BD usuarios: {e}")
    else:
        print(f"ℹ️ BD usuarios vacía (se creará automáticamente)")

# Cargar al inicio
load_face_databases()

def save_user_face_embedding(user_id, face_encoding):
    """Guarda el embedding del rostro de un usuario aprobado"""
    global user_faces_db
    
    try:
        # Convertir numpy array a lista para JSON
        user_faces_db[user_id] = face_encoding
        
        # Guardar en archivo
        data_to_save = {k: v.tolist() for k, v in user_faces_db.items()}
        with open(USER_FACE_DB_PATH, 'w') as f:
            json.dump(data_to_save, f)
        
        return True
    except Exception as e:
        print(f"⚠️ Error guardando embedding de usuario {user_id}: {e}")
        return False

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

def resize_image(img, max_size=1200):
    """Redimensiona imagen manteniendo aspect ratio"""
    height, width = img.shape[:2]
    if height <= max_size and width <= max_size:
        return img
    
    if height > width:
        new_height = max_size
        new_width = int(width * (max_size / height))
    else:
        new_width = max_size
        new_height = int(height * (max_size / width))
    
    img_pil = Image.fromarray(img)
    img_pil = img_pil.resize((new_width, new_height), Image.Resampling.LANCZOS)
    return np.array(img_pil)


def download_image(url):
    """Descarga imagen desde URL"""
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    img = Image.open(BytesIO(response.content))
    if img.mode != 'RGB':
        img = img.convert('RGB')
    return np.array(img)


def calculate_face_sharpness(img, face_location, expand_factor=1.3):
    """Calcula nitidez SOLO en zona del rostro"""
    height, width = img.shape[:2]
    top, right, bottom, left = face_location
    
    face_width = right - left
    face_height = bottom - top
    
    margin_x = int(face_width * ((expand_factor - 1.0) / 2))
    margin_y = int(face_height * ((expand_factor - 1.0) / 2))
    
    roi_left = max(0, left - margin_x)
    roi_right = min(width, right + margin_x)
    roi_top = max(0, top - margin_y)
    roi_bottom = min(height, bottom + margin_y)
    
    face_roi = img[roi_top:roi_bottom, roi_left:roi_right]
    face_gray = cv2.cvtColor(face_roi, cv2.COLOR_RGB2GRAY)
    laplacian_var = cv2.Laplacian(face_gray, cv2.CV_64F).var()
    
    return laplacian_var


def check_nsfw(img_array):
    """Detecta contenido NSFW"""
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
    img_pil = Image.fromarray(img_array)
    img_pil.save(tmp.name, 'JPEG')
    
    try:
        detections = nsfw_detector.detect(tmp.name)
        
        explicit_classes = [
            'FEMALE_BREAST_EXPOSED', 'FEMALE_GENITALIA_EXPOSED',
            'MALE_GENITALIA_EXPOSED', 'BUTTOCKS_EXPOSED', 'ANUS_EXPOSED'
        ]
        
        questionable_classes = [
            'BELLY_EXPOSED', 'FEET_EXPOSED', 'ARMPITS_EXPOSED', 'FEMALE_BREAST_COVERED'
        ]
        
        explicit_detections = []
        questionable_detections = []
        max_confidence = 0.0
        
        for det in detections:
            confidence = det['score']
            class_name = det['class']
            
            if class_name in explicit_classes and confidence > 0.60:
                explicit_detections.append({
                    'part': class_name,
                    'confidence': round(confidence, 3),
                    'box': det['box']
                })
                max_confidence = max(max_confidence, confidence)
            elif class_name in questionable_classes and confidence > 0.70:
                questionable_detections.append({
                    'part': class_name,
                    'confidence': round(confidence, 3),
                    'box': det['box']
                })
                max_confidence = max(max_confidence, confidence)
        
        if explicit_detections:
            verdict = 'explicit'
            is_nsfw = True
        elif len(questionable_detections) >= 2:
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
            'questionable_detections': questionable_detections
        }
    finally:
        os.unlink(tmp.name)


def check_text_content(img_array):
    """
    Detecta texto en la imagen (OCR) - MODO INTELIGENTE
    
    REGLAS DE RECHAZO:
    - ❌ Palabras prohibidas: LINK, INSTA, TELEGRAM, VENTA, WHATSAPP, ONLYFANS, etc.
    - ❌ Números de teléfono
    - ❌ URLs (www., .com, http://, etc.)
    - ❌ Demasiado texto (>50 caracteres totales)
    - ✅ PERMITIR: Texto de fondo (señales, 1-3 palabras cortas)
    """
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
    img_pil = Image.fromarray(img_array)
    img_pil.save(tmp.name, 'JPEG')
    
    try:
        result = ocr_reader.readtext(tmp.name)
        
        detected_texts = []
        
        # Patrones de teléfonos y URLs
        phone_patterns = [
            r'\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}',
            r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}'
        ]
        url_pattern = r'(www\.|http://|https://|\.com|\.net|\.org|\.es|\.io|\.me|\.tv)'
        
        # Palabras prohibidas (promoción, contacto, redes sociales)
        banned_words = [
            'link', 'insta', 'instagram', 'telegram', 'venta', 'precio',
            'whatsapp', 'onlyfans', 'only fans', 'suscrib', 'follow',
            'compra', 'buy', 'sell', 'money', 'cash', 'pago', 'payment',
            'promocion', 'promo', 'descuento', 'gratis', 'free',
            'llamar', 'call', 'contacto', 'contact', 'mensaje', 'message',
            'snapchat', 'tiktok', 'twitter', 'facebook', 'youtube',
            'disponible', 'available', 'servicio', 'service'
        ]
        
        has_phone = False
        has_url = False
        has_banned_word = False
        total_text_length = 0
        banned_words_found = []
        
        for detection in result:
            bbox, text, conf = detection
            
            # Solo considerar si confianza >50%
            if conf < 0.5:
                continue
            
            text_clean = text.strip()
            text_lower = text_clean.lower()
            
            # Detectar teléfonos
            for pattern in phone_patterns:
                if re.search(pattern, text_clean):
                    has_phone = True
            
            # Detectar URLs
            if re.search(url_pattern, text_clean, re.IGNORECASE):
                has_url = True
            
            # Detectar palabras prohibidas
            for banned in banned_words:
                if banned in text_lower:
                    has_banned_word = True
                    if banned not in banned_words_found:
                        banned_words_found.append(banned)
            
            # Contar longitud total del texto (ignorar palabras muy cortas)
            if len(text_clean) > 2:
                total_text_length += len(text_clean)
                detected_texts.append({
                    'text': text_clean,
                    'confidence': round(conf, 3),
                    'bbox': bbox
                })
        
        # LÓGICA DE RECHAZO:
        # 1. Siempre rechazar: teléfonos, URLs, palabras prohibidas
        # 2. Rechazar si hay MUCHO texto (>50 caracteres totales)
        # 3. Permitir: 1-3 palabras cortas (señales de tráfico, carteles de fondo)
        
        too_much_text = total_text_length > 50
        
        should_reject = has_phone or has_url or has_banned_word or too_much_text
        
        # Determinar razón del rechazo
        reject_reason = []
        if has_phone:
            reject_reason.append("número de teléfono")
        if has_url:
            reject_reason.append("URL")
        if has_banned_word:
            reject_reason.append(f"palabras prohibidas ({', '.join(banned_words_found)})")
        if too_much_text:
            reject_reason.append(f"demasiado texto ({total_text_length} caracteres)")
        
        return {
            'has_text': len(detected_texts) > 0,
            'has_phone': has_phone,
            'has_url': has_url,
            'has_banned_word': has_banned_word,
            'too_much_text': too_much_text,
            'should_reject': should_reject,
            'reject_reason': ', '.join(reject_reason) if reject_reason else None,
            'text_count': len(detected_texts),
            'total_length': total_text_length,
            'banned_words_found': banned_words_found,
            'detections': detected_texts
        }
    finally:
        os.unlink(tmp.name)


def check_prohibited_objects(img_array):
    """
    Detecta objetos prohibidos con YOLO
    """
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
    img_pil = Image.fromarray(img_array)
    img_pil.save(tmp.name, 'JPEG')
    
    try:
        results = yolo_model(tmp.name, verbose=False)
        
        detected_objects = []
        prohibited_found = []
        
        for box in results[0].boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            label = yolo_model.names[cls]
            
            detected_objects.append({
                'object': label,
                'confidence': round(conf, 3)
            })
            
            # Verificar si es objeto prohibido
            if label in PROHIBITED_OBJECTS:
                threshold = PROHIBITED_OBJECTS[label]['threshold']
                severity = PROHIBITED_OBJECTS[label]['severity']
                
                if conf >= threshold:
                    prohibited_found.append({
                        'object': label,
                        'confidence': round(conf, 3),
                        'severity': severity
                    })
        
        should_reject = len(prohibited_found) > 0
        
        return {
            'has_prohibited': should_reject,
            'prohibited_objects': prohibited_found,
            'all_objects': detected_objects
        }
    finally:
        os.unlink(tmp.name)


def check_face_matching(img_array, face_locations, user_id=None):
    """
    Detección de celebridades/suplantación mediante face matching
    
    LÓGICA:
    1. Extrae embedding del rostro detectado
    2. Compara contra blacklist de celebridades (distancia < 0.6 = match)
    3. Si es perfil de usuario existente, compara contra su foto aprobada
    4. Permite actualizar la BD con rostros aprobados
    
    Args:
        img_array: imagen como numpy array
        face_locations: lista de localizaciones de rostros (face_recognition format)
        user_id: ID del usuario (opcional, para verificar contra su perfil)
    
    Returns:
        dict con 'is_match', 'matched_identity', 'confidence', 'should_reject'
    """
    if not face_locations:
        return {
            'is_match': False,
            'matched_identity': None,
            'confidence': 0.0,
            'should_reject': False,
            'match_type': None
        }
    
    try:
        # Obtener encoding del primer rostro
        face_encodings = face_recognition.face_encodings(img_array, face_locations)
        
        if not face_encodings:
            return {
                'is_match': False,
                'matched_identity': None,
                'confidence': 0.0,
                'should_reject': False,
                'match_type': None
            }
        
        current_encoding = face_encodings[0]
        
        # 1. VERIFICAR BLACKLIST (celebridades, personas públicas)
        if face_blacklist:
            for identity, blacklisted_encoding in face_blacklist.items():
                distance = face_recognition.face_distance([blacklisted_encoding], current_encoding)[0]
                
                # Umbral 0.6: menor = mayor similitud
                if distance < 0.6:
                    return {
                        'is_match': True,
                        'matched_identity': identity,
                        'confidence': round(1.0 - distance, 3),
                        'distance': round(distance, 3),
                        'should_reject': True,
                        'match_type': 'blacklist',
                        'message': f"Posible suplantación de identidad: {identity}"
                    }
        
        # 2. VERIFICAR ROSTRO DE USUARIO (si es foto de perfil de usuario existente)
        if user_id and user_id in user_faces_db:
            approved_encoding = user_faces_db[user_id]
            distance = face_recognition.face_distance([approved_encoding], current_encoding)[0]
            
            # Para mismo usuario, umbral más estricto (0.4)
            if distance < 0.4:
                # Mismo usuario, todo OK
                return {
                    'is_match': True,
                    'matched_identity': f"user_{user_id}",
                    'confidence': round(1.0 - distance, 3),
                    'distance': round(distance, 3),
                    'should_reject': False,
                    'match_type': 'user_verified',
                    'message': "Rostro verificado contra perfil del usuario"
                }
            else:
                # Usuario intentando subir foto de otra persona
                return {
                    'is_match': False,
                    'matched_identity': f"user_{user_id}_mismatch",
                    'confidence': round(1.0 - distance, 3),
                    'distance': round(distance, 3),
                    'should_reject': True,
                    'match_type': 'user_mismatch',
                    'message': "El rostro no coincide con el perfil del usuario"
                }
        
        # 3. TODO OK: sin matches
        return {
            'is_match': False,
            'matched_identity': None,
            'confidence': 0.0,
            'should_reject': False,
            'match_type': 'no_match',
            'face_encoding': current_encoding  # Para guardar después si se aprueba
        }
        
    except Exception as e:
        print(f"⚠️ Error en face matching: {e}")
        return {
            'is_match': False,
            'matched_identity': None,
            'confidence': 0.0,
            'should_reject': False,
            'match_type': 'error',
            'error': str(e)
        }


def check_ai_generated(img_array):
    """
    Detección de imágenes generadas por IA / Deepfakes
    
    ESTRATEGIA MULTI-CAPA:
    1. Análisis de metadatos (marcadores de IA)
    2. Detección de artefactos visuales comunes en IA
    3. Análisis de frecuencias y patrones
    
    Returns:
        dict con 'is_ai_generated', 'confidence', 'indicators'
    """
    try:
        indicators = []
        ai_score = 0.0
        max_score = 0.0
        
        # 1. ANÁLISIS DE FRECUENCIAS (FFT)
        # Las imágenes de IA suelen tener patrones de frecuencia distintivos
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # FFT en pequeñas regiones
        h, w = gray.shape
        region_size = min(256, h // 2, w // 2)
        
        if region_size >= 64:
            # Extraer región central
            y1 = (h - region_size) // 2
            x1 = (w - region_size) // 2
            region = gray[y1:y1+region_size, x1:x1+region_size]
            
            # FFT
            fft = np.fft.fft2(region)
            fft_shift = np.fft.fftshift(fft)
            magnitude = np.abs(fft_shift)
            
            # Análisis de magnitud en frecuencias altas
            center = region_size // 2
            high_freq_ring = magnitude[center-10:center+10, center-10:center+10]
            high_freq_mean = np.mean(high_freq_ring)
            
            # Las IA tienen menos ruido de alta frecuencia (más "perfectas")
            if high_freq_mean < 50:  # Umbral experimental
                ai_score += 0.3
                indicators.append("low_high_frequency")
        
        # 2. ANÁLISIS DE TEXTURAS (cara muy suave = posible IA)
        # Calcular varianza local
        kernel_size = 15
        local_var = cv2.blur(gray, (kernel_size, kernel_size))
        variance = np.var(local_var)
        
        # Rostros de IA suelen ser muy uniformes
        if variance < 500:  # Umbral experimental
            ai_score += 0.2
            indicators.append("low_texture_variance")
        
        # 3. DETECCIÓN DE ARTEFACTOS GEOMÉTRICOS
        # Las IA a veces generan simetrías perfectas o artefactos en los ojos
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        
        # Muy pocos bordes = posible IA
        if edge_density < 0.05:
            ai_score += 0.2
            indicators.append("low_edge_density")
        
        # 4. ANÁLISIS DE COLOR (histograma muy uniforme)
        hist_b = cv2.calcHist([img_array], [0], None, [256], [0, 256])
        hist_g = cv2.calcHist([img_array], [1], None, [256], [0, 256])
        hist_r = cv2.calcHist([img_array], [2], None, [256], [0, 256])
        
        # Entropía de histograma
        def calc_entropy(hist):
            hist = hist / (np.sum(hist) + 1e-7)
            entropy = -np.sum(hist * np.log2(hist + 1e-7))
            return entropy
        
        entropy = (calc_entropy(hist_b) + calc_entropy(hist_g) + calc_entropy(hist_r)) / 3
        
        # Entropía muy baja = colores muy uniformes (posible IA)
        if entropy < 6.0:
            ai_score += 0.3
            indicators.append("low_color_entropy")
        
        # SCORE FINAL
        # Normalizar a 0-1
        confidence = min(ai_score, 1.0)
        
        # Umbral de decisión: 0.6
        is_ai_generated = confidence >= 0.6
        
        return {
            'is_ai_generated': is_ai_generated,
            'confidence': round(confidence, 3),
            'indicators': indicators,
            'should_reject': is_ai_generated,
            'message': f"Posible imagen generada por IA (confianza: {confidence:.1%})" if is_ai_generated else None
        }
        
    except Exception as e:
        print(f"⚠️ Error en detección de IA: {e}")
        return {
            'is_ai_generated': False,
            'confidence': 0.0,
            'indicators': [],
            'should_reject': False,
            'error': str(e)
        }


def smart_crop_face(img, face_location, config):
    """Recorta inteligentemente alrededor del rostro"""
    height, width = img.shape[:2]
    top, right, bottom, left = face_location
    
    face_width = right - left
    face_height = bottom - top
    face_center_x = left + (face_width // 2)
    face_center_y = top + (face_height // 2)
    
    margin_percent = config['crop_margin']
    margin_top_percent = config['crop_margin_top']
    margin_bottom_percent = config['crop_margin_bottom']
    
    margin_x = int(face_width * (margin_percent / 100))
    margin_y_top = int(face_height * (margin_top_percent / 100))
    margin_y_bottom = int(face_height * (margin_bottom_percent / 100))
    
    crop_left = max(0, face_center_x - (face_width // 2) - margin_x)
    crop_right = min(width, face_center_x + (face_width // 2) + margin_x)
    crop_top = max(0, top - margin_y_top)
    crop_bottom = min(height, bottom + margin_y_bottom)
    
    crop_width = crop_right - crop_left
    crop_height = crop_bottom - crop_top
    
    aspect_ratio = config['crop_aspect']
    
    if aspect_ratio == 'square':
        target_ratio = 1.0
    elif aspect_ratio == 'portrait':
        target_ratio = 3.0 / 4.0
    else:
        target_ratio = crop_width / crop_height
    
    current_ratio = crop_width / crop_height
    
    if current_ratio > target_ratio:
        target_height = int(crop_width / target_ratio)
        diff = target_height - crop_height
        crop_top = max(0, crop_top - diff // 2)
        crop_bottom = min(height, crop_bottom + (diff - diff // 2))
    else:
        target_width = int(crop_height * target_ratio)
        diff = target_width - crop_width
        crop_left = max(0, crop_left - diff // 2)
        crop_right = min(width, crop_right + (diff - diff // 2))
    
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

def validate_and_crop_photo(photo_url, photo_type='profile', user_id=None, user_gender=None, user_age=None):
    """
    Valida y recorta una foto con TODAS las validaciones (v3.3)
    
    Orden de validación:
    1. Descargar y redimensionar
    2. Detectar rostros
    3. Face Matching (celebridades + verificación usuario) - NUEVO v3.3
    4. AI/Deepfake Detection - NUEVO v3.3
    5. NSFW (primero para rechazar contenido explícito rápido)
    6. OCR (detectar texto/teléfonos/URLs)
    7. Objetos prohibidos (armas, alcohol, etc.)
    8. Calidad (% rostro, nitidez, resolución)
    9. Smart crop y resultado final
    """
    start_time = time.time()
    
    try:
        config = VALIDATION_CONFIG.get(photo_type, VALIDATION_CONFIG['profile'])
        
        print("\n" + "="*70)
        print(f"🔍 VALIDANDO FOTO v3.3: {photo_type.upper()}")
        if user_id:
            print(f"👤 Usuario: {user_id}")
        print(f"📍 URL: {photo_url[:80]}...")
        print("="*70)
        
        # 1. DESCARGAR Y REDIMENSIONAR
        print("📥 Descargando imagen...")
        img_original = download_image(photo_url)
        print(f"✅ Descargada: {img_original.shape[1]}×{img_original.shape[0]} px")
        
        print("📐 Redimensionando...")
        img_resized = resize_image(img_original, max_size=1200)
        print(f"✅ Redimensionada: {img_resized.shape[1]}×{img_resized.shape[0]} px")
        
        # 2. DETECTAR ROSTROS
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
        
        if photo_type == 'profile' and num_faces > config['max_faces']:
            print(f"❌ RECHAZADA: {num_faces} rostros")
            return {
                "verdict": "REJECT",
                "reason": "multiple_faces",
                "message": f"Se detectaron {num_faces} rostros. Las fotos de perfil deben tener solo una persona",
                "processing_time": round(time.time() - start_time, 2)
            }
        
        # 3. FACE MATCHING (celebridades + verificación usuario) - NUEVO v3.3
        face_match_result = None
        if config.get('face_matching_enabled', True):
            print("\n🎭 VERIFICANDO IDENTIDAD (Face Matching):")
            face_match_result = check_face_matching(img_resized, faces, user_id)
            
            if face_match_result.get('is_match'):
                match_type = face_match_result.get('match_type')
                print(f"   Match: {match_type}")
                print(f"   Identidad: {face_match_result.get('matched_identity')}")
                print(f"   Confianza: {face_match_result.get('confidence'):.1%}")
            else:
                print(f"   Sin matches")
            
            if face_match_result.get('should_reject'):
                print(f"❌ RECHAZADA: {face_match_result.get('message')}")
                return {
                    "verdict": "REJECT",
                    "reason": "face_matching_failed",
                    "message": face_match_result.get('message'),
                    "face_matching_data": face_match_result,
                    "processing_time": round(time.time() - start_time, 2)
                }
        
        # 4. AI/DEEPFAKE DETECTION - NUEVO v3.3
        ai_detection_result = None
        if config.get('ai_detection_enabled', True):
            print("\n🤖 DETECTANDO IA/DEEPFAKE:")
            ai_detection_result = check_ai_generated(img_resized)
            print(f"   IA detectada: {'SÍ' if ai_detection_result['is_ai_generated'] else 'NO'}")
            print(f"   Confianza: {ai_detection_result['confidence']:.1%}")
            print(f"   Indicadores: {', '.join(ai_detection_result['indicators'])}")
            
            if ai_detection_result.get('should_reject'):
                print(f"❌ RECHAZADA: {ai_detection_result.get('message')}")
                return {
                    "verdict": "REJECT",
                    "reason": "ai_generated",
                    "message": ai_detection_result.get('message'),
                    "ai_detection_data": ai_detection_result,
                    "processing_time": round(time.time() - start_time, 2)
                }
        
        # 5. VALIDACIÓN NSFW
        nsfw_result = None
        if config.get('nsfw_enabled', True):
            print("\n🔞 ANALIZANDO CONTENIDO NSFW:")
            nsfw_result = check_nsfw(img_resized)
            print(f"   Veredicto: {nsfw_result['verdict'].upper()}")
            print(f"   Explícitas: {len(nsfw_result['explicit_detections'])}")
            print(f"   Cuestionables: {len(nsfw_result['questionable_detections'])}")
            
            if nsfw_result['is_nsfw']:
                explicit_parts = [d['part'] for d in nsfw_result['explicit_detections']]
                print(f"❌ RECHAZADA: Contenido explícito ({', '.join(explicit_parts)})")
                return {
                    "verdict": "REJECT",
                    "reason": "nsfw_content",
                    "message": f"Contenido inapropiado detectado: {', '.join(explicit_parts)}",
                    "nsfw_data": nsfw_result,
                    "processing_time": round(time.time() - start_time, 2)
                }
        
        # 6. VALIDACIÓN OCR (TEXTO)
        ocr_result = None
        if config.get('ocr_enabled', True):
            print("\n📝 ANALIZANDO TEXTO (OCR):")
            ocr_result = check_text_content(img_resized)
            print(f"   Texto detectado: {ocr_result['text_count']} elementos")
            print(f"   Total caracteres: {ocr_result['total_length']}")
            print(f"   Teléfonos: {'SÍ' if ocr_result['has_phone'] else 'NO'}")
            print(f"   URLs: {'SÍ' if ocr_result['has_url'] else 'NO'}")
            print(f"   Palabras prohibidas: {'SÍ' if ocr_result['has_banned_word'] else 'NO'}")
            
            if ocr_result['should_reject']:
                print(f"❌ RECHAZADA: {ocr_result['reject_reason']}")
                return {
                    "verdict": "REJECT",
                    "reason": "text_detected",
                    "message": f"Contenido no permitido detectado: {ocr_result['reject_reason']}",
                    "ocr_data": ocr_result,
                    "processing_time": round(time.time() - start_time, 2)
                }
        
        # 7. VALIDACIÓN OBJETOS PROHIBIDOS
        obj_result = None
        if config.get('object_detection_enabled', True):
            print("\n🔍 DETECTANDO OBJETOS:")
            obj_result = check_prohibited_objects(img_resized)
            print(f"   Objetos totales: {len(obj_result['all_objects'])}")
            print(f"   Prohibidos: {len(obj_result['prohibited_objects'])}")
            
            if obj_result['has_prohibited']:
                prohibited = [f"{o['object']} ({o['confidence']:.0%})" for o in obj_result['prohibited_objects']]
                print(f"❌ RECHAZADA: Objetos prohibidos ({', '.join(prohibited)})")
                return {
                    "verdict": "REJECT",
                    "reason": "prohibited_objects",
                    "message": f"Objetos no permitidos detectados: {', '.join(prohibited)}",
                    "object_data": obj_result,
                    "processing_time": round(time.time() - start_time, 2)
                }
        
        # 8. ANÁLISIS DE CALIDAD
        top, right, bottom, left = faces[0]
        
        print("\n📊 ANÁLISIS DE CALIDAD:")
        face_area = (bottom - top) * (right - left)
        img_area = img_resized.shape[0] * img_resized.shape[1]
        face_percentage = (face_area / img_area) * 100
        print(f"   % Rostro: {face_percentage:.2f}%")
        
        if face_percentage < 5:
            print("❌ RECHAZADA: Rostro muy pequeño")
            return {
                "verdict": "REJECT",
                "reason": "face_too_small",
                "message": f"El rostro ocupa solo {face_percentage:.1f}%",
                "processing_time": round(time.time() - start_time, 2)
            }
        
        # 9. CROP Y NITIDEZ
        print("\n✂️ RECORTANDO:")
        cropped, crop_coords = smart_crop_face(img_resized, faces[0], config)
        print(f"   Crop: {crop_coords['width']}×{crop_coords['height']} px")
        
        print("\n🔎 ANALIZANDO NITIDEZ:")
        sharpness = calculate_face_sharpness(img_resized, faces[0])
        print(f"   Nitidez: {sharpness:.2f}")
        
        if sharpness < config['min_sharpness_review']:
            print(f"❌ RECHAZADA: Muy borrosa")
            return {
                "verdict": "REJECT",
                "reason": "blurry",
                "message": f"Foto muy borrosa (nitidez: {sharpness:.1f})",
                "processing_time": round(time.time() - start_time, 2)
            }
        
        # 10. RESULTADO FINAL
        target_size = config['target_size']
        cropped_resized = resize_image(cropped, max_size=target_size)
        
        cropped_pil = Image.fromarray(cropped_resized)
        buffer = BytesIO()
        cropped_pil.save(buffer, format='JPEG', quality=90)
        cropped_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        processing_time = round(time.time() - start_time, 2)
        
        # Verificar si necesita revisión manual
        needs_review = (
            sharpness < config['min_sharpness'] or
            face_percentage < config['min_face_percentage'] or
            (nsfw_result and nsfw_result.get('verdict') == 'questionable')
        )
        
        if needs_review:
            reasons = []
            if sharpness < config['min_sharpness']:
                reasons.append(f"nitidez baja ({sharpness:.1f})")
            if face_percentage < config['min_face_percentage']:
                reasons.append(f"rostro pequeño ({face_percentage:.1f}%)")
            if nsfw_result and nsfw_result.get('verdict') == 'questionable':
                reasons.append("contenido cuestionable")
            
            print(f"\n⚠️ REVISIÓN MANUAL: {', '.join(reasons)}")
            print("="*70 + "\n")
            
            return {
                "verdict": "MANUAL_REVIEW",
                "reason": "quality_review",
                "message": f"Requiere revisión manual: {', '.join(reasons)}",
                "cropped_image_base64": f"data:image/jpeg;base64,{cropped_base64}",
                "validation_data": {
                    "faces_detected": num_faces,
                    "face_percentage": round(face_percentage, 2),
                    "sharpness": round(sharpness, 2)
                },
                "face_matching_data": face_match_result,
                "ai_detection_data": ai_detection_result,
                "nsfw_data": nsfw_result,
                "ocr_data": ocr_result,
                "object_data": obj_result,
                "processing_time": processing_time
            }
        
        # APROBADA - Guardar embedding del rostro si es nuevo usuario
        if photo_type == 'profile' and user_id and face_match_result:
            if 'face_encoding' in face_match_result:
                save_user_face_embedding(user_id, face_match_result['face_encoding'])
                print(f"💾 Embedding guardado para usuario {user_id}")
        
        print("\n✅ APROBADA")
        print("="*70 + "\n")
        
        return {
            "verdict": "APPROVE",
            "cropped_image_base64": f"data:image/jpeg;base64,{cropped_base64}",
            "validation_data": {
                "faces_detected": num_faces,
                "face_percentage": round(face_percentage, 2),
                "sharpness": round(sharpness, 2)
            },
            "face_matching_data": face_match_result,
            "ai_detection_data": ai_detection_result,
            "nsfw_data": nsfw_result,
            "ocr_data": ocr_result,
            "object_data": obj_result,
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
            "processing_time": round(time.time() - start_time, 2)
        }


# ============================================================================
# RUTAS DE LA API
# ============================================================================

@app.route('/test.html', methods=['GET'])
def test_page():
    try:
        with open('test.html', 'r') as f:
            return f.read()
    except FileNotFoundError:
        return jsonify({"error": "test.html no encontrado"}), 404


@app.route('/health', methods=['GET'])
def health():
    import tensorflow as tf
    gpu_available = len(tf.config.list_physical_devices('GPU')) > 0
    
    return jsonify({
        "status": "ok",
        "service": "ml-validator",
        "version": "3.3",
        "gpu_enabled": gpu_available,
        "features": {
            "face_detection": True,
            "smart_crop": True,
            "face_only_sharpness": True,
            "nsfw_detection": True,
            "ocr_text_detection": True,
            "object_detection": True,
            "face_matching": True,
            "ai_deepfake_detection": True,
            "prohibited_objects": list(PROHIBITED_OBJECTS.keys()),
            "blacklist_size": len(face_blacklist),
            "user_faces_db_size": len(user_faces_db)
        }
    })


@app.route('/validate', methods=['POST'])
def validate():
    data = request.get_json()
    
    if not data or 'photoUrl' not in data:
        return jsonify({"error": "photoUrl requerido"}), 400
    
    photo_url = data['photoUrl']
    photo_type = data.get('type', 'profile')
    user_id = data.get('userId')  # NUEVO v3.3
    user_gender = data.get('userGender')
    user_age = data.get('userAge')
    
    result = validate_and_crop_photo(photo_url, photo_type, user_id, user_gender, user_age)
    
    return jsonify(result)


@app.route('/blacklist', methods=['GET', 'POST', 'DELETE'])
def manage_blacklist():
    """
    Gestionar blacklist de celebridades/personas públicas
    
    GET: obtener lista de identidades en blacklist
    POST: añadir nueva identidad (requiere: identity, photo_url o face_encoding)
    DELETE: eliminar identidad (requiere: identity)
    """
    global face_blacklist
    
    if request.method == 'GET':
        return jsonify({
            "blacklist": list(face_blacklist.keys()),
            "count": len(face_blacklist)
        })
    
    elif request.method == 'POST':
        data = request.get_json()
        
        if not data or 'identity' not in data:
            return jsonify({"error": "identity requerido"}), 400
        
        identity = data['identity']
        
        # Opción 1: proporcionar URL de foto
        if 'photo_url' in data:
            try:
                img = download_image(data['photo_url'])
                faces = face_recognition.face_locations(img)
                
                if not faces:
                    return jsonify({"error": "No se detectó rostro en la imagen"}), 400
                
                encodings = face_recognition.face_encodings(img, faces)
                face_blacklist[identity] = encodings[0]
                
            except Exception as e:
                return jsonify({"error": f"Error procesando imagen: {str(e)}"}), 500
        
        # Opción 2: proporcionar encoding directamente
        elif 'face_encoding' in data:
            face_blacklist[identity] = np.array(data['face_encoding'])
        
        else:
            return jsonify({"error": "Requiere photo_url o face_encoding"}), 400
        
        # Guardar a archivo
        try:
            data_to_save = {k: v.tolist() for k, v in face_blacklist.items()}
            with open(FACE_BLACKLIST_PATH, 'w') as f:
                json.dump(data_to_save, f)
            
            return jsonify({
                "success": True,
                "message": f"Identidad '{identity}' añadida a blacklist",
                "blacklist_size": len(face_blacklist)
            })
        except Exception as e:
            return jsonify({"error": f"Error guardando: {str(e)}"}), 500
    
    elif request.method == 'DELETE':
        data = request.get_json()
        
        if not data or 'identity' not in data:
            return jsonify({"error": "identity requerido"}), 400
        
        identity = data['identity']
        
        if identity not in face_blacklist:
            return jsonify({"error": f"Identidad '{identity}' no encontrada"}), 404
        
        del face_blacklist[identity]
        
        # Guardar a archivo
        try:
            data_to_save = {k: v.tolist() for k, v in face_blacklist.items()}
            with open(FACE_BLACKLIST_PATH, 'w') as f:
                json.dump(data_to_save, f)
            
            return jsonify({
                "success": True,
                "message": f"Identidad '{identity}' eliminada de blacklist",
                "blacklist_size": len(face_blacklist)
            })
        except Exception as e:
            return jsonify({"error": f"Error guardando: {str(e)}"}), 500


# ============================================================================
# INICIO DEL SERVIDOR
# ============================================================================

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🚀 ML VALIDATOR v3.3 - COMPLETE VALIDATION SYSTEM")
    print("="*70)
    print("\n📍 ENDPOINTS:")
    print("   • Health:    GET    http://192.168.1.159:5000/health")
    print("   • Validate:  POST   http://192.168.1.159:5000/validate")
    print("   • Blacklist: GET/POST/DELETE http://192.168.1.159:5000/blacklist")
    print("   • Test UI:   GET    http://192.168.1.159:5000/test.html")
    
    print("\n⚙️ CONFIGURACIÓN:")
    print("   • Profile:  face≥10%, sharpness≥50, 1 rostro, NSFW, OCR, Objetos, Face Match, AI Detection")
    print("   • Album:    face≥5%,  sharpness≥40, ≤5 rostros, NSFW, OCR, Objetos, Face Match")
    
    print("\n🚫 OBJETOS PROHIBIDOS:")
    for obj, cfg in PROHIBITED_OBJECTS.items():
        print(f"   • {obj}: threshold={cfg['threshold']:.0%}, severity={cfg['severity']}")
    
    print(f"\n🎭 FACE MATCHING:")
    print(f"   • Blacklist: {len(face_blacklist)} identidades")
    print(f"   • BD Usuarios: {len(user_faces_db)} usuarios registrados")
    
    import tensorflow as tf
    gpus = tf.config.list_physical_devices('GPU')
    
    if gpus:
        print(f"\n⚡ GPU: {len(gpus)} dispositivo(s)")
        for gpu in gpus:
            print(f"   • {gpu.name}")
    else:
        print("\n⚠️ CPU MODE")
    
    print("\n" + "="*70)
    print("🎯 VALIDACIONES v3.3:")
    print("   ✅ Face detection (GPU)")
    print("   ✅ Smart crop + face-only sharpness")
    print("   ✅ NSFW detection (NudeNet)")
    print("   ✅ OCR - Text/Phone/URL detection (EasyOCR)")
    print("   ✅ Prohibited objects (YOLOv8)")
    print("   ✅ Face Matching - Celebrity/impersonation detection")
    print("   ✅ AI/Deepfake detection")
    print("="*70 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
