#!/usr/bin/env python3
"""
Photo Processor con Polling - v3.5
===================================

Este script consulta Supabase cada 10 segundos buscando fotos
con status='processing' y las procesa automáticamente.

No requiere webhook ni exponer el servidor a Internet.
"""

import requests
import os
import time
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
ML_VALIDATOR_URL = os.getenv('ML_VALIDATOR_URL', 'http://localhost:5000')
POLL_INTERVAL = 10  # segundos

SUPABASE_HEADERS = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'Content-Type': 'application/json'
}

def get_processing_photos():
    """Obtiene fotos con status='processing'"""
    try:
        url = f"{SUPABASE_URL}/rest/v1/photos"
        params = {
            'status': 'eq.processing',
            'select': '*',
            'order': 'created_at.asc',
            'limit': '10'
        }
        
        response = requests.get(url, headers=SUPABASE_HEADERS, params=params)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Error obteniendo fotos: {e}")
        return []

def process_photo(photo):
    """Procesa una foto llamando al webhook local"""
    try:
        print(f"\n📸 Procesando foto: {photo['id']}")
        
        payload = {
            'photo_id': photo['id'],
            'user_id': photo['user_id'],
            'photo_type': photo['photo_type'],
            'album_type': photo.get('album_type', 'public'),
            'storage_path': photo['storage_path']
        }
        
        # Llamar al webhook LOCAL (mismo servidor)
        response = requests.post(
            'http://localhost:5001/webhook/photo-uploaded',
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Foto procesada: {result.get('verdict')}")
            return True
        else:
            print(f"❌ Error procesando foto: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("\n" + "="*70)
    print("🔄 PHOTO PROCESSOR - POLLING MODE")
    print("="*70)
    print(f"\n📍 Configuración:")
    print(f"   • Supabase: {SUPABASE_URL}")
    print(f"   • ML Validator: {ML_VALIDATOR_URL}")
    print(f"   • Intervalo: {POLL_INTERVAL}s")
    print(f"\n⏳ Esperando fotos...\n")
    print("="*70 + "\n")
    
    processed_count = 0
    
    while True:
        try:
            photos = get_processing_photos()
            
            if photos:
                print(f"\n📥 Encontradas {len(photos)} fotos pendientes")
                
                for photo in photos:
                    if process_photo(photo):
                        processed_count += 1
                        print(f"📊 Total procesadas: {processed_count}")
                
                print(f"\n⏰ Esperando {POLL_INTERVAL}s...\n")
            
            time.sleep(POLL_INTERVAL)
            
        except KeyboardInterrupt:
            print("\n\n🛑 Deteniendo processor...")
            print(f"📊 Total fotos procesadas: {processed_count}")
            break
        except Exception as e:
            print(f"❌ Error general: {e}")
            time.sleep(POLL_INTERVAL)

if __name__ == '__main__':
    main()
