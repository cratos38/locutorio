# 🚀 COMANDOS RÁPIDOS - Despliegue v3.0

**Ejecutar estos comandos en orden**

---

## 📍 OPCIÓN 1: Transferir Archivos con SCP (Recomendado)

### Desde Windows PowerShell:

```powershell
# 1. Navegar al directorio donde están los archivos
cd C:\Users\TU_USUARIO\Downloads

# 2. Transferir server.py
scp ml-validator-server-v3.py adminadmin@192.168.1.159:~/ml-validator/server.py

# 3. Transferir test.html
scp ml-validator-test-v3.html adminadmin@192.168.1.159:~/ml-validator/test.html

# 4. Transferir documentación (opcional)
scp PLAN_MEJORAS_VALIDACION_FOTOS.md adminadmin@192.168.1.159:~/ml-validator/
scp GUIA_DESPLIEGUE_V3.md adminadmin@192.168.1.159:~/ml-validator/
scp RESUMEN_EJECUTIVO_V3.md adminadmin@192.168.1.159:~/ml-validator/
```

---

## 📍 OPCIÓN 2: Copiar Manualmente en PuTTY

### En el servidor Ubuntu (PuTTY):

```bash
# 1. Conectar al servidor
ssh adminadmin@192.168.1.159

# 2. Navegar al directorio
cd ~/ml-validator

# 3. Hacer backup del server.py anterior (opcional)
cp server.py server.py.backup.v2

# 4. Crear server.py nuevo
nano server.py
# Pegar todo el contenido de ml-validator-server-v3.py
# Guardar: Ctrl+O, Enter
# Salir: Ctrl+X

# 5. Crear test.html nuevo
nano test.html
# Pegar todo el contenido de ml-validator-test-v3.html
# Guardar: Ctrl+O, Enter
# Salir: Ctrl+X

# 6. Verificar archivos
ls -lh
# Deberías ver:
# server.py (~23 KB)
# test.html (~19 KB)
```

---

## ▶️ INICIAR SERVIDOR v3.0

```bash
# 1. Activar entorno virtual
cd ~/ml-validator
source venv/bin/activate

# 2. Verificar que esté activado (debe aparecer (venv) en el prompt)
# Ejemplo: (venv) adminadmin@acer:~/ml-validator$

# 3. Iniciar servidor
python server.py
```

**Salida esperada:**
```
======================================================================
🚀 ML VALIDATOR v3.0 - SMART CROP & FACE-ONLY SHARPNESS
======================================================================

📍 ENDPOINTS:
   • Health:   GET  http://192.168.1.159:5000/health
   • Validate: POST http://192.168.1.159:5000/validate
   • Test UI:  GET  http://192.168.1.159:5000/test.html

⚙️ CONFIGURACIÓN:
   • Profile:  min_face=10%, min_sharpness=50, crop_margin=80%
   • Album:    min_face=5%,  min_sharpness=40, crop_margin=50%

⚡ GPU HABILITADA: 1 dispositivo(s)
   • /device:GPU:0

======================================================================
🎯 MEJORAS v3.0:
   ✅ Crop inteligente con márgenes generosos
   ✅ Margen superior 120% para peinados altos
   ✅ Nitidez medida SOLO en zona del rostro
   ✅ Redimensionamiento antes de calcular % rostro
   ✅ Umbrales ajustados por tipo de foto
======================================================================

 * Running on http://127.0.0.1:5000
 * Running on http://192.168.1.159:5000
```

---

## 🧪 PROBAR SERVIDOR

### Test 1: Health Check

**En navegador (Windows):**
```
http://192.168.1.159:5000/health
```

**O con curl en otra terminal PuTTY:**
```bash
curl http://192.168.1.159:5000/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "service": "ml-validator",
  "version": "3.0",
  "gpu_enabled": true,
  "tensorflow_version": "2.15.0"
}
```

### Test 2: Test UI

**En navegador (Windows):**
```
http://192.168.1.159:5000/test.html
```

Deberías ver:
- Diseño moderno con gradiente violeta
- Título "ML Validator v3.0"
- Badges: Smart Crop, Face-Only Sharpness, GPU
- Selector de fotos de ejemplo
- Botón verde "🚀 Validar Foto"

### Test 3: Validar Foto

1. En la página de test, selecciona "Retrato cercano mujer asiática"
2. Click en "🚀 Validar Foto"
3. Espera 1-2 segundos
4. Deberías ver:
   - ✅ APROBADA (verde)
   - Imagen original a la izquierda
   - Crop inteligente a la derecha
   - Métricas: % Rostro ~25-35%, Nitidez ~100-200

---

## 🔧 DETENER SERVIDOR

### Opción 1: Ctrl+C en PuTTY
```
Presionar: Ctrl + C
```

### Opción 2: Desde otra terminal
```bash
# Buscar el proceso
ps aux | grep python

# Ejemplo de salida:
# adminadmin  12345  ... python server.py

# Matar el proceso (reemplaza 12345 con el PID real)
kill 12345
```

---

## 🔄 REINICIAR SERVIDOR (si haces cambios)

```bash
# 1. Detener servidor (Ctrl+C)

# 2. Editar archivo (si necesario)
nano server.py
# Hacer cambios
# Guardar: Ctrl+O, Enter, Ctrl+X

# 3. Reiniciar
python server.py
```

---

## 📊 VER LOGS EN TIEMPO REAL

Los logs aparecen automáticamente en la terminal PuTTY donde corre el servidor.

**Ejemplo de log al validar una foto:**
```
======================================================================
🔍 VALIDANDO FOTO: PROFILE
📍 URL: https://images.unsplash.com/photo-...
======================================================================
📥 Descargando imagen...
✅ Imagen descargada: 4000×6000 px
📐 Redimensionando imagen...
✅ Imagen redimensionada: 800×1200 px
🔍 Detectando rostros...
✅ Rostros detectados: 1

📊 ANÁLISIS DEL ROSTRO:
   Coordenadas: Top=250, Right=600, Bottom=900, Left=200
   Tamaño rostro: 400×650 px
   Área rostro: 260,000 px²
   Área imagen: 960,000 px²
   📈 PORCENTAJE: 27.08%

✂️ RECORTANDO IMAGEN:
   Coordenadas crop: L=50, T=150, R=750, B=1050
   ✅ Crop: 700×900 px

🔎 ANALIZANDO NITIDEZ:
   Varianza Laplacian (solo rostro): 145.23
   📈 NITIDEZ: ACEPTABLE ✅

📐 Crop redimensionado: 600×600 px

✅ APROBADA
======================================================================
```

---

## 🛠️ COMANDOS ÚTILES

### Ver archivos del proyecto
```bash
cd ~/ml-validator
ls -lh
```

### Ver contenido del server.py
```bash
head -50 server.py  # Primeras 50 líneas
tail -50 server.py  # Últimas 50 líneas
```

### Ver procesos Python activos
```bash
ps aux | grep python
```

### Ver uso de GPU
```bash
nvidia-smi
```

### Ver logs del servidor (si lo corriste en background)
```bash
tail -f ~/ml-validator/server.log
```

---

## ❓ RESOLUCIÓN DE PROBLEMAS

### Problema: "ModuleNotFoundError: No module named 'face_recognition'"

**Solución:**
```bash
cd ~/ml-validator
source venv/bin/activate  # Asegúrate de activar el venv
pip install face_recognition
```

### Problema: "Address already in use"

**Solución:**
```bash
# Buscar proceso usando el puerto 5000
lsof -i :5000

# Matar el proceso
kill <PID>
```

### Problema: GPU no detectada

**Solución:**
```bash
# Verificar driver NVIDIA
nvidia-smi

# Verificar TensorFlow puede ver GPU
source ~/ml-validator/venv/bin/activate
python -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"

# Si no aparece, reinstalar TensorFlow 2.15
pip uninstall -y tensorflow
pip install tensorflow==2.15.0
```

### Problema: test.html no carga

**Solución:**
```bash
# Verificar que el archivo existe
ls -lh ~/ml-validator/test.html

# Verificar permisos
chmod 644 ~/ml-validator/test.html

# Verificar que el servidor esté corriendo
curl http://192.168.1.159:5000/health
```

---

## 📋 CHECKLIST POST-DESPLIEGUE

Verificar estos puntos:

- [ ] Servidor v3.0 corriendo
- [ ] Health check devuelve `"version": "3.0"`
- [ ] GPU habilitada (aparece en logs)
- [ ] Test UI carga en navegador
- [ ] Validación de foto funciona
- [ ] Se ven 2 imágenes (original y crop)
- [ ] Logs detallados en terminal
- [ ] Crop no corta peinado (probar con foto de ejemplo)
- [ ] Acepta foto con fondo borroso
- [ ] Tiempo procesamiento < 2 segundos

---

## 🎯 SIGUIENTE PASO

Una vez que el servidor esté corriendo y los tests básicos pasen:

1. **Probar con fotos reales** (las que diste antes como ejemplo)
2. **Validar que los problemas se hayan resuelto:**
   - ✅ Crop no corta peinados
   - ✅ Acepta fotos con fondo borroso
   - ✅ % de rostro calculado correctamente
3. **Ajustar umbrales** si es necesario
4. **Documentar resultados** (cuántas fotos APPROVE, REJECT, MANUAL_REVIEW)

---

**¿Listo para empezar?** 🚀

Ejecuta los comandos de "OPCIÓN 1" o "OPCIÓN 2" según tu preferencia.
