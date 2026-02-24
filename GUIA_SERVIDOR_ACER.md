# 🚀 GUÍA PARA CONVERTIR TU ACER EN SERVIDOR

**IMPORTANTE:** Esta guía es para DESPUÉS, cuando tengas 50+ usuarios/día

---

## 📦 PASO 1: PREPARACIÓN (lo que necesitas)

### Materiales:
- [x] Tu notebook Acer i7 + 16GB RAM
- [x] Teclado USB
- [x] Cable de corriente
- [ ] USB de 4GB mínimo (para instalación)
- [x] Otro PC para descargar Ubuntu
- [x] Router con WiFi (o puerto ethernet)

### ⚠️ PROBLEMA DE TU NOTEBOOK:
```
Tu Acer NO tiene batería →
BIOS no guarda configuración →
Cada vez que se va la luz vuelve a UEFI por defecto

Windows actual:
- Instalado en Legacy mode
- NO arranca si BIOS está en UEFI
- Tienes que cambiar a Legacy manualmente

SOLUCIÓN:
- Instalar Ubuntu en modo UEFI
- Arrancará automáticamente después de corte de luz
- Sin tocar BIOS nunca más ✅
```

### Antes de empezar:
1. Respaldar TODO lo importante del notebook (Windows se borrará)
2. Anotar nombre y contraseña de tu WiFi
3. Descargar Ubuntu Server desde otro PC
4. Crear USB booteable con Rufus (modo UEFI/GPT)

---

## 💿 PASO 2: DESCARGAR UBUNTU SERVER

### Desde OTRO PC:

1. Ve a: https://ubuntu.com/download/server
2. Click en **"Download Ubuntu Server 22.04 LTS"**
3. Espera a que descargue (~2 GB, toma 10-20 minutos)
4. Guarda el archivo: `ubuntu-22.04.4-live-server-amd64.iso`

---

## 🔧 PASO 3: CREAR USB BOOTEABLE

### En el MISMO PC donde descargaste Ubuntu:

1. **Descargar Rufus:**
   - Ve a: https://rufus.ie/
   - Click en **"Rufus 4.x Portable"**
   - Ejecuta `rufus-4.x.exe`

2. **Conectar USB al PC**
   - Inserta el USB (se borrará TODO lo que tenga)

3. **Configurar Rufus:**
   ```
   Dispositivo: [Tu USB]
   Elección de arranque: [Click en SELECCIONAR]
     → Buscar y elegir: ubuntu-22.04.4-live-server-amd64.iso
   
   ⚠️ IMPORTANTE (para que funcione con UEFI):
   Esquema de partición: GPT              ← IMPORTANTE
   Sistema destino: UEFI (no CSM)         ← IMPORTANTE
   
   [Dejar todo lo demás por defecto]
   
   Click en EMPEZAR
   ```
   
   **¿Por qué GPT/UEFI?**
   - Tu notebook pierde la configuración BIOS sin batería
   - Siempre vuelve a UEFI por defecto
   - Si instalamos en UEFI, arrancará automáticamente
   - Sin necesidad de cambiar nada en BIOS ✅

4. **Esperar:**
   - Toma 5-10 minutos
   - Cuando diga "LISTO", cerrar Rufus

---

## 🔌 PASO 4: PREPARAR EL ACER

### En tu notebook Acer:

1. **Cerrar todos los programas**
2. **Conectar:**
   - ✅ Cable de corriente (OBLIGATORIO - siempre enchufado)
   - ✅ Teclado USB
   - ✅ Cable ethernet al router (RECOMENDADO)
   - ✅ Monitor (si tienes, si no usa el del notebook)
   - ✅ USB booteable que creaste

3. **Configurar Windows antes de borrar:**
   ```
   Panel de Control → Opciones de energía
   → Elegir el comportamiento al cerrar la tapa
   → Al cerrar la tapa: "No hacer nada"
   
   [ESTO ES IMPORTANTE - Apúntalo para después]
   ```

---

## 💻 PASO 5: INSTALAR UBUNTU SERVER

### Arrancar desde USB:

1. **Apagar el notebook completamente**
2. **Encenderlo y presionar F2 o F12 repetidamente**
   - (Depende del modelo, puede ser F2, F12, Del o Esc)
   - Verás un menú azul o negro (BIOS/Boot Menu)

3. **En el BIOS/Boot Menu:**
   ```
   Buscar algo que diga:
   - "Boot Order" o "Orden de arranque"
   - "Boot Menu" o "Menú de inicio"
   
   Seleccionar: USB Device / USB Storage / [Nombre de tu USB]
   
   Presionar Enter
   ```

4. **Instalación Ubuntu (PASO A PASO):**

   **Pantalla 1 - Idioma:**
   ```
   Use las flechas ↑↓ para elegir: English
   [Enter]
   ```

   **Pantalla 2 - Actualizar instalador:**
   ```
   Si pregunta actualizar: elegir "Continue without updating"
   [Enter]
   ```

   **Pantalla 3 - Teclado:**
   ```
   Layout: Spanish
   Variant: Spanish
   [Done] (presiona Tab hasta llegar, luego Enter)
   ```

   **Pantalla 4 - Tipo de instalación:**
   ```
   Elegir: Ubuntu Server (sin la opción minimized)
   [Done]
   ```

   **Pantalla 5 - Configuración de red:**
   ```
   OPCIÓN A - Si tienes cable ethernet:
     Dirá "DHCPv4 [dirección IP]"
     [Done]
   
   OPCIÓN B - Si usas WiFi (tu caso):
     1. Verás: "wlan0 not connected"
     2. Presiona Tab hasta llegar a "wlan0"
     3. Presiona Enter
     4. Selecciona tu red WiFi (usa flechas ↑↓)
     5. Presiona Enter
     6. Te pedirá la contraseña del WiFi
     7. Escribe la contraseña
     8. Presiona Enter
     9. Espera unos segundos hasta que diga:
        "wlan0 DHCPv4 [dirección IP]"
   
   [Done]
   ```
   
   **⚠️ IMPORTANTE:**
   - Anota el nombre de tu WiFi antes de empezar
   - Anota la contraseña (la necesitarás aquí)
   - El WiFi es suficientemente rápido para el servidor ✅

   **Pantalla 6 - Proxy:**
   ```
   Dejar en blanco (sin escribir nada)
   [Done]
   ```

   **Pantalla 7 - Mirror:**
   ```
   Dejar el que aparece por defecto
   [Done]
   ```

   **Pantalla 8 - DISCOS (IMPORTANTE):**
   ```
   Elegir: "Use an entire disk"
   
   Seleccionar el disco que aparezca:
   - Probablemente verás algo como:
     "local disk 256.060 GB SSD"
   
   [ ] Set up this disk as an LVM group (NO marcar esto)
   
   [Done]
   
   Te mostrará un resumen (UEFI/GPT):
   PARTITION       SIZE        TYPE       MOUNT
   /dev/sda1       512M        efi        /boot/efi  ← Partición UEFI
   /dev/sda2       255.5 GB    ext4       /          ← Sistema
   
   ⚠️ Si NO ves la línea "/boot/efi" es porque el USB
      no se creó correctamente en modo UEFI.
      Debes reiniciar y crear USB de nuevo con GPT/UEFI.
   
   [Done]
   
   Confirmar:
   "Confirm destructive action" (va a BORRAR Windows)
   "Continue"
   ```
   
   **Lo que va a pasar:**
   - Windows 10 se borrará completamente ✅
   - Ubuntu usará TODO el disco (256 GB) ✅
   - Instalación en modo UEFI ✅
   - Arrancará automáticamente sin tocar BIOS ✅

   **Pantalla 9 - Perfil de usuario:**
   ```
   Your name: admin
   Your server's name: acer-ml-server
   Pick a username: admin
   Choose a password: [TU CONTRASEÑA SEGURA]
   Confirm your password: [LA MISMA CONTRASEÑA]
   
   [Done]
   ```
   **⚠️ IMPORTANTE: Anota esta contraseña, la necesitarás SIEMPRE**

   **Pantalla 10 - Upgrade to Ubuntu Pro:**
   ```
   Elegir: Skip for now
   [Continue]
   ```

   **Pantalla 11 - SSH:**
   ```
   [X] Install OpenSSH server  ← MARCAR ESTO (presiona Space)
   
   [ ] Import SSH identity: No  ← NO marcar
   
   [Done]
   ```

   **Pantalla 12 - Software adicional:**
   ```
   NO marcar nada (dejar todo sin [ ])
   
   [Done]
   ```

   **Pantalla 13 - Instalando...**
   ```
   Espera 10-15 minutos
   
   Cuando termine, dirá:
   "Reboot Now"
   
   Presiona Enter
   ```

5. **Después del reinicio:**
   ```
   Quita el USB del notebook
   
   Espera a que aparezca:
   "acer-ml-server login: _"
   
   Escribe: admin
   Presiona Enter
   
   Password: [tu contraseña]
   Presiona Enter
   
   Si aparece:
   admin@acer-ml-server:~$
   
   ¡FELICIDADES! Ubuntu está instalado ✅
   ```

---

## 🌐 PASO 6: OBTENER LA IP DEL SERVIDOR

### En el Acer (en la terminal que ya tienes abierta):

```bash
ip addr show
```

Busca algo como:
```
2: enp3s0: <BROADCAST,MULTICAST,UP,LOWER_UP>
    inet 192.168.1.150/24 brd 192.168.1.255
```

**Tu IP es:** `192.168.1.150` (ejemplo)

**⚠️ APUNTA ESTA IP**

---

## 🔧 PASO 7: CONFIGURAR PARA QUE NO SE APAGUE AL CERRAR TAPA

### En el Acer:

```bash
# Editar configuración
sudo nano /etc/systemd/logind.conf
```

Te pedirá contraseña: escribe la de admin

Busca estas líneas (presiona Ctrl+W para buscar):
```
#HandleLidSwitch=suspend
#HandleLidSwitchDocked=ignore
```

Cámbialas a (quita el # y cambia el texto):
```
HandleLidSwitch=ignore
HandleLidSwitchDocked=ignore
```

Guardar:
```
Ctrl+O (te pregunta el nombre, presiona Enter)
Ctrl+X (para salir)
```

Reiniciar servicio:
```bash
sudo systemctl restart systemd-logind
```

**PROBAR:**
- Cierra la tapa del notebook
- Ve a tu PC principal
- Intenta hacer ping: `ping 192.168.1.150`
- Si responde → ¡Funciona! ✅

---

## 🐍 PASO 8: INSTALAR PYTHON Y LIBRERÍAS

### Desde tu PC PRINCIPAL (no el Acer):

**Conectarte por SSH:**
```bash
# En Windows, abre PowerShell o Command Prompt:
ssh admin@192.168.1.150
```

Te preguntará si confías en el servidor, escribe: `yes` y Enter

Luego tu contraseña.

**Ahora estás dentro del Acer remotamente** 🎉

### Instalar todo lo necesario:

```bash
# 1. Actualizar sistema (toma 5-10 min)
sudo apt update && sudo apt upgrade -y

# 2. Instalar Python y herramientas
sudo apt install -y python3 python3-pip python3-venv
sudo apt install -y build-essential cmake git
sudo apt install -y libopencv-dev python3-opencv

# 3. Crear carpeta para el proyecto
mkdir ~/photo-validator
cd ~/photo-validator

# 4. Crear entorno virtual Python
python3 -m venv venv
source venv/bin/activate

# 5. Instalar librerías ML (toma 10-15 min)
pip install --upgrade pip
pip install flask
pip install face_recognition
pip install deepface
pip install opencv-python
pip install pillow
pip install requests
pip install numpy

# 6. Crear el servidor
nano server.py
```

---

## 📝 PASO 9: CÓDIGO DEL SERVIDOR

### Dentro de nano, pega este código:

```python
from flask import Flask, request, jsonify
import face_recognition
import requests
from PIL import Image
from io import BytesIO
import numpy as np

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'photo-validator',
        'version': '1.0'
    })

@app.route('/validate', methods=['POST'])
def validate():
    data = request.json
    photo_url = data.get('photoUrl')
    
    print(f"📸 Validando foto: {photo_url}")
    
    try:
        # Descargar imagen
        response = requests.get(photo_url, timeout=10)
        img = Image.open(BytesIO(response.content))
        
        # Convertir a RGB si es necesario
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Detectar rostros
        img_array = np.array(img)
        face_locations = face_recognition.face_locations(img_array)
        
        num_faces = len(face_locations)
        print(f"👥 Rostros detectados: {num_faces}")
        
        # Validar número de rostros
        if num_faces == 0:
            return jsonify({
                'success': False,
                'verdict': 'REJECT',
                'reason': 'No se detectó ningún rostro en la imagen'
            })
        
        if num_faces > 1:
            return jsonify({
                'success': False,
                'verdict': 'REJECT',
                'reason': f'Se detectaron {num_faces} personas (debe haber solo 1)'
            })
        
        # Calcular tamaño del rostro
        face = face_locations[0]
        top, right, bottom, left = face
        face_height = bottom - top
        face_width = right - left
        face_area = face_height * face_width
        
        img_height, img_width = img_array.shape[:2]
        image_area = img_height * img_width
        face_percent = (face_area / image_area) * 100
        
        print(f"📏 Área del rostro: {face_percent:.2f}%")
        
        # Decidir según tamaño
        validation_data = {
            'faces_detected': num_faces,
            'face_area_percent': round(face_percent, 2),
            'image_size': f"{img_width}x{img_height}"
        }
        
        if face_percent >= 5:
            print("✅ APROBADA")
            return jsonify({
                'success': True,
                'verdict': 'APPROVE',
                'validationData': validation_data
            })
        else:
            print(f"❌ RECHAZADA (rostro muy pequeño)")
            return jsonify({
                'success': False,
                'verdict': 'REJECT',
                'reason': f'Rostro muy pequeño ({face_percent:.1f}%, mínimo 5%)',
                'validationData': validation_data
            })
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({
            'success': False,
            'verdict': 'MANUAL_REVIEW',
            'reason': f'Error en validación: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("🚀 Servidor de validación de fotos iniciando...")
    print("📡 Escuchando en http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
```

**Guardar:**
```
Ctrl+O, Enter
Ctrl+X
```

---

## 🧪 PASO 10: PROBAR EL SERVIDOR

```bash
# Activar entorno virtual (si no está activo)
cd ~/photo-validator
source venv/bin/activate

# Ejecutar servidor
python server.py
```

Deberías ver:
```
🚀 Servidor de validación de fotos iniciando...
📡 Escuchando en http://0.0.0.0:5000
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.1.150:5000
```

**Probar desde tu PC:**

Abre otra terminal/PowerShell:
```bash
curl http://192.168.1.150:5000/health
```

Si ves:
```json
{"status":"ok","service":"photo-validator","version":"1.0"}
```

**¡FUNCIONA!** ✅

---

## 🔄 PASO 11: ARRANQUE AUTOMÁTICO

Para que el servidor inicie cuando prende el Acer:

```bash
# Detener el servidor (Ctrl+C)

# Crear servicio systemd
sudo nano /etc/systemd/system/photo-validator.service
```

Pegar:
```ini
[Unit]
Description=Photo Validator ML Service
After=network.target

[Service]
Type=simple
User=admin
WorkingDirectory=/home/admin/photo-validator
Environment="PATH=/home/admin/photo-validator/venv/bin"
ExecStart=/home/admin/photo-validator/venv/bin/python /home/admin/photo-validator/server.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Guardar (Ctrl+O, Enter, Ctrl+X)

```bash
# Habilitar e iniciar servicio
sudo systemctl enable photo-validator
sudo systemctl start photo-validator

# Ver estado
sudo systemctl status photo-validator
```

Si dice `active (running)` en verde → ¡Perfecto! ✅

---

## 🌐 PASO 12: EXPONER CON CLOUDFLARE TUNNEL

```bash
# 1. Instalar cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# 2. Login en Cloudflare
cloudflared tunnel login
```

Se abrirá una URL, cópiala y ábrela en tu PC.
Inicia sesión en Cloudflare y autoriza.

```bash
# 3. Crear túnel
cloudflared tunnel create acer-validator

# Verás algo como:
# Created tunnel acer-validator with id abc123-def456-...

# 4. Configurar túnel
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

Pegar (CAMBIA abc123-def456 por TU tunnel ID):
```yaml
tunnel: abc123-def456-ghi789
credentials-file: /home/admin/.cloudflared/abc123-def456-ghi789.json

ingress:
  - hostname: ml.tudominio.com
    service: http://localhost:5000
  - service: http_status:404
```

```bash
# 5. Crear DNS
cloudflared tunnel route dns acer-validator ml.tudominio.com

# 6. Probar túnel
cloudflared tunnel run acer-validator
```

Si funciona, crear servicio:

```bash
sudo nano /etc/systemd/system/cloudflared.service
```

Pegar:
```ini
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=admin
ExecStart=/usr/bin/cloudflared tunnel --config /home/admin/.cloudflared/config.yml run acer-validator
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

---

## ✅ RESULTADO FINAL

Tu servidor estará accesible en:

- **Localmente:** `http://192.168.1.150:5000`
- **Internet:** `https://ml.tudominio.com`

**Endpoints:**
- `GET /health` → Estado del servidor
- `POST /validate` → Validar foto

**Cerrar tapa del notebook:**
- ✅ Servidor sigue funcionando
- ✅ Pantalla se apaga (ahorra energía)
- ✅ Accesible por internet 24/7

---

## 🔧 COMANDOS ÚTILES

```bash
# Ver logs del servidor
sudo journalctl -u photo-validator -f

# Reiniciar servidor
sudo systemctl restart photo-validator

# Ver status
sudo systemctl status photo-validator

# Detener servidor
sudo systemctl stop photo-validator

# Ver logs de Cloudflare
sudo journalctl -u cloudflared -f

# Reiniciar Acer
sudo reboot

# Apagar Acer (no recomendado)
sudo shutdown -h now
```

---

## ⚡ QUÉ PASA SI SE VA LA LUZ

**Con Ubuntu instalado en UEFI:**
```
1. Se va la luz
2. Notebook se apaga
3. Vuelve la luz
4. BIOS vuelve a UEFI (por defecto)
5. Ubuntu arranca AUTOMÁTICAMENTE ✅
6. Servicios photo-validator y cloudflared arrancan solos ✅
7. Servidor funciona de nuevo en ~1 minuto ✅
```

**Sin intervención manual necesaria** 🎉

**Para verificar que volvió:**
- Desde tu PC: `ping 192.168.1.150`
- O: `curl https://ml.tudominio.com/health`

---

## 📞 SOPORTE

Si algo falla, revisa:
1. ¿El Acer tiene internet? → `ping 8.8.8.8`
2. ¿El servicio está corriendo? → `sudo systemctl status photo-validator`
3. ¿El puerto está escuchando? → `sudo netstat -tulpn | grep 5000`
4. ¿Hay errores? → `sudo journalctl -u photo-validator -n 50`

---

**¡Listo! Tu Acer ahora es un servidor ML profesional.** 🎉
