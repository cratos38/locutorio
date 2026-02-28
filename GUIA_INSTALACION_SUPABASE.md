# 🚀 Guía de Instalación - Integración Supabase + ML Validator v3.4

## 📋 Índice
1. [Configuración de Supabase](#1-configuración-de-supabase)
2. [Instalación del Webhook Handler](#2-instalación-del-webhook-handler)
3. [Configuración del Webhook en Supabase](#3-configuración-del-webhook-en-supabase)
4. [Pruebas](#4-pruebas)
5. [Flujo Completo](#5-flujo-completo)

---

## 1. Configuración de Supabase

### 1.1. Ejecutar el Schema SQL

1. **Abre el SQL Editor en Supabase:**
   - Ve a tu proyecto en https://app.supabase.com
   - Click en "SQL Editor" (menú izquierdo)

2. **Copia y pega el contenido de `supabase-schema.sql`:**
   ```bash
   # En tu computadora local
   cat supabase-schema.sql
   ```

3. **Ejecuta el script** haciendo click en "Run"

4. **Verifica que se crearon:**
   - ✅ Tablas: `photos`, `user_profiles`, `notifications`
   - ✅ Storage buckets: `photos-pending`, `photos-approved`, `photos-cropped`
   - ✅ Políticas RLS
   - ✅ Triggers y funciones
   - ✅ Cron job para limpieza

---

### 1.2. Obtener las Credenciales

1. **Ve a Settings > API**
2. **Copia estos valores:**
   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbGc...
   service_role key: eyJhbGc... (¡SECRETO!)
   ```

3. **Guarda las credenciales** en un lugar seguro

---

## 2. Instalación del Webhook Handler

### 2.1. Configurar Variables de Entorno

En tu servidor Ubuntu (PuTTY):

```bash
cd ~/ml-validator

# Crear archivo de configuración
nano .env
```

Pega esto (reemplaza con tus valores reales):

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...tu-service-role-key-aquí...

# ML Validator
ML_VALIDATOR_URL=http://localhost:5000
```

Guarda con `Ctrl+O`, `Enter`, `Ctrl+X`

---

### 2.2. Descargar el Webhook Handler

Desde tu computadora, sube el archivo al servidor:

**Opción A - Descarga directa:**
```bash
cd ~/ml-validator
wget https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/supabase_integration.py
```

**Opción B - Copia manual:**
1. Abre `supabase_integration.py` en tu editor local
2. En PuTTY: `nano ~/ml-validator/supabase_integration.py`
3. Copia y pega el contenido
4. Guarda: `Ctrl+O`, `Enter`, `Ctrl+X`

---

### 2.3. Instalar Dependencias

```bash
cd ~/ml-validator
source venv/bin/activate
pip install python-dotenv
```

---

### 2.4. Crear Script de Inicio

Para ejecutar ambos servicios (ML Validator + Webhook) juntos:

```bash
nano ~/ml-validator/start_services.sh
```

Pega esto:

```bash
#!/bin/bash

# Cargar variables de entorno
export $(grep -v '^#' .env | xargs)

# Directorio del proyecto
cd ~/ml-validator
source venv/bin/activate

# Iniciar ML Validator en background
echo "🚀 Iniciando ML Validator (puerto 5000)..."
python server.py > logs/ml_validator.log 2>&1 &
ML_VALIDATOR_PID=$!
echo "   PID: $ML_VALIDATOR_PID"

# Esperar 5 segundos
sleep 5

# Iniciar Webhook Handler en background
echo "🔗 Iniciando Webhook Handler (puerto 5001)..."
python supabase_integration.py > logs/webhook_handler.log 2>&1 &
WEBHOOK_PID=$!
echo "   PID: $WEBHOOK_PID"

echo ""
echo "✅ Servicios iniciados"
echo "   ML Validator:    http://192.168.1.159:5000"
echo "   Webhook Handler: http://192.168.1.159:5001"
echo ""
echo "Para ver logs:"
echo "   tail -f logs/ml_validator.log"
echo "   tail -f logs/webhook_handler.log"
echo ""
echo "Para detener:"
echo "   kill $ML_VALIDATOR_PID $WEBHOOK_PID"
```

Guardar y dar permisos:

```bash
chmod +x ~/ml-validator/start_services.sh
```

---

### 2.5. Crear Directorio de Logs

```bash
mkdir -p ~/ml-validator/logs
```

---

### 2.6. Iniciar Servicios

```bash
cd ~/ml-validator
./start_services.sh
```

Deberías ver:

```
🚀 Iniciando ML Validator (puerto 5000)...
   PID: 12345
🔗 Iniciando Webhook Handler (puerto 5001)...
   PID: 12346

✅ Servicios iniciados
   ML Validator:    http://192.168.1.159:5000
   Webhook Handler: http://192.168.1.159:5001
```

---

### 2.7. Verificar que Funcionan

```bash
# Verificar ML Validator
curl http://192.168.1.159:5000/health

# Verificar Webhook Handler
curl http://192.168.1.159:5001/health
```

Ambos deben responder con `"status": "ok"`

---

## 3. Configuración del Webhook en Supabase

### 3.1. Opción A: Webhook Database (Recomendado)

1. **Ve a Database > Webhooks** en Supabase
2. **Click en "Create a new hook"**
3. **Configura:**
   ```
   Name: photo-validation-webhook
   Table: photos
   Events: INSERT
   Type: HTTP Request
   Method: POST
   URL: http://TU-IP-PUBLICA:5001/webhook/photo-uploaded
   Headers:
     Content-Type: application/json
   ```

4. **Guarda el webhook**

---

### 3.2. Opción B: Edge Function (Alternativa)

Si tu servidor no tiene IP pública estática, usa una Edge Function:

1. **Instala Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Inicializa proyecto:**
   ```bash
   supabase init
   ```

3. **Crea la función:**
   ```bash
   supabase functions new validate-photo
   ```

4. **Copia el contenido de `supabase-edge-function.ts`** a:
   ```
   supabase/functions/validate-photo/index.ts
   ```

5. **Despliega:**
   ```bash
   supabase functions deploy validate-photo \
     --project-ref tu-project-ref \
     --set ML_VALIDATOR_URL=http://192.168.1.159:5000
   ```

6. **Crea el trigger en la base de datos:**
   ```sql
   CREATE TRIGGER trigger_validate_photo
   AFTER INSERT ON photos
   FOR EACH ROW
   EXECUTE FUNCTION supabase_functions.http_request(
     'https://xxxxx.supabase.co/functions/v1/validate-photo',
     'POST',
     '{"Content-Type": "application/json"}',
     '{}',
     '5000'
   );
   ```

---

## 4. Pruebas

### 4.1. Crear Usuario de Prueba

En Supabase SQL Editor:

```sql
-- Crear usuario de prueba
INSERT INTO auth.users (id, email)
VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com');

-- Crear perfil
INSERT INTO user_profiles (id, username, age, gender)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test_user',
  25,
  'male'
);
```

---

### 4.2. Subir Foto de Prueba

**Opción A - API directa:**

```bash
# Obtener token de autenticación (desde el navegador)
# 1. Abre Developer Tools (F12)
# 2. Ve a Application > Local Storage > tu dominio de Supabase
# 3. Copia el valor de 'sb-xxxxx-auth-token'

# Subir foto
curl -X POST \
  "https://xxxxx.supabase.co/storage/v1/object/photos-pending/test-user/test.jpg" \
  -H "Authorization: Bearer TU-TOKEN" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@foto-prueba.jpg"

# Crear registro en la tabla
curl -X POST \
  "https://xxxxx.supabase.co/rest/v1/photos" \
  -H "Authorization: Bearer TU-TOKEN" \
  -H "apikey: TU-ANON-KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "00000000-0000-0000-0000-000000000001",
    "photo_type": "profile",
    "storage_path": "test-user/test.jpg",
    "original_filename": "test.jpg"
  }'
```

**Opción B - Desde la app:**

Usa el cliente de Supabase en tu app:

```javascript
// Subir foto
const { data: uploadData, error: uploadError } = await supabase
  .storage
  .from('photos-pending')
  .upload(`${userId}/profile/${Date.now()}.jpg`, file)

if (!uploadError) {
  // Crear registro
  const { data: photoData, error: photoError } = await supabase
    .from('photos')
    .insert({
      user_id: userId,
      photo_type: 'profile',
      storage_path: uploadData.path,
      original_filename: file.name
    })
}
```

---

### 4.3. Verificar el Proceso

1. **Ver logs en tiempo real:**
   ```bash
   tail -f ~/ml-validator/logs/webhook_handler.log
   ```

2. **Deberías ver:**
   ```
   ====================================================================
   📨 WEBHOOK RECIBIDO
      Foto ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      Usuario: 00000000-0000-0000-0000-000000000001
      Tipo: profile
   ====================================================================
   
   🤖 Llamando a ML Validator...
   ✅ Resultado: APPROVE
   ✅ Foto xxxxxxxx actualizada a: approved
   ✅ Webhook procesado exitosamente
   ```

3. **Verificar en Supabase:**
   ```sql
   SELECT id, status, validation_result, created_at, approved_at
   FROM photos
   ORDER BY created_at DESC
   LIMIT 5;
   ```

4. **Verificar notificaciones:**
   ```sql
   SELECT type, title, message, created_at
   FROM notifications
   WHERE user_id = '00000000-0000-0000-0000-000000000001'
   ORDER BY created_at DESC;
   ```

---

## 5. Flujo Completo

### 📸 Flujo de Validación de Foto

```
1. Usuario sube foto desde la app
   ↓
2. Foto → Supabase Storage (photos-pending/)
   ↓
3. Registro creado en tabla 'photos' con status='pending'
   ↓
4. Trigger dispara webhook → http://tu-servidor:5001/webhook/photo-uploaded
   ↓
5. Webhook Handler:
   a. Cambia status a 'processing'
   b. Obtiene URL firmada de Supabase
   c. Obtiene perfil del usuario (edad, género)
   d. Llama a ML Validator: POST http://localhost:5000/validate
   ↓
6. ML Validator procesa la foto (2-3 segundos)
   ↓
7. ML Validator responde con verdict: APPROVE/REJECT/MANUAL_REVIEW
   ↓
8. Webhook Handler:
   a. Si APPROVE:
      - Sube imagen recortada a photos-cropped/
      - Actualiza status='approved', is_visible=true
      - Trigger crea notificación "✅ Foto aprobada"
   b. Si REJECT:
      - Actualiza status='rejected', expires_at=+24h
      - Trigger crea notificación "❌ Foto rechazada: [razón]"
   c. Si MANUAL_REVIEW:
      - Actualiza status='manual_review'
      - Admin debe revisar manualmente
   ↓
9. Usuario recibe notificación en la app
   ↓
10. Si rechazada y no se cambia en 24h:
    - Cron job ejecuta cleanup_expired_rejected_photos()
    - Borra foto del storage
    - Borra registro de la BD
    - Crea notificación "Foto eliminada automáticamente"
```

---

### 🆔 Flujo de Verificación de Identidad

```
1. Usuario toma selfie con su ID/Cédula
   ↓
2. Foto → Supabase Storage (photos-pending/)
   ↓
3. Registro creado con photo_type='verification'
   ↓
4. Webhook Handler llama a:
   POST http://localhost:5000/verify-identity
   Body: {
     "selfieUrl": "...",
     "userId": "...",
     "profileAge": 28
   }
   ↓
5. ML Validator verifica:
   ✅ Detecta 2 rostros (selfie + foto del ID)
   ✅ Detecta documento de identidad
   ✅ Extrae fecha de nacimiento con OCR
   ✅ Compara edad: documento vs perfil (±2 años)
   ✅ Compara rostros: selfie vs foto del ID (distancia < 0.5)
   ✅ Compara rostros: selfie vs perfil (distancia < 0.4)
   ↓
6. Si VERIFIED:
   - user_profiles.verified = true
   - user_profiles.verified_at = NOW()
   - Notificación: "🎉 Identidad verificada - Badge activado"
   ↓
7. 🗑️ IMPORTANTE: Foto del ID se borra INMEDIATAMENTE
   - No se guarda en ningún storage
   - Solo se guarda: verified=true + fecha
```

---

## 6. Monitoreo y Mantenimiento

### 6.1. Ver Logs en Tiempo Real

```bash
# ML Validator
tail -f ~/ml-validator/logs/ml_validator.log

# Webhook Handler
tail -f ~/ml-validator/logs/webhook_handler.log
```

---

### 6.2. Reiniciar Servicios

```bash
# Detener servicios
pkill -f "python server.py"
pkill -f "python supabase_integration.py"

# Iniciar de nuevo
cd ~/ml-validator
./start_services.sh
```

---

### 6.3. Verificar Estado

```bash
# Ver procesos corriendo
ps aux | grep python

# Ver puertos en uso
netstat -tulpn | grep -E '5000|5001'
```

---

### 6.4. Estadísticas de Fotos

```sql
-- Resumen de fotos por estado
SELECT 
    status,
    photo_type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h
FROM photos
GROUP BY status, photo_type
ORDER BY status, photo_type;

-- Usuarios con más fotos rechazadas
SELECT 
    u.username,
    COUNT(*) as rejected_count
FROM photos p
JOIN user_profiles u ON u.id = p.user_id
WHERE p.status = 'rejected'
GROUP BY u.username
ORDER BY rejected_count DESC
LIMIT 10;

-- Razones de rechazo más comunes
SELECT 
    rejection_reason,
    COUNT(*) as count
FROM photos
WHERE status = 'rejected'
GROUP BY rejection_reason
ORDER BY count DESC
LIMIT 10;
```

---

## 7. Troubleshooting

### ❌ Webhook no se dispara

**Solución:**
1. Verifica que el trigger existe:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%photo%';
   ```

2. Verifica la URL del webhook en Database > Webhooks

3. Prueba manualmente:
   ```bash
   curl -X POST http://192.168.1.159:5001/webhook/photo-uploaded \
     -H "Content-Type: application/json" \
     -d '{
       "type": "INSERT",
       "table": "photos",
       "record": {
         "id": "test-id",
         "user_id": "test-user",
         "photo_type": "profile",
         "storage_path": "test/path.jpg"
       }
     }'
   ```

---

### ❌ Error "Could not get photo URL"

**Solución:**
1. Verifica que `SUPABASE_SERVICE_KEY` esté configurado:
   ```bash
   echo $SUPABASE_SERVICE_KEY
   ```

2. Verifica que el storage bucket existe:
   - Ve a Storage en Supabase
   - Debe existir `photos-pending` (privado)

3. Verifica la ruta del archivo en el storage

---

### ❌ ML Validator no responde

**Solución:**
1. Verifica que está corriendo:
   ```bash
   curl http://localhost:5000/health
   ```

2. Si no responde, reinicia:
   ```bash
   pkill -f "python server.py"
   cd ~/ml-validator
   source venv/bin/activate
   python server.py > logs/ml_validator.log 2>&1 &
   ```

---

### ❌ Fotos no se eliminan después de 24h

**Solución:**
1. Verifica que el cron job existe:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'cleanup-expired-photos';
   ```

2. Ejecuta manualmente:
   ```sql
   SELECT cleanup_expired_rejected_photos();
   ```

3. Verifica los logs:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-expired-photos')
   ORDER BY start_time DESC
   LIMIT 10;
   ```

---

## 8. Seguridad

### 🔒 Recomendaciones

1. **Nunca expongas el `service_role` key públicamente**
   - Solo úsalo en el servidor (webhook handler)

2. **Usa HTTPS en producción**
   - Configura un certificado SSL (Let's Encrypt)
   - Usa Nginx como reverse proxy

3. **Rate limiting**
   - Limita el número de fotos por usuario/día
   - Implementa cooldown entre subidas

4. **Validación de tokens**
   - Verifica JWT tokens en el webhook handler

5. **Backup automático**
   - Configura backups diarios en Supabase

---

## ✅ Checklist de Instalación

- [ ] Schema SQL ejecutado en Supabase
- [ ] Storage buckets creados
- [ ] Políticas RLS aplicadas
- [ ] Variables de entorno configuradas (.env)
- [ ] Webhook handler descargado
- [ ] Dependencias instaladas (python-dotenv)
- [ ] Script de inicio creado (start_services.sh)
- [ ] Directorio de logs creado
- [ ] Servicios iniciados y funcionando
- [ ] Webhook configurado en Supabase
- [ ] Prueba exitosa con foto de prueba
- [ ] Notificaciones funcionando
- [ ] Cron job de limpieza verificado

---

¡Listo! 🎉 Tu sistema está completamente integrado con Supabase.
