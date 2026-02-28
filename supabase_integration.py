#!/usr/bin/env python3
"""
Supabase Integration Helper
============================

Este script se ejecuta junto con el ML Validator para:
1. Recibir webhooks de Supabase cuando hay fotos nuevas
2. Procesar las fotos
3. Devolver resultados a Supabase
4. Borrar archivos temporales inmediatamente

Uso:
    python supabase_integration.py

El servidor escuchará en el puerto 5001 (separado del ML Validator en 5000)
"""

from flask import Flask, request, jsonify
import requests
import tempfile
import os
from datetime import datetime
import json

app = Flask(__name__)

# Configuración
ML_VALIDATOR_URL = "http://localhost:5000"
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://tu-proyecto.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "service": "supabase-integration",
        "ml_validator_url": ML_VALIDATOR_URL,
        "supabase_url": SUPABASE_URL
    })


@app.route('/webhook/photo-uploaded', methods=['POST'])
def webhook_photo_uploaded():
    """
    Webhook que recibe notificaciones cuando se sube una nueva foto
    
    Request body:
    {
        "type": "INSERT",
        "table": "photos",
        "record": {
            "id": "uuid",
            "user_id": "uuid",
            "photo_type": "profile",
            "storage_path": "user_id/photo_id.jpg",
            "status": "pending"
        },
        "old_record": null
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'record' not in data:
            return jsonify({"error": "Invalid webhook payload"}), 400
        
        record = data['record']
        photo_id = record.get('id')
        user_id = record.get('user_id')
        photo_type = record.get('photo_type')
        storage_path = record.get('storage_path')
        
        print(f"\n{'='*70}")
        print(f"📨 WEBHOOK RECIBIDO")
        print(f"   Foto ID: {photo_id}")
        print(f"   Usuario: {user_id}")
        print(f"   Tipo: {photo_type}")
        print(f"{'='*70}\n")
        
        # 1. Actualizar estado a 'processing'
        update_photo_status(photo_id, 'processing')
        
        # 2. Obtener URL de la foto desde Supabase Storage
        photo_url = get_signed_url(storage_path)
        
        if not photo_url:
            update_photo_status(photo_id, 'rejected', "Error obteniendo URL de la foto")
            return jsonify({"error": "Could not get photo URL"}), 500
        
        # 3. Obtener información del usuario
        user_info = get_user_profile(user_id)
        
        # 4. Validar foto con ML Validator
        print(f"🤖 Llamando a ML Validator...")
        validation_result = validate_photo(
            photo_url,
            photo_type,
            user_id,
            user_info.get('age'),
            user_info.get('gender')
        )
        
        print(f"✅ Resultado: {validation_result.get('verdict')}")
        
        # 5. Procesar resultado
        verdict = validation_result.get('verdict')
        
        if verdict == 'APPROVE':
            # Subir imagen recortada si existe
            cropped_url = None
            if 'cropped_image_base64' in validation_result:
                cropped_url = upload_cropped_image(
                    validation_result['cropped_image_base64'],
                    user_id,
                    photo_id,
                    photo_type
                )
            
            # Actualizar a 'approved'
            update_photo_status(
                photo_id,
                'approved',
                validation_result=validation_result,
                cropped_url=cropped_url
            )
            
        elif verdict == 'MANUAL_REVIEW':
            # Requiere revisión manual
            update_photo_status(
                photo_id,
                'manual_review',
                validation_result.get('message'),
                validation_result
            )
            
        else:  # REJECT o ERROR
            # Rechazar
            update_photo_status(
                photo_id,
                'rejected',
                validation_result.get('message'),
                validation_result
            )
        
        print(f"\n✅ Webhook procesado exitosamente\n")
        
        return jsonify({
            "success": True,
            "photo_id": photo_id,
            "status": verdict.lower()
        })
        
    except Exception as e:
        print(f"\n❌ Error procesando webhook: {e}\n")
        return jsonify({"error": str(e)}), 500


def get_signed_url(storage_path):
    """Obtiene URL firmada desde Supabase Storage"""
    try:
        url = f"{SUPABASE_URL}/storage/v1/object/sign/photos-pending/{storage_path}"
        
        response = requests.post(
            url,
            headers={
                'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
                'apikey': SUPABASE_SERVICE_KEY
            },
            json={'expiresIn': 3600}  # 1 hora
        )
        
        if response.status_code == 200:
            data = response.json()
            signed_path = data.get('signedURL')
            return f"{SUPABASE_URL}/storage/v1{signed_path}"
        else:
            print(f"⚠️ Error obteniendo signed URL: {response.text}")
            return None
            
    except Exception as e:
        print(f"⚠️ Error en get_signed_url: {e}")
        return None


def get_user_profile(user_id):
    """Obtiene información del perfil del usuario"""
    try:
        url = f"{SUPABASE_URL}/rest/v1/user_profiles"
        
        response = requests.get(
            url,
            headers={
                'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
                'apikey': SUPABASE_SERVICE_KEY
            },
            params={'id': f'eq.{user_id}', 'select': 'age,gender'}
        )
        
        if response.status_code == 200:
            data = response.json()
            return data[0] if data else {}
        else:
            return {}
            
    except Exception as e:
        print(f"⚠️ Error obteniendo perfil: {e}")
        return {}


def validate_photo(photo_url, photo_type, user_id, user_age=None, user_gender=None):
    """Llama al ML Validator para validar la foto"""
    try:
        response = requests.post(
            f"{ML_VALIDATOR_URL}/validate",
            json={
                'photoUrl': photo_url,
                'type': photo_type,
                'userId': user_id,
                'userAge': user_age,
                'userGender': user_gender
            },
            timeout=60  # 60 segundos de timeout
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            return {
                'verdict': 'ERROR',
                'message': f'Error del ML Validator: {response.status_code}'
            }
            
    except Exception as e:
        return {
            'verdict': 'ERROR',
            'message': f'Error llamando al ML Validator: {str(e)}'
        }


def upload_cropped_image(base64_data, user_id, photo_id, photo_type):
    """Sube la imagen recortada a Supabase Storage"""
    try:
        import base64
        
        # Extraer datos base64
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
        
        # Decodificar
        image_data = base64.b64decode(base64_data)
        
        # Crear ruta
        storage_path = f"{user_id}/{photo_type}/{photo_id}_cropped.jpg"
        
        # Subir a Supabase Storage
        url = f"{SUPABASE_URL}/storage/v1/object/photos-cropped/{storage_path}"
        
        response = requests.post(
            url,
            headers={
                'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
                'apikey': SUPABASE_SERVICE_KEY,
                'Content-Type': 'image/jpeg'
            },
            data=image_data
        )
        
        if response.status_code in [200, 201]:
            # Retornar URL pública
            return f"{SUPABASE_URL}/storage/v1/object/public/photos-cropped/{storage_path}"
        else:
            print(f"⚠️ Error subiendo imagen recortada: {response.text}")
            return None
            
    except Exception as e:
        print(f"⚠️ Error en upload_cropped_image: {e}")
        return None


def update_photo_status(photo_id, status, rejection_reason=None, validation_result=None, cropped_url=None):
    """Actualiza el estado de la foto en Supabase"""
    try:
        url = f"{SUPABASE_URL}/rest/v1/photos"
        
        update_data = {
            'status': status,
            'processed_at': datetime.utcnow().isoformat()
        }
        
        if rejection_reason:
            update_data['rejection_reason'] = rejection_reason
        
        if validation_result:
            update_data['validation_result'] = validation_result
        
        if cropped_url:
            update_data['cropped_url'] = cropped_url
        
        if status == 'approved':
            update_data['approved_at'] = datetime.utcnow().isoformat()
            update_data['is_visible'] = True
        elif status == 'rejected':
            update_data['rejected_at'] = datetime.utcnow().isoformat()
        
        response = requests.patch(
            url,
            headers={
                'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
                'apikey': SUPABASE_SERVICE_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            params={'id': f'eq.{photo_id}'},
            json=update_data
        )
        
        if response.status_code in [200, 204]:
            print(f"✅ Foto {photo_id} actualizada a: {status}")
            return True
        else:
            print(f"⚠️ Error actualizando foto: {response.text}")
            return False
            
    except Exception as e:
        print(f"⚠️ Error en update_photo_status: {e}")
        return False


if __name__ == '__main__':
    print("\n" + "="*70)
    print("🔗 SUPABASE INTEGRATION SERVICE")
    print("="*70)
    print(f"\n📍 Webhook endpoint:")
    print(f"   POST http://192.168.1.159:5001/webhook/photo-uploaded")
    print(f"\n🔧 Configuration:")
    print(f"   ML Validator: {ML_VALIDATOR_URL}")
    print(f"   Supabase URL: {SUPABASE_URL}")
    print(f"   Service Key: {'✅ Configurado' if SUPABASE_SERVICE_KEY else '❌ NO configurado'}")
    print("="*70 + "\n")
    
    if not SUPABASE_SERVICE_KEY:
        print("⚠️ WARNING: SUPABASE_SERVICE_KEY no está configurado")
        print("   Usa: export SUPABASE_SERVICE_KEY='tu-service-key'\n")
    
    app.run(host='0.0.0.0', port=5001, debug=False, threaded=True)
