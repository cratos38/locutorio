import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

headers = {
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'apikey': SUPABASE_SERVICE_KEY
}

# Listar archivos en photos-pending/admin
url = f"{SUPABASE_URL}/storage/v1/object/list/photos-pending"
params = {'prefix': 'admin/'}

response = requests.post(url, headers=headers, json=params)
if response.status_code == 200:
    files = response.json()
    print(f"✅ Archivos en photos-pending/admin: {len(files)}")
    for f in files[:10]:
        print(f"  - {f['name']}")
else:
    print(f"❌ Error: {response.status_code} - {response.text}")
