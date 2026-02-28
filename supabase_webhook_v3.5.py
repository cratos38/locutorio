#!/usr/bin/env python3
"""
Supabase Webhook v3.5 - Integración con ML Validator
=====================================================

Este webhook escucha eventos de Supabase cuando se sube una foto
y llama al ML Validator para procesarla.

Puerto: 5001
Endpoints:
  - POST /webhook/photo-uploaded
  - GET /health

Flujo:
1. Usuario sube foto → Supabase Storage
2. Supabase INSERT en tabla photos → Trigger cambia status a 'processing'
3. Supabase llama a este webhook con datos de la foto
4. Webhook descarga URL pública de Supabase
5. Webhook llama a ML Validator (puerto 5000)
6. Webhook actualiza tabla photos con resultado
7. Trigger de Supabase envía notificación al usuario
"""

from flask import Flask, request, jsonify
import requests
import os
from dotenv import load_dotenv
import traceback
import time
from datetime import datetime, timedelta

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')  # Service role key (acceso completo)
ML_VALIDATOR_URL = os.getenv('ML_VALIDATOR_URL', 'http://localhost:5000')

# Verificar configuración
if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("⚠️ ERROR: Variables de entorno faltantes!")
    print("   Crea un archivo .env con:")
    print("   SUPABASE_URL=https://tu-proyecto.supabase.co")
    print("   SUPABASE_SERVICE_KEY=tu_service_role_key")
    print("   ML_VALIDATOR_URL=http://localhost:5000")
    exit(1)

# Headers para Supabase
SUPABASE_HEADERS = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'Content-Type': 'application/json'
}


# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

def get_photo_data(photo_id):
    """Obtiene datos de la foto desde Supabase"""
    try:
        url = f"{SUPABASE_URL}/rest/v1/photos"
        params = {
            'id': f'eq.{photo_id}',
            'select': '*'
        }
        
        response = requests.get(url, headers=SUPABASE_HEADERS, params=params)
        response.raise_for_status()
        
        data = response.json()
        if not data:
            return None
        
        return data[0]
    
    except Exception as e:
        print(f"❌ Error obteniendo datos de foto {photo_id}: {e}")
        return None


def get_user_profile(user_id):
    """Obtiene perfil del usuario desde Supabase"""
    try:
        url = f"{SUPABASE_URL}/rest/v1/user_profiles"
        params = {
            'id': f'eq.{user_id}',
            'select': 'age,gender'
        }
        
        response = requests.get(url, headers=SUPABASE_HEADERS, params=params)
        response.raise_for_status()
        
        data = response.json()
        if not data:
            return {}
        
        return data[0]
    
    except Exception as e:
        print(f"⚠️ Error obteniendo perfil de usuario {user_id}: {e}")
        return {}


def get_storage_url(bucket, path):
    """Genera URL pública de Supabase Storage"""
    # Para buckets públicos
    if bucket in ['photos-approved', 'photos-cropped']:
        return f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}"
    
    # Para buckets privados, generar URL temporal (válida por 1 hora)
    try:
        url = f"{SUPABASE_URL}/storage/v1/object/sign/{bucket}/{path}"
        payload = {
            'expiresIn': 3600  # 1 hora
        }
        
        response = requests.post(url, headers=SUPABASE_HEADERS, json=payload)
        response.raise_for_status()
        
        data = response.json()
        signed_url = f"{SUPABASE_URL}/storage/v1{data['signedURL']}"
        
        return signed_url
    
    except Exception as e:
        print(f"⚠️ Error generando URL temporal: {e}")
        return None


def update_photo_status(photo_id, status, validation_result=None, rejection_reason=None, auto_delete=False, cropped_url=None, storage_url=None, thumbnail_url=None):
    """Actualiza estado de la foto en Supabase"""
    try:
        url = f"{SUPABASE_URL}/rest/v1/photos"
        params = {'id': f'eq.{photo_id}'}
        
        payload = {
            'status': status,
            'processed_at': datetime.utcnow().isoformat()
        }
        
        if status == 'approved':
            payload['approved_at'] = datetime.utcnow().isoformat()
            payload['is_visible'] = True
        elif status == 'rejected':
            payload['rejected_at'] = datetime.utcnow().isoformat()
            payload['auto_delete'] = auto_delete
            if rejection_reason:
                payload['rejection_reason'] = rejection_reason
        
        if validation_result:
            payload['validation_result'] = validation_result
        
        if cropped_url:
            payload['cropped_url'] = cropped_url
        
        if storage_url:
            payload['storage_url'] = storage_url
        
        if thumbnail_url:
            payload['thumbnail_url'] = thumbnail_url
        
        response = requests.patch(url, headers=SUPABASE_HEADERS, params=params, json=payload)
        response.raise_for_status()
        
        return True
    
    except Exception as e:
        print(f"❌ Error actualizando foto {photo_id}: {e}")
        return False


def move_photo_to_approved(storage_path):
    """Mueve todas las versiones de una foto de photos-pending a photos-approved"""
    try:
        print(f"📦 Moviendo foto de pending a approved...")
        print(f"   Path: {storage_path}")
        
        # Extraer base name sin extensión
        base_path = storage_path.rsplit('.', 1)[0]  # "admin/1234"
        ext = storage_path.rsplit('.', 1)[1]  # "jpg"
        
        # Versiones a mover
        versions = [
            storage_path,  # admin/1234.jpg (original)
            f"{base_path}_medium.{ext}",  # admin/1234_medium.jpg
            f"{base_path}_thumbnail.{ext}"  # admin/1234_thumbnail.jpg
        ]
        
        moved_urls = {}
        
        for version_path in versions:
            try:
                # 1. Descargar de photos-pending
                download_url = f"{SUPABASE_URL}/storage/v1/object/photos-pending/{version_path}"
                download_response = requests.get(download_url, headers=SUPABASE_HEADERS)
                download_response.raise_for_status()
                file_data = download_response.content
                
                # 2. Subir a photos-approved
                upload_url = f"{SUPABASE_URL}/storage/v1/object/photos-approved/{version_path}"
                headers = SUPABASE_HEADERS.copy()
                headers['Content-Type'] = 'image/jpeg'
                upload_response = requests.post(upload_url, headers=headers, data=file_data)
                upload_response.raise_for_status()
                
                # 3. Borrar de photos-pending
                delete_url = f"{SUPABASE_URL}/storage/v1/object/photos-pending/{version_path}"
                delete_response = requests.delete(delete_url, headers=SUPABASE_HEADERS)
                delete_response.raise_for_status()
                
                # Guardar nueva URL pública
                new_url = f"{SUPABASE_URL}/storage/v1/object/public/photos-approved/{version_path}"
                if '_medium' in version_path:
                    moved_urls['cropped_url'] = new_url
                elif '_thumbnail' in version_path:
                    moved_urls['thumbnail_url'] = new_url
                else:
                    moved_urls['storage_url'] = new_url
                
                print(f"   ✅ Movida: {version_path}")
                
            except Exception as e:
                print(f"   ⚠️ Error moviendo {version_path}: {e}")
        
        return moved_urls
        
    except Exception as e:
        print(f"❌ Error moviendo foto: {e}")
        return {}


def save_cropped_image(photo_id, user_id, cropped_base64):
    """Guarda imagen recortada en Supabase Storage"""
    try:
        import base64
        from io import BytesIO
        
        # Remover prefijo data:image/jpeg;base64,
        if ',' in cropped_base64:
            cropped_base64 = cropped_base64.split(',')[1]
        
        # Decodificar
        image_data = base64.b64decode(cropped_base64)
        
        # Generar path
        filename = f"{user_id}/{photo_id}_cropped.jpg"
        
        # Subir a Storage
        url = f"{SUPABASE_URL}/storage/v1/object/photos-cropped/{filename}"
        
        headers = SUPABASE_HEADERS.copy()
        headers['Content-Type'] = 'image/jpeg'
        
        response = requests.post(url, headers=headers, data=image_data)
        response.raise_for_status()
        
        # Retornar URL pública
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/photos-cropped/{filename}"
        
        return public_url
    
    except Exception as e:
        print(f"⚠️ Error guardando imagen recortada: {e}")
        return None


def validate_photo_with_ml(photo_url, photo_type, album_type, user_id, user_age, user_gender):
    """Llama al ML Validator para validar la foto"""
    try:
        # Determinar tipo para el ML Validator
        if photo_type == 'profile':
            ml_type = 'profile'
        elif photo_type == 'verification':
            ml_type = 'profile'  # Usar validación de perfil
        elif photo_type == 'album':
            if album_type == 'private':
                ml_type = 'album_private'
            else:
                ml_type = 'album_public'
        else:
            ml_type = 'profile'
        
        print(f"📤 Llamando a ML Validator:")
        print(f"   URL: {ML_VALIDATOR_URL}/validate")
        print(f"   Tipo: {ml_type}")
        print(f"   Usuario: {user_id}")
        
        payload = {
            'photoUrl': photo_url,
            'type': ml_type,
            'userId': user_id
        }
        
        if user_age:
            payload['userAge'] = user_age
        if user_gender:
            payload['userGender'] = user_gender
        
        response = requests.post(
            f"{ML_VALIDATOR_URL}/validate",
            json=payload,
            timeout=30  # 30 segundos timeout
        )
        
        response.raise_for_status()
        result = response.json()
        
        print(f"✅ ML Validator respondió: {result.get('verdict')}")
        
        return result
    
    except requests.Timeout:
        print("⏱️ Timeout llamando al ML Validator")
        return {
            'verdict': 'ERROR',
            'reason': 'timeout',
            'message': 'El procesamiento tomó demasiado tiempo'
        }
    except Exception as e:
        print(f"❌ Error llamando al ML Validator: {e}")
        print(traceback.format_exc())
        return {
            'verdict': 'ERROR',
            'reason': 'ml_error',
            'message': str(e)
        }


# ============================================================================
# RUTAS
# ============================================================================

@app.route('/health', methods=['GET'])
def health():
    """Health check del webhook"""
    return jsonify({
        'status': 'ok',
        'service': 'supabase-webhook',
        'version': '3.5',
        'ml_validator_url': ML_VALIDATOR_URL,
        'supabase_url': SUPABASE_URL,
        'timestamp': datetime.utcnow().isoformat()
    })


@app.route('/webhook/photo-uploaded', methods=['POST'])
def photo_uploaded():
    """
    Webhook llamado cuando se sube una nueva foto
    
    Payload esperado:
    {
        "photo_id": "uuid",
        "user_id": "uuid",
        "photo_type": "profile | album | verification",
        "album_type": "public | private",
        "storage_path": "ruta/en/storage"
    }
    """
    start_time = time.time()
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        photo_id = data.get('photo_id')
        user_id = data.get('user_id')
        photo_type = data.get('photo_type', 'profile')
        album_type = data.get('album_type', 'public')
        storage_path = data.get('storage_path')
        
        if not photo_id or not user_id or not storage_path:
            return jsonify({
                'error': 'Missing required fields',
                'required': ['photo_id', 'user_id', 'storage_path']
            }), 400
        
        print("\n" + "="*70)
        print(f"📸 NUEVA FOTO SUBIDA")
        print(f"   ID: {photo_id}")
        print(f"   Usuario: {user_id}")
        print(f"   Tipo: {photo_type} ({album_type if photo_type == 'album' else 'N/A'})")
        print(f"   Path: {storage_path}")
        print("="*70)
        
        # 1. Obtener datos adicionales de la foto
        photo_data = get_photo_data(photo_id)
        if not photo_data:
            print(f"❌ No se encontró la foto {photo_id}")
            return jsonify({'error': 'Photo not found'}), 404
        
        # 2. Obtener perfil del usuario
        user_profile = get_user_profile(user_id)
        user_age = user_profile.get('age')
        user_gender = user_profile.get('gender')
        
        # 3. Generar URL para el ML Validator
        print("\n🔗 Generando URL de storage...")
        bucket = 'photos-pending'
        photo_url = get_storage_url(bucket, storage_path)
        
        if not photo_url:
            print("❌ Error generando URL")
            update_photo_status(photo_id, 'rejected', rejection_reason='Error generando URL de storage')
            return jsonify({'error': 'Failed to generate storage URL'}), 500
        
        print(f"✅ URL generada: {photo_url[:80]}...")
        
        # 4. Álbumes privados: Aprobar sin validar
        if photo_type == 'album' and album_type == 'private':
            print("\n✅ ÁLBUM PRIVADO - Aprobado automáticamente")
            update_photo_status(photo_id, 'approved')
            
            processing_time = round(time.time() - start_time, 2)
            print(f"\n⏱️ Procesamiento completado en {processing_time}s")
            print("="*70 + "\n")
            
            return jsonify({
                'success': True,
                'photo_id': photo_id,
                'verdict': 'APPROVE',
                'message': 'Álbum privado aprobado sin validaciones',
                'processing_time': processing_time
            })
        
        # 5. Validar con ML Validator
        print("\n🤖 Validando con ML Validator...")
        ml_result = validate_photo_with_ml(
            photo_url,
            photo_type,
            album_type,
            user_id,
            user_age,
            user_gender
        )
        
        verdict = ml_result.get('verdict')
        print(f"\n📊 Resultado: {verdict}")
        
        # 6. Procesar resultado
        if verdict == 'APPROVE':
            # Mover foto de photos-pending a photos-approved
            print("📦 Moviendo foto a photos-approved...")
            moved_urls = move_photo_to_approved(storage_path)
            
            if moved_urls:
                # Actualizar foto con nuevas URLs públicas
                update_photo_status(
                    photo_id,
                    'approved',
                    validation_result=ml_result,
                    cropped_url=moved_urls.get('cropped_url'),
                    storage_url=moved_urls.get('storage_url'),
                    thumbnail_url=moved_urls.get('thumbnail_url')
                )
                print("✅ FOTO APROBADA Y MOVIDA A BUCKET PÚBLICO")
            else:
                # Si falla el movimiento, al menos aprobar
                update_photo_status(
                    photo_id,
                    'approved',
                    validation_result=ml_result
                )
                print("⚠️ FOTO APROBADA (pero no se pudo mover)")
        
        elif verdict == 'REJECT':
            # Verificar si es auto-delete (armas/drogas)
            auto_delete = ml_result.get('auto_delete', False)
            rejection_reason = ml_result.get('message', ml_result.get('reason', 'Motivo no especificado'))
            
            if auto_delete:
                print(f"🗑️ AUTO-DELETE: {rejection_reason}")
            else:
                print(f"❌ RECHAZADA: {rejection_reason}")
            
            update_photo_status(
                photo_id,
                'rejected',
                validation_result=ml_result,
                rejection_reason=rejection_reason,
                auto_delete=auto_delete
            )
        
        elif verdict == 'MANUAL_REVIEW':
            print("⚠️ REQUIERE REVISIÓN MANUAL")
            
            # Guardar imagen recortada si está disponible
            cropped_url = None
            if 'cropped_image_base64' in ml_result:
                cropped_url = save_cropped_image(
                    photo_id,
                    user_id,
                    ml_result['cropped_image_base64']
                )
            
            update_photo_status(
                photo_id,
                'manual_review',
                validation_result=ml_result,
                cropped_url=cropped_url
            )
        
        else:  # ERROR
            print(f"❌ ERROR: {ml_result.get('message', 'Unknown error')}")
            update_photo_status(
                photo_id,
                'rejected',
                validation_result=ml_result,
                rejection_reason=f"Error de procesamiento: {ml_result.get('message', 'Unknown')}"
            )
        
        processing_time = round(time.time() - start_time, 2)
        print(f"\n⏱️ Procesamiento completado en {processing_time}s")
        print("="*70 + "\n")
        
        return jsonify({
            'success': True,
            'photo_id': photo_id,
            'verdict': verdict,
            'auto_delete': ml_result.get('auto_delete', False),
            'processing_time': processing_time
        })
    
    except Exception as e:
        print(f"\n❌ ERROR GENERAL: {str(e)}")
        print(traceback.format_exc())
        print("="*70 + "\n")
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================================================
# INICIO DEL SERVIDOR
# ============================================================================

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🔗 SUPABASE WEBHOOK v3.5")
    print("="*70)
    print(f"\n📍 Configuración:")
    print(f"   • Puerto: 5001")
    print(f"   • Supabase: {SUPABASE_URL}")
    print(f"   • ML Validator: {ML_VALIDATOR_URL}")
    
    print(f"\n🌐 Endpoints:")
    print(f"   • Health:  GET  http://0.0.0.0:5001/health")
    print(f"   • Webhook: POST http://0.0.0.0:5001/webhook/photo-uploaded")
    
    print(f"\n💡 Para llamar desde Supabase:")
    print(f"   curl -X POST http://192.168.1.159:5001/webhook/photo-uploaded \\")
    print(f"     -H 'Content-Type: application/json' \\")
    print(f"     -d '{{")
    print(f"       \"photo_id\": \"uuid\",")
    print(f"       \"user_id\": \"uuid\",")
    print(f"       \"photo_type\": \"profile\",")
    print(f"       \"album_type\": \"public\",")
    print(f"       \"storage_path\": \"user_id/filename.jpg\"")
    print(f"     }}'")
    
    print("\n" + "="*70)
    print("✅ WEBHOOK LISTO")
    print("="*70 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=False, threaded=True)
