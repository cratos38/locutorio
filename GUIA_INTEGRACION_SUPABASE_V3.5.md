# 🔗 Guía Completa de Integración Supabase + ML Validator v3.5

## 📋 Índice
1. [Resumen de Arquitectura](#resumen-de-arquitectura)
2. [Instalación Paso a Paso](#instalación-paso-a-paso)
3. [Configuración de Supabase](#configuración-de-supabase)
4. [Configuración del Servidor Ubuntu](#configuración-del-servidor-ubuntu)
5. [Pruebas](#pruebas)
6. [Solución de Problemas](#solución-de-problemas)

---

## 🏗️ Resumen de Arquitectura

```
┌─────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Usuario   │────────▶│  Supabase        │────────▶│  ML Validator    │
│  (App/Web)  │         │  Storage + DB    │         │  (puerto 5000)   │
└─────────────┘         └──────────────────┘         └──────────────────┘
                                 │                             │
                                 ▼                             ▼
                        ┌──────────────────┐         ┌──────────────────┐
                        │  Webhook Server  │◀────────│  Resultado JSON  │
                        │  (puerto 5001)   │         │  verdict, reason │
                        └──────────────────┘         └──────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  Notificaciones  │
                        │  + DB Updates    │
                        └──────────────────┘
```

### Flujo Completo:

1. **Usuario sube foto** → Cliente llama a Supabase Storage
2. **Supabase Storage** → Guarda en `photos-pending/` bucket
3. **Cliente** → INSERT en tabla `photos` con `storage_path`
4. **Trigger SQL** → Cambia `status` a `'processing'`
5. **Cliente/Edge Function** → Llama a webhook `POST /webhook/photo-uploaded`
6. **Webhook** → Obtiene URL temporal de Storage
7. **Webhook** → Llama a ML Validator `POST /validate` con URL
8. **ML Validator** → Descarga, analiza y responde con veredicto
9. **Webhook** → Actualiza tabla `photos` con resultado
10. **Trigger SQL** → Envía notificación al usuario
11. **Cron Job** → Limpia fotos rechazadas después de 24h

---

## 📥 Instalación Paso a Paso

### Paso 1: Descargar Archivos

En tu servidor Ubuntu (PuTTY):

```bash
cd ~/ml-validator

# Descargar servidor ML v3.5
wget -O server.py "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/server-v3.5-complete.py"

# Descargar webhook de Supabase
wget -O supabase_webhook.py "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/supabase_webhook_v3.5.py"

# Descargar schema SQL
wget -O supabase-schema.sql "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/supabase-schema-v3.5.sql"

# Verificar descargas
ls -lh *.py *.sql
```

**Archivos esperados:**
- `server.py` (1669 líneas) - ML Validator v3.5
- `supabase_webhook.py` (~450 líneas) - Webhook de integración
- `supabase-schema.sql` (~650 líneas) - Esquema de BD

---

### Paso 2: Instalar Dependencias Python

```bash
cd ~/ml-validator
source venv/bin/activate

# Instalar python-dotenv para variables de entorno
pip install python-dotenv

# Verificar instalación
pip list | grep -E "flask|requests|python-dotenv"
```

---

### Paso 3: Configurar Variables de Entorno

```bash
cd ~/ml-validator

# Crear archivo .env
nano .env
```

**Contenido del archivo `.env`:**

```bash
# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key_aqui

# ML Validator URL
ML_VALIDATOR_URL=http://localhost:5000

# Server Configuration (opcional)
SERVER_HOST=0.0.0.0
VALIDATOR_PORT=5000
WEBHOOK_PORT=5001
```

**¿Dónde encontrar tus credenciales de Supabase?**

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **URL**: `https://xxx.supabase.co`
   - **Service Role Key** (secret): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

⚠️ **IMPORTANTE**: Usa el **Service Role Key**, NO el anon key.

**Guardar y salir:**
- Presiona `Ctrl + O` para guardar
- Presiona `Enter` para confirmar
- Presiona `Ctrl + X` para salir

---

## ⚙️ Configuración de Supabase

### Paso 4: Ejecutar Schema SQL

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Navega a **SQL Editor**
3. Haz clic en **New Query**
4. Copia y pega el contenido de `supabase-schema.sql` (ya lo tienes en el servidor Ubuntu, cópialo desde ahí o desde el archivo descargado)
5. Haz clic en **Run** (o presiona `Ctrl + Enter`)

**El script creará:**
- ✅ Tablas: `photos`, `user_profiles`, `notifications`
- ✅ Buckets de Storage: `photos-pending`, `photos-approved`, `photos-cropped`, `albums-private`
- ✅ Políticas RLS (Row Level Security)
- ✅ Funciones: `create_notification()`, `auto_delete_photo_immediate()`, `cleanup_expired_rejected_photos()`
- ✅ Triggers: `trigger_photo_approved`, `trigger_photo_rejected`, `trigger_new_photo`
- ✅ Cron Job: Limpia fotos rechazadas cada hora

**Verificar instalación:**

```sql
-- Verificar tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('photos', 'user_profiles', 'notifications');

-- Verificar buckets
SELECT id, name, public FROM storage.buckets;

-- Verificar funciones
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%photo%';
```

---

### Paso 5: Configurar Storage Policies

En el **SQL Editor** de Supabase, ejecuta:

```sql
-- Permitir a usuarios autenticados subir fotos a photos-pending
CREATE POLICY "Users can upload to pending"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'photos-pending' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir a usuarios autenticados leer sus propias fotos en photos-pending
CREATE POLICY "Users can read own pending photos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'photos-pending' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir al sistema (service role) hacer cualquier cosa
CREATE POLICY "Service role full access to pending"
ON storage.objects FOR ALL
USING (bucket_id = 'photos-pending');

-- Permitir a usuarios autenticados subir a albums-private
CREATE POLICY "Users can upload to private albums"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'albums-private' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir a usuarios leer sus propios álbumes privados
CREATE POLICY "Users can read own private albums"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'albums-private' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 🖥️ Configuración del Servidor Ubuntu

### Paso 6: Crear Script de Inicio

```bash
cd ~/ml-validator
nano start_services.sh
```

**Contenido:**

```bash
#!/bin/bash

# Script de inicio para ML Validator + Supabase Webhook v3.5

echo "🚀 Iniciando servicios..."

# Directorio del proyecto
PROJECT_DIR="$HOME/ml-validator"
cd "$PROJECT_DIR"

# Activar entorno virtual
source venv/bin/activate

# Cargar variables de entorno
if [ ! -f .env ]; then
    echo "❌ Archivo .env no encontrado!"
    echo "   Crea el archivo .env con tus credenciales de Supabase"
    exit 1
fi

export $(cat .env | grep -v '^#' | xargs)

echo "✅ Variables de entorno cargadas"

# Función para matar procesos en puertos
kill_port() {
    PORT=$1
    PID=$(lsof -t -i:$PORT)
    if [ ! -z "$PID" ]; then
        echo "🔪 Matando proceso en puerto $PORT (PID: $PID)"
        kill -9 $PID
    fi
}

# Limpiar puertos si están ocupados
kill_port 5000
kill_port 5001

echo ""
echo "🤖 Iniciando ML Validator (puerto 5000)..."
nohup python server.py > logs/ml-validator.log 2>&1 &
ML_PID=$!
echo "   PID: $ML_PID"

sleep 3

echo ""
echo "🔗 Iniciando Supabase Webhook (puerto 5001)..."
nohup python supabase_webhook.py > logs/webhook.log 2>&1 &
WEBHOOK_PID=$!
echo "   PID: $WEBHOOK_PID"

sleep 2

echo ""
echo "="*70
echo "✅ SERVICIOS INICIADOS"
echo "="*70
echo ""
echo "📊 Estado:"
echo "   • ML Validator:     http://localhost:5000/health"
echo "   • Webhook:          http://localhost:5001/health"
echo ""
echo "📁 Logs:"
echo "   • ML Validator:     tail -f ~/ml-validator/logs/ml-validator.log"
echo "   • Webhook:          tail -f ~/ml-validator/logs/webhook.log"
echo ""
echo "🛑 Para detener:"
echo "   kill $ML_PID $WEBHOOK_PID"
echo ""
echo "="*70
```

**Hacer ejecutable:**

```bash
chmod +x start_services.sh

# Crear directorio de logs
mkdir -p logs
```

---

### Paso 7: Iniciar Servicios

```bash
cd ~/ml-validator
./start_services.sh
```

**Salida esperada:**

```
🚀 Iniciando servicios...
✅ Variables de entorno cargadas

🤖 Iniciando ML Validator (puerto 5000)...
   PID: 12345

🔗 Iniciando Supabase Webhook (puerto 5001)...
   PID: 12346

======================================================================
✅ SERVICIOS INICIADOS
======================================================================

📊 Estado:
   • ML Validator:     http://localhost:5000/health
   • Webhook:          http://localhost:5001/health

📁 Logs:
   • ML Validator:     tail -f ~/ml-validator/logs/ml-validator.log
   • Webhook:          tail -f ~/ml-validator/logs/webhook.log

🛑 Para detener:
   kill 12345 12346

======================================================================
```

---

### Paso 8: Verificar que los Servicios Estén Funcionando

```bash
# Verificar ML Validator
curl http://localhost:5000/health

# Verificar Webhook
curl http://localhost:5001/health
```

**Respuesta esperada (ML Validator):**

```json
{
  "status": "ok",
  "service": "ml-validator",
  "version": "3.5",
  "gpu_enabled": true,
  "features": {
    "profile": {...},
    "album_public": {...},
    "album_private": {...}
  }
}
```

**Respuesta esperada (Webhook):**

```json
{
  "status": "ok",
  "service": "supabase-webhook",
  "version": "3.5",
  "ml_validator_url": "http://localhost:5000",
  "supabase_url": "https://tu-proyecto.supabase.co",
  "timestamp": "2026-02-28T12:00:00Z"
}
```

---

## 🧪 Pruebas

### Prueba 1: Webhook Manual

```bash
curl -X POST http://localhost:5001/webhook/photo-uploaded \
  -H 'Content-Type: application/json' \
  -d '{
    "photo_id": "00000000-0000-0000-0000-000000000001",
    "user_id": "00000000-0000-0000-0000-000000000002",
    "photo_type": "profile",
    "album_type": "public",
    "storage_path": "test/foto.jpg"
  }'
```

---

### Prueba 2: Desde tu App (JavaScript/TypeScript)

**Cliente (React/Next.js/Vue):**

```typescript
// 1. Subir foto a Supabase Storage
async function uploadPhoto(file: File, userId: string, photoType: 'profile' | 'album', albumType: 'public' | 'private') {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Generar path único
  const timestamp = Date.now();
  const filename = `${userId}/${timestamp}_${file.name}`;
  
  // Subir a Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('photos-pending')
    .upload(filename, file);
  
  if (uploadError) throw uploadError;
  
  // Insertar en tabla photos (esto activará el trigger)
  const { data: photoData, error: insertError } = await supabase
    .from('photos')
    .insert({
      user_id: userId,
      photo_type: photoType,
      album_type: albumType,
      storage_path: filename,
      original_filename: file.name,
      file_size: file.size,
      mime_type: file.type
    })
    .select()
    .single();
  
  if (insertError) throw insertError;
  
  // Llamar al webhook (desde tu backend o Edge Function)
  const webhookUrl = 'http://192.168.1.159:5001/webhook/photo-uploaded';
  
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      photo_id: photoData.id,
      user_id: userId,
      photo_type: photoType,
      album_type: albumType,
      storage_path: filename
    })
  });
  
  return photoData;
}
```

---

### Prueba 3: Monitorear Logs en Tiempo Real

```bash
# Terminal 1: Logs del ML Validator
tail -f ~/ml-validator/logs/ml-validator.log

# Terminal 2: Logs del Webhook
tail -f ~/ml-validator/logs/webhook.log
```

---

## 🐛 Solución de Problemas

### Problema 1: "Connection refused" al llamar al webhook

**Causa:** El webhook no está corriendo o el puerto está bloqueado.

**Solución:**

```bash
# Verificar si el webhook está corriendo
ps aux | grep supabase_webhook

# Verificar puertos abiertos
netstat -tuln | grep 5001

# Reiniciar webhook
cd ~/ml-validator
./start_services.sh
```

---

### Problema 2: "SUPABASE_URL not set"

**Causa:** El archivo `.env` no existe o está mal configurado.

**Solución:**

```bash
cd ~/ml-validator

# Verificar que existe
ls -la .env

# Editar
nano .env

# Verificar contenido
cat .env
```

---

### Problema 3: "Failed to generate storage URL"

**Causa:** El Service Role Key es incorrecto o no tiene permisos.

**Solución:**

1. Ve a Supabase Dashboard → **Settings** → **API**
2. Copia el **Service Role Key** (NO el anon key)
3. Actualiza `.env` con el key correcto
4. Reinicia servicios: `./start_services.sh`

---

### Problema 4: "Photo not found" en webhook

**Causa:** La foto no se insertó correctamente en la tabla `photos`.

**Solución:**

```sql
-- En SQL Editor de Supabase
SELECT id, user_id, photo_type, status, created_at 
FROM photos 
ORDER BY created_at DESC 
LIMIT 10;
```

---

### Problema 5: Fotos no se aprueban/rechazan

**Causa:** Los triggers no están activos.

**Solución:**

```sql
-- Verificar triggers
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname LIKE '%photo%';

-- Habilitar triggers si están deshabilitados
ALTER TABLE photos ENABLE TRIGGER ALL;
```

---

## 📊 Comandos Útiles

```bash
# Ver procesos
ps aux | grep -E "server.py|supabase_webhook"

# Ver logs
tail -f ~/ml-validator/logs/*.log

# Detener servicios
killall -9 python3

# Reiniciar servicios
cd ~/ml-validator && ./start_services.sh

# Verificar health
curl http://localhost:5000/health
curl http://localhost:5001/health

# Ver estadísticas (desde SQL Editor de Supabase)
SELECT * FROM validation_stats;
```

---

## ✅ Checklist Final

- [ ] Schema SQL ejecutado en Supabase
- [ ] Buckets de Storage creados
- [ ] Storage policies configuradas
- [ ] Archivo `.env` creado con credenciales correctas
- [ ] ML Validator corriendo en puerto 5000
- [ ] Webhook corriendo en puerto 5001
- [ ] Ambos servicios responden a `/health`
- [ ] Prueba manual de webhook exitosa
- [ ] Cliente configurado para llamar al webhook
- [ ] Logs monitoreados sin errores

---

**¡Listo!** Ahora Supabase está completamente integrado con tu ML Validator v3.5. 🎉

---

**Versión:** 3.5  
**Fecha:** 2026-02-28  
**Autor:** ML Validator Team
