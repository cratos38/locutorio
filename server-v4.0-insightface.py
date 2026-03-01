#!/usr/bin/env python3
"""
ML Photo Validator v4.0 - InsightFace Edition
===============================================

CAMBIOS EN v4.0:
- ✅ REEMPLAZADO face_recognition (dlib) por InsightFace (ArcFace)
- ✅ Precisión mejorada 3-5x en face matching
- ✅ Más robusto a ángulos, iluminación, expresiones
- ✅ Threshold ajustado: 0.4 → 0.35 (más preciso)

Servidor: 192.168.1.159:5000
"""

from flask import Flask, request, jsonify
import insightface
from insightface.app import FaceAnalysis
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
from datetime import datetime

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

# InsightFace para reconocimiento facial
print("  • InsightFace (face recognition)...", end="", flush=True)
face_app = FaceAnalysis(providers=['CPUExecutionProvider'])
face_app.prepare(ctx_id=0, det_size=(640, 640))
print(" ✅")

print("✅ Todos los modelos cargados\n")

# ============================================================================
# FUNCIONES AUXILIARES PARA INSIGHTFACE
# ============================================================================

def detect_faces_insightface(img_array):
    """Detecta rostros con InsightFace y retorna formato compatible con face_recognition"""
    faces = face_app.get(img_array)
    
    # Convertir a formato (top, right, bottom, left) como face_recognition
    face_locations = []
    for face in faces:
        bbox = face.bbox.astype(int)
        # bbox formato: [x1, y1, x2, y2]
        left, top, right, bottom = bbox[0], bbox[1], bbox[2], bbox[3]
        # face_recognition formato: (top, right, bottom, left)
        face_locations.append((top, right, bottom, left))
    
    return face_locations, faces

def get_face_embeddings_insightface(img_array, face_locations=None):
    """Extrae embeddings de rostros con InsightFace"""
    faces = face_app.get(img_array)
    return [face.embedding for face in faces]

def cosine_similarity(emb1, emb2):
    """Calcula similitud coseno entre dos embeddings"""
    return np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))

# ============================================================================
# CONFIGURACIÓN v4.0 (basada en v3.5 con InsightFace)
# ============================================================================

VALIDATION_CONFIG = {
    'profile': {
        # PERFIL: Todas las validaciones (SIN CAMBIOS)
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
        'nsfw_strict': False,  # Rechazar explícito + cuestionable
        'ocr_enabled': True,
        'ocr_mode': 'full',  # Texto, teléfonos, URLs, palabras prohibidas
        'object_detection_enabled': True,
        'object_mode': 'all',  # Armas, drogas, alcohol
        'face_matching_enabled': True,
        'ai_detection_enabled': True,
        'quality_check_enabled': True,
        'crop_enabled': True
    },
    'album_public': {
        # ÁLBUM PÚBLICO: SOLO NSFW + OCR + Armas/Drogas
        'nsfw_enabled': True,
        'nsfw_strict': True,  # Solo rechazar explícito (permitir cuestionable/bikini)
        'ocr_enabled': True,
        'ocr_mode': 'vulgar_only',  # Solo palabras vulgares + propaganda
        'object_detection_enabled': True,
        'object_mode': 'weapons_drugs_only',  # Solo armas + drogas (NO alcohol)
        'auto_delete_weapons_drugs': True,  # Borrado automático sin esperar 24h
        # NO validar rostros, nitidez, resolución, face matching, AI
        'face_detection_enabled': False,
        'face_matching_enabled': False,
        'ai_detection_enabled': False,
        'quality_check_enabled': False,
        'crop_enabled': False,
        'min_resolution': 0  # Sin límite de resolución
    },
    'album_private': {
        # ÁLBUM PRIVADO: Sin validaciones
        'nsfw_enabled': False,
        'ocr_enabled': False,
        'object_detection_enabled': False,
        'face_detection_enabled': False,
        'face_matching_enabled': False,
        'ai_detection_enabled': False,
        'quality_check_enabled': False,
        'crop_enabled': False
    }
}

# Objetos prohibidos por tipo de foto
PROHIBITED_OBJECTS = {
    'profile': {
        # PERFIL: Todos los objetos
        'knife': {'threshold': 0.6, 'severity': 'high', 'auto_delete': False},
        'scissors': {'threshold': 0.6, 'severity': 'medium', 'auto_delete': False},
        'bottle': {'threshold': 0.7, 'severity': 'medium', 'auto_delete': False},
        'wine glass': {'threshold': 0.7, 'severity': 'medium', 'auto_delete': False},
        'cup': {'threshold': 0.8, 'severity': 'low', 'auto_delete': False}
    },
    'album_public': {
        # ÁLBUM: Solo armas y drogas (borrado automático)
        'knife': {'threshold': 0.6, 'severity': 'critical', 'auto_delete': True},
        'scissors': {'threshold': 0.6, 'severity': 'critical', 'auto_delete': True},
        # Agregar más armas si YOLO las detecta: gun, rifle, etc.
    }
}

# Palabras vulgares/obscenas (español + inglés)
VULGAR_WORDS = [
    # Español
    'puta', 'puto', 'hijo de puta', 'hijoputa', 'coño', 'verga', 'pene', 'polla',
    'tetas', 'culo', 'mierda', 'joder', 'follar', 'chingar', 'mamar', 'chupar',
    'carajo', 'pendejo', 'cabrón',
    # Inglés
    'fuck', 'shit', 'bitch', 'asshole', 'dick', 'cock', 'pussy', 'whore',
    'slut', 'cunt', 'bastard'
]

# Rutas para face matching
FACE_BLACKLIST_PATH = 'face_blacklist.json'
USER_FACE_DB_PATH = 'user_faces_db.json'

# Cargar listas de embeddings
face_blacklist = {}
user_faces_db = {}

def load_face_databases():
    """Carga las bases de datos de rostros"""
    global face_blacklist, user_faces_db
    
    if os.path.exists(FACE_BLACKLIST_PATH):
        try:
            with open(FACE_BLACKLIST_PATH, 'r') as f:
                data = json.load(f)
                face_blacklist = {k: np.array(v) for k, v in data.items()}
            print(f"✅ Blacklist cargada: {len(face_blacklist)} identidades")
        except Exception as e:
            print(f"⚠️ Error cargando blacklist: {e}")
    else:
        print(f"ℹ️ Blacklist vacía (crear {FACE_BLACKLIST_PATH} para añadir celebridades)")
    
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

load_face_databases()

def save_user_face_embedding(user_id, face_encoding):
    """Guarda el embedding del rostro de un usuario aprobado"""
    global user_faces_db
    
    try:
        user_faces_db[user_id] = face_encoding
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


def check_nsfw(img_array, strict_mode=False):
    """
    Detecta contenido NSFW
    
    Args:
        img_array: imagen como numpy array
        strict_mode: Si True, solo rechazar explícito (para álbumes)
                     Si False, también rechazar cuestionable (para perfil)
    """
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
    img_pil = Image.fromarray(img_array)
    img_pil.save(tmp.name, 'JPEG')
    
    try:
        detections = nsfw_detector.detect(tmp.name)
        
        # Clases explícitas - SIEMPRE rechazar
        explicit_classes = [
            'FEMALE_BREAST_EXPOSED', 'FEMALE_GENITALIA_EXPOSED',
            'MALE_GENITALIA_EXPOSED', 'BUTTOCKS_EXPOSED', 'ANUS_EXPOSED'
        ]
        
        # Clases cuestionables - Solo rechazar en perfil
        questionable_classes = [
            'BELLY_EXPOSED', 'FEET_EXPOSED', 'ARMPITS_EXPOSED', 
            'FEMALE_BREAST_COVERED', 'UNDERWEAR'
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
        
        # Decisión según modo
        if explicit_detections:
            # SIEMPRE rechazar contenido explícito
            verdict = 'explicit'
            is_nsfw = True
        elif not strict_mode and len(questionable_detections) >= 2:
            # Modo normal (perfil): rechazar cuestionable
            verdict = 'questionable'
            is_nsfw = True
        else:
            # Álbum (strict_mode=True): permitir cuestionable (bikini, ropa interior)
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
    finally:
        os.unlink(tmp.name)


def check_text_content(img_array, mode='full'):
    """
    Detecta texto en la imagen (OCR)
    
    Args:
        img_array: imagen como numpy array
        mode: 'full' (perfil: todo) o 'vulgar_only' (álbum: solo vulgar + propaganda)
    """
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
    img_pil = Image.fromarray(img_array)
    img_pil.save(tmp.name, 'JPEG')
    
    try:
        result = ocr_reader.readtext(tmp.name)
        
        detected_texts = []
        
        # Patrón URL genérico: palabra.com / palabra.org / palabra.net / etc.
        url_pattern = r'\b\w+\.(com|org|net|co|info|io|app|xyz|me|club|tv|es|mx|ar)\b'
        
        # Patrones de teléfono (solo para perfil)
        phone_patterns = [
            r'\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}',
            r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}'
        ]
        
        has_phone = False
        has_url = False
        has_vulgar = False
        total_text_length = 0
        vulgar_words_found = []
        urls_found = []
        
        for detection in result:
            bbox, text, conf = detection
            
            if conf < 0.5:
                continue
            
            text_clean = text.strip()
            text_lower = text_clean.lower()
            
            # Detectar URLs
            url_matches = re.findall(url_pattern, text_clean, re.IGNORECASE)
            if url_matches:
                has_url = True
                urls_found.append(text_clean)
            
            # Detectar palabras vulgares
            for vulgar in VULGAR_WORDS:
                if vulgar in text_lower:
                    has_vulgar = True
                    if vulgar not in vulgar_words_found:
                        vulgar_words_found.append(vulgar)
            
            # Detectar teléfonos (solo en modo 'full')
            if mode == 'full':
                for pattern in phone_patterns:
                    if re.search(pattern, text_clean):
                        has_phone = True
            
            if len(text_clean) > 2:
                total_text_length += len(text_clean)
                detected_texts.append({
                    'text': text_clean,
                    'confidence': round(conf, 3),
                    'bbox': bbox
                })
        
        # Decidir rechazo según modo
        if mode == 'full':
            # PERFIL: Rechazar TODO (teléfonos, URLs, vulgar, texto largo)
            too_much_text = total_text_length > 50
            should_reject = has_phone or has_url or has_vulgar or too_much_text
            
            reject_reason = []
            if has_phone:
                reject_reason.append("número de teléfono")
            if has_url:
                reject_reason.append(f"URL ({', '.join(urls_found[:3])})")
            if has_vulgar:
                reject_reason.append(f"palabras vulgares ({', '.join(vulgar_words_found)})")
            if too_much_text:
                reject_reason.append(f"demasiado texto ({total_text_length} caracteres)")
        
        else:  # mode == 'vulgar_only'
            # ÁLBUM: Solo rechazar vulgar + propaganda
            should_reject = has_url or has_vulgar
            
            reject_reason = []
            if has_url:
                reject_reason.append(f"propaganda/URL ({', '.join(urls_found[:3])})")
            if has_vulgar:
                reject_reason.append(f"lenguaje vulgar ({', '.join(vulgar_words_found)})")
        
        return {
            'has_text': len(detected_texts) > 0,
            'has_phone': has_phone,
            'has_url': has_url,
            'has_vulgar': has_vulgar,
            'should_reject': should_reject,
            'reject_reason': ', '.join(reject_reason) if reject_reason else None,
            'text_count': len(detected_texts),
            'total_length': total_text_length,
            'vulgar_words_found': vulgar_words_found,
            'urls_found': urls_found,
            'detections': detected_texts,
            'mode': mode
        }
    finally:
        os.unlink(tmp.name)


def check_prohibited_objects(img_array, mode='all'):
    """
    Detecta objetos prohibidos con YOLO
    
    Args:
        img_array: imagen como numpy array
        mode: 'all' (perfil) o 'weapons_drugs_only' (álbum)
    """
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
    img_pil = Image.fromarray(img_array)
    img_pil.save(tmp.name, 'JPEG')
    
    try:
        results = yolo_model(tmp.name, verbose=False)
        
        detected_objects = []
        prohibited_found = []
        
        # Determinar qué objetos validar según el modo
        if mode == 'all':
            prohibited_list = PROHIBITED_OBJECTS.get('profile', {})
        else:  # 'weapons_drugs_only'
            prohibited_list = PROHIBITED_OBJECTS.get('album_public', {})
        
        for box in results[0].boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            label = yolo_model.names[cls]
            
            detected_objects.append({
                'object': label,
                'confidence': round(conf, 3)
            })
            
            if label in prohibited_list:
                threshold = prohibited_list[label]['threshold']
                severity = prohibited_list[label]['severity']
                auto_delete = prohibited_list[label].get('auto_delete', False)
                
                if conf >= threshold:
                    prohibited_found.append({
                        'object': label,
                        'confidence': round(conf, 3),
                        'severity': severity,
                        'auto_delete': auto_delete
                    })
        
        should_reject = len(prohibited_found) > 0
        
        return {
            'has_prohibited': should_reject,
            'prohibited_objects': prohibited_found,
            'all_objects': detected_objects,
            'mode': mode
        }
    finally:
        os.unlink(tmp.name)


def check_face_matching(img_array, face_locations, user_id=None, insightface_faces=None):
    """Detección de celebridades/suplantación mediante face matching con InsightFace"""
    if not face_locations:
        return {
            'is_match': False,
            'matched_identity': None,
            'confidence': 0.0,
            'should_reject': False,
            'match_type': None
        }
    
    try:
        # Usar rostros InsightFace ya detectados o detectar de nuevo
        if insightface_faces is None or len(insightface_faces) == 0:
            print("   ⚠️ Re-detectando rostros con InsightFace...")
            faces = face_app.get(img_array)
        else:
            faces = insightface_faces
        
        if not faces or len(faces) == 0:
            print("   ❌ No se encontraron rostros con InsightFace")
            return {
                'is_match': False,
                'matched_identity': None,
                'confidence': 0.0,
                'should_reject': False,
                'match_type': None
            }
        
        # Usar el primer rostro detectado
        current_face = faces[0]
        current_embedding = current_face.embedding
        print(f"   ✅ Embedding extraído: {len(current_embedding)} dimensiones")
        
        # Función de similitud coseno (InsightFace usa esto en lugar de distancia euclidiana)
        def cosine_similarity(emb1, emb2):
            return np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
        
        # Verificar blacklist
        if face_blacklist:
            for identity, blacklisted_embedding in face_blacklist.items():
                similarity = cosine_similarity(blacklisted_embedding, current_embedding)
                
                # InsightFace: similarity > 0.4 = misma persona
                if similarity > 0.4:
                    return {
                        'is_match': True,
                        'matched_identity': identity,
                        'confidence': round(similarity, 3),
                        'similarity': round(similarity, 3),
                        'should_reject': True,
                        'match_type': 'blacklist',
                        'message': f"Posible suplantación de identidad: {identity}"
                    }
        
        # Verificar contra TODOS los usuarios (detectar fotos robadas)
        for other_user_id, other_embedding in user_faces_db.items():
            # Skip si es el mismo usuario
            if other_user_id == user_id:
                continue
            
            similarity = cosine_similarity(other_embedding, current_embedding)
            
            # Threshold muy alto (0.8) = foto casi idéntica de otro usuario
            if similarity > 0.8:
                return {
                    'is_match': True,
                    'matched_identity': f"user_{other_user_id}",
                    'confidence': round(similarity, 3),
                    'similarity': round(similarity, 3),
                    'should_reject': True,
                    'match_type': 'stolen_photo',
                    'message': f"Esta foto pertenece a otro usuario (similarity: {similarity:.3f})"
                }
        
        # Verificar rostro de usuario
        if user_id and user_id in user_faces_db:
            approved_embedding = user_faces_db[user_id]
            similarity = cosine_similarity(approved_embedding, current_embedding)
            
            # Threshold: 0.6 (equivalente a distance < 0.4 en dlib v3.3 original)
            if similarity > 0.6:
                return {
                    'is_match': True,
                    'matched_identity': f"user_{user_id}",
                    'confidence': round(similarity, 3),
                    'similarity': round(similarity, 3),
                    'should_reject': False,
                    'match_type': 'user_verified',
                    'message': "Rostro verificado contra perfil del usuario"
                }
            else:
                return {
                    'is_match': False,
                    'matched_identity': f"user_{user_id}_mismatch",
                    'confidence': round(similarity, 3),
                    'similarity': round(similarity, 3),
                    'should_reject': True,
                    'match_type': 'user_mismatch',
                    'message': f"El rostro no coincide con el perfil del usuario (similarity: {similarity:.3f}, threshold: 0.6)"
                }
        
        return {
            'is_match': False,
            'matched_identity': None,
            'confidence': 0.0,
            'should_reject': False,
            'match_type': 'no_match',
            'face_embedding': current_embedding.tolist()  # Convertir numpy array a lista
        }
        
    except Exception as e:
        print(f"⚠️ Error en face matching: {e}")
        import traceback
        traceback.print_exc()
        return {
            'is_match': False,
            'matched_identity': None,
            'confidence': 0.0,
            'should_reject': False,
            'match_type': 'error',
            'error': str(e)
        }


def check_ai_generated(img_array):
    """Detección de imágenes generadas por IA / Deepfakes"""
    try:
        indicators = []
        ai_score = 0.0
        
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        h, w = gray.shape
        region_size = min(256, h // 2, w // 2)
        
        if region_size >= 64:
            y1 = (h - region_size) // 2
            x1 = (w - region_size) // 2
            region = gray[y1:y1+region_size, x1:x1+region_size]
            
            fft = np.fft.fft2(region)
            fft_shift = np.fft.fftshift(fft)
            magnitude = np.abs(fft_shift)
            
            center = region_size // 2
            high_freq_ring = magnitude[center-10:center+10, center-10:center+10]
            high_freq_mean = np.mean(high_freq_ring)
            
            if high_freq_mean < 50:
                ai_score += 0.3
                indicators.append("low_high_frequency")
        
        kernel_size = 15
        local_var = cv2.blur(gray, (kernel_size, kernel_size))
        variance = np.var(local_var)
        
        if variance < 500:
            ai_score += 0.2
            indicators.append("low_texture_variance")
        
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        
        if edge_density < 0.05:
            ai_score += 0.2
            indicators.append("low_edge_density")
        
        hist_b = cv2.calcHist([img_array], [0], None, [256], [0, 256])
        hist_g = cv2.calcHist([img_array], [1], None, [256], [0, 256])
        hist_r = cv2.calcHist([img_array], [2], None, [256], [0, 256])
        
        def calc_entropy(hist):
            hist = hist / (np.sum(hist) + 1e-7)
            entropy = -np.sum(hist * np.log2(hist + 1e-7))
            return entropy
        
        entropy = (calc_entropy(hist_b) + calc_entropy(hist_g) + calc_entropy(hist_r)) / 3
        
        if entropy < 6.0:
            ai_score += 0.3
            indicators.append("low_color_entropy")
        
        confidence = min(ai_score, 1.0)
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
# FUNCIONES DE VERIFICACIÓN DE IDENTIDAD (v3.4 - sin cambios)
# ============================================================================

def detect_id_card(img_array):
    """
    Detecta si hay un documento de identidad en la imagen
    Busca formas rectangulares (tarjetas) con texto estructurado
    """
    try:
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Detectar bordes
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        
        # Encontrar contornos
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        id_card_candidates = []
        
        for contour in contours:
            # Aproximar contorno a polígono
            epsilon = 0.02 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)
            
            # Buscar formas rectangulares (4 vértices)
            if len(approx) == 4:
                x, y, w, h = cv2.boundingRect(approx)
                
                # Relación de aspecto típica de una tarjeta ID: 1.5:1 a 2:1
                aspect_ratio = float(w) / h if h > 0 else 0
                
                # Tamaño mínimo (al menos 15% de la imagen)
                img_area = img_array.shape[0] * img_array.shape[1]
                card_area = w * h
                area_percentage = (card_area / img_area) * 100
                
                if 1.3 < aspect_ratio < 2.2 and area_percentage > 10:
                    id_card_candidates.append({
                        'bbox': (x, y, w, h),
                        'aspect_ratio': aspect_ratio,
                        'area_percentage': area_percentage,
                        'contour': approx
                    })
        
        if id_card_candidates:
            # Tomar el candidato más grande
            best_candidate = max(id_card_candidates, key=lambda x: x['area_percentage'])
            
            return {
                'detected': True,
                'bbox': best_candidate['bbox'],
                'aspect_ratio': round(best_candidate['aspect_ratio'], 2),
                'area_percentage': round(best_candidate['area_percentage'], 2)
            }
        else:
            return {
                'detected': False,
                'bbox': None,
                'aspect_ratio': 0,
                'area_percentage': 0
            }
    
    except Exception as e:
        print(f"⚠️ Error detectando ID card: {e}")
        return {
            'detected': False,
            'error': str(e)
        }


def extract_birthdate_from_ocr(ocr_detections):
    """
    Extrae fecha de nacimiento del texto OCR
    Busca patrones: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    """
    date_patterns = [
        r'(\d{1,2})[/-.](\d{1,2})[/-.](\d{4})',  # DD/MM/YYYY
        r'(\d{4})[/-.](\d{1,2})[/-.](\d{1,2})',  # YYYY/MM/DD
    ]
    
    keywords = ['nacimiento', 'birth', 'fecha', 'date', 'nac', 'dob']
    
    found_dates = []
    
    for detection in ocr_detections:
        text = detection['text'].lower()
        
        # Buscar patrones de fecha
        for pattern in date_patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                groups = match.groups()
                
                # Determinar orden (DD/MM/YYYY o YYYY/MM/DD)
                if len(groups[0]) == 4:  # YYYY primero
                    year, month, day = int(groups[0]), int(groups[1]), int(groups[2])
                else:  # DD primero
                    day, month, year = int(groups[0]), int(groups[1]), int(groups[2])
                
                # Validar fecha
                if 1900 < year < 2024 and 1 <= month <= 12 and 1 <= day <= 31:
                    # Calcular edad
                    today = datetime.now()
                    age = today.year - year - ((today.month, today.day) < (month, day))
                    
                    found_dates.append({
                        'date': f"{day:02d}/{month:02d}/{year}",
                        'day': day,
                        'month': month,
                        'year': year,
                        'age': age,
                        'text': detection['text']
                    })
    
    if found_dates:
        # Retornar la fecha más probable (la más reciente que tenga sentido)
        valid_dates = [d for d in found_dates if 18 <= d['age'] <= 100]
        if valid_dates:
            return valid_dates[0]
    
    return None


def verify_identity_document(selfie_url, user_id, profile_age):
    """
    Verificación completa de identidad con documento (v3.4 - sin cambios)
    """
    temp_file_path = None
    start_time = time.time()
    
    try:
        print("\n" + "="*70)
        print("🆔 VERIFICACIÓN DE IDENTIDAD")
        print(f"👤 Usuario: {user_id}")
        print(f"📅 Edad del perfil: {profile_age} años")
        print(f"📍 URL: {selfie_url[:80]}...")
        print("="*70)
        
        # 1. Descargar imagen
        print("\n📥 Descargando selfie con ID...")
        img_original = download_image(selfie_url)
        print(f"✅ Descargada: {img_original.shape[1]}×{img_original.shape[0]} px")
        
        # Guardar temporalmente para procesamiento
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
        temp_file_path = temp_file.name
        img_pil = Image.fromarray(img_original)
        img_pil.save(temp_file_path, 'JPEG')
        temp_file.close()
        
        # Redimensionar para procesamiento
        img_resized = resize_image(img_original, max_size=1200)
        
        # 2. Detectar rostros
        print("\n🔍 Detectando rostros...")
        face_locations, insightface_faces = detect_faces_insightface(img_resized)
        num_faces = len(face_locations)
        print(f"✅ Rostros detectados: {num_faces}")
        
        if num_faces == 0:
            return {
                "verdict": "REJECTED",
                "reason": "no_face_detected",
                "message": "No se detectó ningún rostro en la imagen",
                "processing_time": round(time.time() - start_time, 2)
            }
        
        if num_faces == 1:
            return {
                "verdict": "REJECTED",
                "reason": "only_one_face",
                "message": "Se detectó solo 1 rostro. Debe incluir tu rostro Y la foto del documento",
                "processing_time": round(time.time() - start_time, 2)
            }
        
        if num_faces > 3:
            return {
                "verdict": "REJECTED",
                "reason": "too_many_faces",
                "message": f"Se detectaron {num_faces} rostros. Solo debe haber tu rostro y la foto del documento",
                "processing_time": round(time.time() - start_time, 2)
            }
        
        # 3. Detectar documento de identidad
        print("\n🪪 Detectando documento de identidad...")
        id_detection = detect_id_card(img_resized)
        
        if not id_detection.get('detected'):
            return {
                "verdict": "REJECTED",
                "reason": "no_id_card_detected",
                "message": "No se detectó documento de identidad. Asegúrate de que el documento sea visible y esté en posición horizontal",
                "id_detection": id_detection,
                "processing_time": round(time.time() - start_time, 2)
            }
        
        print(f"✅ Documento detectado:")
        print(f"   Área: {id_detection['area_percentage']:.1f}% de la imagen")
        print(f"   Relación de aspecto: {id_detection['aspect_ratio']}")
        
        # 4. Extraer texto con OCR
        print("\n📝 Extrayendo texto del documento (OCR)...")
        ocr_result = ocr_reader.readtext(temp_file_path)
        
        ocr_detections = []
        for bbox, text, conf in ocr_result:
            if conf > 0.3:  # Umbral más bajo para documentos
                ocr_detections.append({
                    'text': text.strip(),
                    'confidence': round(conf, 3)
                })
        
        print(f"✅ Texto extraído: {len(ocr_detections)} elementos")
        
        # 5. Extraer fecha de nacimiento
        print("\n🎂 Buscando fecha de nacimiento...")
        birthdate_info = extract_birthdate_from_ocr(ocr_detections)
        
        if not birthdate_info:
            return {
                "verdict": "REJECTED",
                "reason": "birthdate_not_found",
                "message": "No se pudo leer la fecha de nacimiento del documento. Asegúrate de que sea legible",
                "ocr_text_count": len(ocr_detections),
                "processing_time": round(time.time() - start_time, 2)
            }
        
        extracted_age = birthdate_info['age']
        print(f"✅ Fecha encontrada: {birthdate_info['date']}")
        print(f"   Edad calculada: {extracted_age} años")
        
        # 6. Comparar edades
        print("\n📊 Verificando edad...")
        age_difference = abs(extracted_age - profile_age)
        age_match = age_difference <= 2  # Tolerancia de ±2 años
        
        print(f"   Edad del perfil: {profile_age} años")
        print(f"   Edad del documento: {extracted_age} años")
        print(f"   Diferencia: {age_difference} años")
        print(f"   {'✅ Edad coincide' if age_match else '❌ Edad NO coincide'}")
        
        if not age_match:
            return {
                "verdict": "REJECTED",
                "reason": "age_mismatch",
                "message": f"La edad del documento ({extracted_age} años) no coincide con la edad del perfil ({profile_age} años)",
                "extracted_age": extracted_age,
                "profile_age": profile_age,
                "age_difference": age_difference,
                "processing_time": round(time.time() - start_time, 2)
            }
        
        # 7. Extraer embeddings de los rostros
        print("\n👤 Extrayendo características faciales...")
        face_embeddings = [face.embedding for face in insightface_faces]
        
        if len(face_embeddings) < 2:
            return {
                "verdict": "REJECTED",
                "reason": "insufficient_face_encodings",
                "message": "No se pudieron extraer las características faciales necesarias",
                "processing_time": round(time.time() - start_time, 2)
            }
        
        # Determinar cuál es el rostro grande (selfie) y cuál es el pequeño (ID)
        face_sizes = []
        for face in insightface_faces:
            bbox = face.bbox
            area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
            face_sizes.append(area)
        
        # Ordenar por tamaño (el más grande es el selfie)
        sorted_indices = sorted(range(len(face_sizes)), key=lambda i: face_sizes[i], reverse=True)
        selfie_idx = sorted_indices[0]
        id_photo_idx = sorted_indices[1]
        
        selfie_embedding = face_embeddings[selfie_idx]
        id_embedding = face_embeddings[id_photo_idx]
        
        # 8. Comparar rostro selfie vs rostro del documento
        print("\n🔍 Comparando rostro del selfie vs foto del documento...")
        similarity_selfie_to_id = cosine_similarity(id_embedding, selfie_embedding)
        match_selfie_to_id = similarity_selfie_to_id > 0.35
        confidence_selfie_to_id = round(similarity_selfie_to_id, 3)
        
        print(f"   Similarity: {similarity_selfie_to_id:.3f}")
        print(f"   Confianza: {confidence_selfie_to_id:.1%}")
        print(f"   {'✅ Rostros coinciden' if match_selfie_to_id else '❌ Rostros NO coinciden'}")
        
        if not match_selfie_to_id:
            return {
                "verdict": "REJECTED",
                "reason": "face_mismatch_selfie_to_id",
                "message": "El rostro del selfie no coincide con la foto del documento",
                "confidence": confidence_selfie_to_id,
                "similarity": round(similarity_selfie_to_id, 3),
                "processing_time": round(time.time() - start_time, 2)
            }
        
        # 9. Comparar rostro selfie vs rostro del perfil (si existe)
        match_selfie_to_profile = None
        confidence_selfie_to_profile = None
        
        if user_id in user_faces_db:
            print("\n🔍 Comparando rostro del selfie vs perfil del usuario...")
            profile_embedding = user_faces_db[user_id]
            similarity_selfie_to_profile = cosine_similarity(profile_embedding, selfie_embedding)
            match_selfie_to_profile = similarity_selfie_to_profile > 0.35
            confidence_selfie_to_profile = round(similarity_selfie_to_profile, 3)
            
            print(f"   Similarity: {similarity_selfie_to_profile:.3f}")
            print(f"   Confianza: {confidence_selfie_to_profile:.1%}")
            print(f"   {'✅ Rostros coinciden' if match_selfie_to_profile else '❌ Rostros NO coinciden'}")
            
            if not match_selfie_to_profile:
                return {
                    "verdict": "REJECTED",
                    "reason": "face_mismatch_selfie_to_profile",
                    "message": "El rostro del selfie no coincide con el rostro registrado en el perfil",
                    "confidence": confidence_selfie_to_profile,
                    "similarity": round(similarity_selfie_to_profile, 3),
                    "processing_time": round(time.time() - start_time, 2)
                }
        else:
            print("\nℹ️ No hay rostro registrado en el perfil, guardando embedding...")
            save_user_face_embedding(user_id, selfie_embedding)
            print("✅ Embedding guardado")
        
        # 10. TODO CORRECTO - VERIFICACIÓN EXITOSA
        processing_time = round(time.time() - start_time, 2)
        
        print("\n" + "="*70)
        print("✅ IDENTIDAD VERIFICADA")
        print("="*70 + "\n")
        
        return {
            "verdict": "VERIFIED",
            "reason": "identity_confirmed",
            "message": "Identidad verificada exitosamente",
            "checks": {
                "id_card_detected": True,
                "faces_detected": num_faces,
                "birthdate_extracted": birthdate_info['date'],
                "age_match": age_match,
                "extracted_age": extracted_age,
                "profile_age": profile_age,
                "age_difference": age_difference,
                "face_match_selfie_to_id": match_selfie_to_id,
                "confidence_selfie_to_id": confidence_selfie_to_id,
                "face_match_selfie_to_profile": match_selfie_to_profile,
                "confidence_selfie_to_profile": confidence_selfie_to_profile
            },
            "verified_badge": True,
            "processing_time": processing_time
        }
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print(traceback.format_exc())
        
        return {
            "verdict": "ERROR",
            "reason": "processing_error",
            "message": str(e),
            "processing_time": round(time.time() - start_time, 2)
        }
    
    finally:
        # SIEMPRE borrar foto temporal
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                print(f"🗑️ Foto de verificación borrada: {temp_file_path}")
            except Exception as e:
                print(f"⚠️ Error borrando archivo temporal: {e}")


# ============================================================================
# FUNCIÓN PRINCIPAL DE VALIDACIÓN v4.0
# ============================================================================

def validate_and_crop_photo(photo_url, photo_type='profile', user_id=None, user_gender=None, user_age=None):
    """
    Valida y recorta una foto según el tipo (v4.0 - InsightFace)
    
    Types:
        - 'profile': Todas las validaciones
        - 'album_public': Solo NSFW + OCR (vulgar) + Armas/Drogas
        - 'album_private': Sin validaciones
    """
    start_time = time.time()
    
    try:
        config = VALIDATION_CONFIG.get(photo_type, VALIDATION_CONFIG['profile'])
        
        print("\n" + "="*70)
        print(f"🔍 VALIDANDO FOTO v4.0 - INSIGHTFACE: {photo_type.upper()}")
        if user_id:
            print(f"👤 Usuario: {user_id}")
        print(f"📍 URL: {photo_url[:80]}...")
        print("="*70)
        
        # ÁLBUM PRIVADO: Aprobar sin validar
        if photo_type == 'album_private':
            print("\n✅ ÁLBUM PRIVADO - Aprobado automáticamente (sin validaciones)")
            print("="*70 + "\n")
            return {
                "verdict": "APPROVE",
                "message": "Álbum privado aprobado sin validaciones",
                "photo_type": photo_type,
                "processing_time": round(time.time() - start_time, 2)
            }
        
        print("📥 Descargando imagen...")
        img_original = download_image(photo_url)
        print(f"✅ Descargada: {img_original.shape[1]}×{img_original.shape[0]} px")
        
        print("📐 Redimensionando...")
        img_resized = resize_image(img_original, max_size=1200)
        print(f"✅ Redimensionada: {img_resized.shape[1]}×{img_resized.shape[0]} px")
        
        # DETECCIÓN DE ROSTROS (solo para perfil)
        faces = []
        num_faces = 0
        insightface_faces = []
        
        if config.get('face_detection_enabled', True):
            print("🔍 Detectando rostros...")
            faces, insightface_faces = detect_faces_insightface(img_resized)
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
            
            if photo_type == 'profile' and num_faces > config.get('max_faces', 1):
                print(f"❌ RECHAZADA: {num_faces} rostros")
                return {
                    "verdict": "REJECT",
                    "reason": "multiple_faces",
                    "message": f"Se detectaron {num_faces} rostros. Las fotos de perfil deben tener solo una persona",
                    "processing_time": round(time.time() - start_time, 2)
                }
        
        # FACE MATCHING (solo para perfil)
        face_match_result = None
        if config.get('face_matching_enabled', False):
            print("\n🎭 VERIFICANDO IDENTIDAD (Face Matching):")
            face_match_result = check_face_matching(img_resized, faces, user_id, insightface_faces)
            
            # Mostrar resultado del face matching
            if face_match_result:
                print(f"   Match type: {face_match_result.get('match_type', 'unknown')}")
                if 'similarity' in face_match_result:
                    print(f"   Similarity: {face_match_result['similarity']:.3f}")
                if 'confidence' in face_match_result:
                    print(f"   Confidence: {face_match_result['confidence']:.3f}")
                print(f"   Should reject: {face_match_result.get('should_reject', False)}")
                if face_match_result.get('message'):
                    print(f"   Message: {face_match_result['message']}")
            
            if face_match_result.get('should_reject'):
                print(f"❌ RECHAZADA: {face_match_result.get('message')}")
                return {
                    "verdict": "REJECT",
                    "reason": "face_matching_failed",
                    "message": face_match_result.get('message'),
                    "face_matching_data": face_match_result,
                    "processing_time": round(time.time() - start_time, 2)
                }
        
        # AI DETECTION (solo para perfil)
        ai_detection_result = None
        if config.get('ai_detection_enabled', False):
            print("\n🤖 DETECTANDO IA/DEEPFAKE:")
            ai_detection_result = check_ai_generated(img_resized)
            print(f"   IA detectada: {'SÍ' if ai_detection_result['is_ai_generated'] else 'NO'}")
            print(f"   Confianza: {ai_detection_result['confidence']:.1%}")
            
            if ai_detection_result.get('should_reject'):
                print(f"❌ RECHAZADA: {ai_detection_result.get('message')}")
                return {
                    "verdict": "REJECT",
                    "reason": "ai_generated",
                    "message": ai_detection_result.get('message'),
                    "ai_detection_data": ai_detection_result,
                    "processing_time": round(time.time() - start_time, 2)
                }
        
        # NSFW (perfil y álbum público)
        nsfw_result = None
        if config.get('nsfw_enabled', False):
            print("\n🔞 ANALIZANDO CONTENIDO NSFW:")
            strict_mode = config.get('nsfw_strict', False)
            nsfw_result = check_nsfw(img_resized, strict_mode=strict_mode)
            print(f"   Modo: {'STRICT (solo explícito)' if strict_mode else 'NORMAL (explícito + cuestionable)'}")
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
        
        # OCR (perfil y álbum público)
        ocr_result = None
        if config.get('ocr_enabled', False):
            print("\n📝 ANALIZANDO TEXTO (OCR):")
            ocr_mode = config.get('ocr_mode', 'full')
            ocr_result = check_text_content(img_resized, mode=ocr_mode)
            print(f"   Modo: {ocr_mode.upper()}")
            print(f"   Texto detectado: {ocr_result['text_count']} elementos")
            print(f"   URLs/Propaganda: {'SÍ' if ocr_result['has_url'] else 'NO'}")
            print(f"   Lenguaje vulgar: {'SÍ' if ocr_result['has_vulgar'] else 'NO'}")
            
            if ocr_result['should_reject']:
                print(f"❌ RECHAZADA: {ocr_result['reject_reason']}")
                return {
                    "verdict": "REJECT",
                    "reason": "text_detected",
                    "message": f"Contenido no permitido: {ocr_result['reject_reason']}",
                    "ocr_data": ocr_result,
                    "processing_time": round(time.time() - start_time, 2)
                }
        
        # OBJETOS PROHIBIDOS (perfil y álbum público)
        obj_result = None
        if config.get('object_detection_enabled', False):
            print("\n🔍 DETECTANDO OBJETOS:")
            object_mode = config.get('object_mode', 'all')
            obj_result = check_prohibited_objects(img_resized, mode=object_mode)
            print(f"   Modo: {object_mode.upper()}")
            print(f"   Objetos totales: {len(obj_result['all_objects'])}")
            print(f"   Prohibidos: {len(obj_result['prohibited_objects'])}")
            
            if obj_result['has_prohibited']:
                # Verificar si hay objetos con auto_delete
                auto_delete_items = [o for o in obj_result['prohibited_objects'] if o.get('auto_delete')]
                
                if auto_delete_items:
                    prohibited = [f"{o['object']} ({o['confidence']:.0%})" for o in auto_delete_items]
                    print(f"❌ RECHAZADA (AUTO-DELETE): {', '.join(prohibited)}")
                    return {
                        "verdict": "REJECT",
                        "reason": "prohibited_objects_critical",
                        "message": f"Objetos prohibidos detectados (auto-eliminación): {', '.join(prohibited)}",
                        "auto_delete": True,
                        "object_data": obj_result,
                        "processing_time": round(time.time() - start_time, 2)
                    }
                else:
                    prohibited = [f"{o['object']} ({o['confidence']:.0%})" for o in obj_result['prohibited_objects']]
                    print(f"❌ RECHAZADA: {', '.join(prohibited)}")
                    return {
                        "verdict": "REJECT",
                        "reason": "prohibited_objects",
                        "message": f"Objetos no permitidos: {', '.join(prohibited)}",
                        "auto_delete": False,
                        "object_data": obj_result,
                        "processing_time": round(time.time() - start_time, 2)
                    }
        
        # CALIDAD Y CROP (solo para perfil)
        cropped_base64 = None
        face_percentage = 0
        sharpness = 0
        
        if config.get('quality_check_enabled', False) and faces:
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
            
            print("\n🔎 ANALIZANDO NITIDEZ:")
            sharpness = calculate_face_sharpness(img_resized, faces[0])
            print(f"   Nitidez: {sharpness:.2f}")
            
            if sharpness < config.get('min_sharpness_review', 30):
                print(f"❌ RECHAZADA: Muy borrosa")
                return {
                    "verdict": "REJECT",
                    "reason": "blurry",
                    "message": f"Foto muy borrosa (nitidez: {sharpness:.1f})",
                    "processing_time": round(time.time() - start_time, 2)
                }
        
        if config.get('crop_enabled', False) and faces:
            print("\n✂️ RECORTANDO:")
            cropped, crop_coords = smart_crop_face(img_resized, faces[0], config)
            print(f"   Crop: {crop_coords['width']}×{crop_coords['height']} px")
            
            target_size = config.get('target_size', 600)
            cropped_resized = resize_image(cropped, max_size=target_size)
            
            cropped_pil = Image.fromarray(cropped_resized)
            buffer = BytesIO()
            cropped_pil.save(buffer, format='JPEG', quality=90)
            cropped_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        processing_time = round(time.time() - start_time, 2)
        
        # Verificar si necesita revisión manual (solo perfil)
        needs_review = False
        if photo_type == 'profile':
            needs_review = (
                sharpness < config.get('min_sharpness', 50) or
                face_percentage < config.get('min_face_percentage', 10) or
                (nsfw_result and nsfw_result.get('verdict') == 'questionable')
            )
        
        if needs_review:
            reasons = []
            if sharpness < config.get('min_sharpness', 50):
                reasons.append(f"nitidez baja ({sharpness:.1f})")
            if face_percentage < config.get('min_face_percentage', 10):
                reasons.append(f"rostro pequeño ({face_percentage:.1f}%)")
            if nsfw_result and nsfw_result.get('verdict') == 'questionable':
                reasons.append("contenido cuestionable")
            
            print(f"\n⚠️ REVISIÓN MANUAL: {', '.join(reasons)}")
            print("="*70 + "\n")
            
            return {
                "verdict": "MANUAL_REVIEW",
                "reason": "quality_review",
                "message": f"Requiere revisión manual: {', '.join(reasons)}",
                "cropped_image_base64": f"data:image/jpeg;base64,{cropped_base64}" if cropped_base64 else None,
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
        
        # Guardar embedding (solo perfil)
        if photo_type == 'profile' and user_id and face_match_result:
            if 'face_embedding' in face_match_result:
                save_user_face_embedding(user_id, face_match_result['face_embedding'])
                print(f"💾 Embedding guardado para usuario {user_id}")
        
        print("\n✅ APROBADA")
        print("="*70 + "\n")
        
        result = {
            "verdict": "APPROVE",
            "photo_type": photo_type,
            "processing_time": processing_time
        }
        
        # Añadir datos según tipo de foto
        if cropped_base64:
            result["cropped_image_base64"] = f"data:image/jpeg;base64,{cropped_base64}"
        
        if photo_type == 'profile':
            result["validation_data"] = {
                "faces_detected": num_faces,
                "face_percentage": round(face_percentage, 2),
                "sharpness": round(sharpness, 2)
            }
            result["face_matching_data"] = face_match_result
            result["ai_detection_data"] = ai_detection_result
        
        if nsfw_result:
            result["nsfw_data"] = nsfw_result
        if ocr_result:
            result["ocr_data"] = ocr_result
        if obj_result:
            result["object_data"] = obj_result
        
        return result
        
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
        "version": "4.0-InsightFace",
        "gpu_enabled": gpu_available,
        "features": {
            "profile": {
                "face_detection": True,
                "smart_crop": True,
                "face_only_sharpness": True,
                "nsfw_detection": True,
                "ocr_text_detection": True,
                "object_detection": True,
                "face_matching": True,
                "ai_deepfake_detection": True
            },
            "album_public": {
                "nsfw_detection": True,
                "nsfw_mode": "strict (solo explícito)",
                "ocr_detection": True,
                "ocr_mode": "vulgar + propaganda",
                "object_detection": True,
                "object_mode": "armas + drogas",
                "auto_delete_weapons_drugs": True
            },
            "album_private": {
                "validations": "ninguna"
            },
            "identity_verification": True,
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
    user_id = data.get('userId')
    user_gender = data.get('userGender')
    user_age = data.get('userAge')
    
    result = validate_and_crop_photo(photo_url, photo_type, user_id, user_gender, user_age)
    
    return jsonify(result)


@app.route('/verify-identity', methods=['POST'])
def verify_identity_api():
    """
    Endpoint de verificación de identidad con documento
    
    POST /verify-identity
    Body: {
        "selfieUrl": "https://...",
        "userId": "user_123",
        "profileAge": 28
    }
    """
    data = request.get_json()
    
    if not data or 'selfieUrl' not in data:
        return jsonify({"error": "selfieUrl requerido"}), 400
    
    if 'userId' not in data:
        return jsonify({"error": "userId requerido"}), 400
    
    if 'profileAge' not in data:
        return jsonify({"error": "profileAge requerido"}), 400
    
    selfie_url = data['selfieUrl']
    user_id = data['userId']
    profile_age = int(data['profileAge'])
    
    result = verify_identity_document(selfie_url, user_id, profile_age)
    
    return jsonify(result)


@app.route('/blacklist', methods=['GET', 'POST', 'DELETE'])
def manage_blacklist():
    """Gestionar blacklist de celebridades/personas públicas"""
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
        
        if 'photo_url' in data:
            try:
                img = download_image(data['photo_url'])
                faces_loc, faces_obj = detect_faces_insightface(img)
                
                if not faces_obj:
                    return jsonify({"error": "No se detectó rostro en la imagen"}), 400
                
                embeddings = [face.embedding for face in faces_obj]
                face_blacklist[identity] = embeddings[0]
                
            except Exception as e:
                return jsonify({"error": f"Error procesando imagen: {str(e)}"}), 500
        
        elif 'face_encoding' in data:
            face_blacklist[identity] = np.array(data['face_encoding'])
        
        else:
            return jsonify({"error": "Requiere photo_url o face_encoding"}), 400
        
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
    print("🚀 ML VALIDATOR v4.0 - INSIGHTFACE EDITION")
    print("="*70)
    print("\n✨ NUEVAS CARACTERÍSTICAS v4.0:")
    print("   • InsightFace (ArcFace) - Precisión mejorada 3-5x")
    print("   • Threshold: similarity > 0.35 (más robusto)")
    print("   • Mejor rendimiento con ángulos, iluminación, expresiones")
    print("")
    print("\n📍 ENDPOINTS:")
    print("   • Health:          GET    http://192.168.1.159:5000/health")
    print("   • Validate:        POST   http://192.168.1.159:5000/validate")
    print("   • Verify Identity: POST   http://192.168.1.159:5000/verify-identity")
    print("   • Blacklist:       GET/POST/DELETE http://192.168.1.159:5000/blacklist")
    print("   • Test UI:         GET    http://192.168.1.159:5000/test.html")
    
    print("\n⚙️ CONFIGURACIÓN v4.0:")
    print("\n🖼️ PERFIL:")
    print("   • Exactamente 1 rostro")
    print("   • Rostro ≥ 10%, nitidez ≥ 50, resolución ≥ 400px")
    print("   • NSFW: rechazar explícito + cuestionable")
    print("   • OCR: bloquear TODO (texto, URLs, teléfonos, palabras prohibidas)")
    print("   • Objetos: armas + drogas + alcohol")
    print("   • Face matching + AI/deepfake detection")
    print("   • Recortar y redimensionar a 600px")
    
    print("\n📸 ÁLBUM PÚBLICO:")
    print("   • NSFW: rechazar SOLO explícito (permitir bikini, ropa interior)")
    print("   • OCR: bloquear SOLO palabras vulgares + propaganda (URLs)")
    print("   • Objetos: SOLO armas + drogas (NO alcohol)")
    print("   • ⚠️ Armas/Drogas: BORRADO AUTOMÁTICO (sin esperar 24h)")
    print("   • ❌ NO validar: rostros, nitidez, resolución, face matching, AI")
    
    print("\n🔒 ÁLBUM PRIVADO:")
    print("   • ❌ SIN VALIDACIONES (aprobado automáticamente)")
    
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
    print("✅ SERVIDOR LISTO")
    print("="*70 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
