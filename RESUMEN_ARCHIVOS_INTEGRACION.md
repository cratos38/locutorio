# 📦 ARCHIVOS DE INTEGRACIÓN - ML Validator v3.4 + Supabase

## ✅ Estado: COMPLETO Y LISTO PARA DESCARGAR

---

## 📁 Archivos Principales

### **1. Servidor ML Validator**
- **Archivo**: `server-v3.4-complete.py`
- **Tamaño**: 57 KB
- **Descripción**: Servidor completo con todas las validaciones
- **Puerto**: 5000
- **Funciones**:
  - ✅ Validación de fotos (perfil y álbum)
  - ✅ Verificación de identidad con ID/Cédula
  - ✅ NSFW Detection
  - ✅ OCR (texto, teléfonos, URLs)
  - ✅ Detección de objetos prohibidos
  - ✅ Face Matching (celebridades)
  - ✅ AI/Deepfake Detection

**Descargar:**
```bash
cd ~/ml-validator
wget https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/server-v3.4-complete.py -O server.py
```

---

### **2. Webhook Handler (Integración con Supabase)**
- **Archivo**: `supabase_integration.py`
- **Tamaño**: 11 KB
- **Descripción**: Servicio que conecta Supabase con ML Validator
- **Puerto**: 5001
- **Funciones**:
  - 📨 Recibe webhooks de Supabase
  - 🤖 Llama al ML Validator
  - 📊 Actualiza resultados en Supabase
  - 🗑️ Borra archivos temporales

**Descargar:**
```bash
cd ~/ml-validator
wget https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/supabase_integration.py
```

---

### **3. Schema SQL de Supabase**
- **Archivo**: `supabase-schema.sql`
- **Tamaño**: 14 KB
- **Descripción**: Schema completo de base de datos
- **Incluye**:
  - 📋 Tablas: `photos`, `user_profiles`, `notifications`
  - 🗄️ Storage buckets
  - 🔒 Políticas RLS
  - ⚙️ Triggers y funciones
  - ⏰ Cron job para limpieza automática

**Usar:**
1. Abre Supabase SQL Editor
2. Copia y pega el contenido
3. Ejecuta

---

### **4. Edge Function de Supabase (Alternativa)**
- **Archivo**: `supabase-edge-function.ts`
- **Tamaño**: 6.8 KB
- **Descripción**: Edge Function de Supabase (si no puedes usar webhook)
- **Uso**: Para cuando el servidor no tiene IP pública

---

### **5. Ejemplos de Cliente (App)**
- **Archivo**: `client-examples.ts`
- **Tamaño**: 19 KB
- **Descripción**: Ejemplos completos de cómo usar desde la app
- **Incluye**:
  - 📤 Subir foto de perfil
  - 📸 Subir foto de álbum
  - 🆔 Verificación de identidad
  - 👂 Escuchar cambios en tiempo real
  - 🔔 Notificaciones
  - 📊 Estadísticas
  - ⚛️ Componentes React

---

### **6. Guía de Instalación Completa**
- **Archivo**: `GUIA_INSTALACION_SUPABASE.md`
- **Tamaño**: 15 KB
- **Descripción**: Guía paso a paso para instalar todo
- **Incluye**:
  - 📋 Configuración de Supabase
  - 🔧 Instalación del webhook handler
  - 🌐 Configuración del webhook
  - 🧪 Pruebas
  - 🔍 Troubleshooting
  - ✅ Checklist

---

## 🚀 Instalación Rápida

### Paso 1: Descargar archivos en el servidor

```bash
cd ~/ml-validator

# Servidor ML Validator v3.4
wget https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/server-v3.4-complete.py -O server.py

# Webhook Handler
wget https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/supabase_integration.py

# Guía de instalación
wget https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/GUIA_INSTALACION_SUPABASE.md

# Ejemplos de cliente
wget https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/client-examples.ts
```

---

### Paso 2: Configurar variables de entorno

```bash
cd ~/ml-validator
nano .env
```

Pegar:
```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu-service-role-key-aquí
ML_VALIDATOR_URL=http://localhost:5000
```

---

### Paso 3: Instalar dependencias

```bash
cd ~/ml-validator
source venv/bin/activate
pip install python-dotenv
```

---

### Paso 4: Crear script de inicio

```bash
nano ~/ml-validator/start_services.sh
```

Pegar:
```bash
#!/bin/bash

export $(grep -v '^#' .env | xargs)
cd ~/ml-validator
source venv/bin/activate

mkdir -p logs

echo "🚀 Iniciando ML Validator (puerto 5000)..."
python server.py > logs/ml_validator.log 2>&1 &
ML_PID=$!

sleep 5

echo "🔗 Iniciando Webhook Handler (puerto 5001)..."
python supabase_integration.py > logs/webhook_handler.log 2>&1 &
WEBHOOK_PID=$!

echo ""
echo "✅ Servicios iniciados"
echo "   ML Validator PID: $ML_PID"
echo "   Webhook Handler PID: $WEBHOOK_PID"
echo ""
echo "Logs:"
echo "   tail -f logs/ml_validator.log"
echo "   tail -f logs/webhook_handler.log"
```

```bash
chmod +x ~/ml-validator/start_services.sh
```

---

### Paso 5: Configurar Supabase

1. **Ejecutar schema SQL:**
   - Descargar `supabase-schema.sql`
   - Abrir SQL Editor en Supabase
   - Copiar y pegar el contenido
   - Ejecutar

2. **Configurar webhook:**
   - Database > Webhooks
   - Create new hook
   - Nombre: `photo-validation-webhook`
   - Tabla: `photos`
   - Evento: `INSERT`
   - URL: `http://TU-IP:5001/webhook/photo-uploaded`

---

### Paso 6: Iniciar servicios

```bash
cd ~/ml-validator
./start_services.sh
```

---

### Paso 7: Verificar

```bash
# ML Validator
curl http://localhost:5000/health

# Webhook Handler
curl http://localhost:5001/health
```

---

## 📊 URLs de Descarga

Todos los archivos están disponibles en:

```
https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/
```

### Archivos disponibles:

1. ✅ `server-v3.4-complete.py` - Servidor ML Validator
2. ✅ `supabase_integration.py` - Webhook Handler
3. ✅ `supabase-schema.sql` - Schema de base de datos
4. ✅ `supabase-edge-function.ts` - Edge Function (alternativa)
5. ✅ `client-examples.ts` - Ejemplos para la app
6. ✅ `GUIA_INSTALACION_SUPABASE.md` - Guía completa

---

## 🎯 Flujo Completo

```
1. Usuario sube foto desde la app
   ↓
2. Foto → Supabase Storage (photos-pending/)
   ↓
3. Trigger INSERT en tabla 'photos'
   ↓
4. Webhook → http://tu-servidor:5001/webhook/photo-uploaded
   ↓
5. Webhook Handler:
   - Obtiene URL firmada de Supabase
   - Llama a ML Validator (localhost:5000)
   ↓
6. ML Validator procesa (2-3 segundos):
   - Detecta rostros
   - Verifica identidad
   - Detecta IA/Deepfakes
   - Analiza NSFW
   - Detecta texto/objetos prohibidos
   ↓
7. Webhook Handler actualiza Supabase:
   - APPROVE → status='approved', foto visible
   - REJECT → status='rejected', expires_at=+24h
   - MANUAL_REVIEW → revisión manual
   ↓
8. Trigger crea notificación para el usuario
   ↓
9. Usuario recibe notificación en tiempo real
   ↓
10. Si rechazada y no se cambia en 24h:
    - Cron job elimina foto automáticamente
```

---

## 🆔 Verificación de Identidad

```
1. Usuario toma selfie con ID/Cédula
   ↓
2. Foto → Supabase Storage
   ↓
3. Webhook Handler llama a /verify-identity
   ↓
4. ML Validator verifica:
   - 2 rostros (selfie + foto del ID)
   - Documento de identidad detectado
   - Fecha de nacimiento extraída (OCR)
   - Edad coincide (±2 años)
   - Rostros coinciden (selfie ↔ ID ↔ perfil)
   ↓
5. Si VERIFIED:
   - user_profiles.verified = true
   - Badge de verificación activado
   ↓
6. 🗑️ Foto del ID se BORRA INMEDIATAMENTE
```

---

## ✅ Checklist Final

- [ ] Servidor ML Validator v3.4 descargado
- [ ] Webhook Handler descargado
- [ ] Schema SQL ejecutado en Supabase
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] Script de inicio creado
- [ ] Servicios iniciados
- [ ] Health checks OK
- [ ] Webhook configurado en Supabase
- [ ] Prueba con foto de prueba exitosa
- [ ] Notificaciones funcionando
- [ ] Cron job de limpieza verificado

---

## 🆘 Soporte

Si tienes problemas:

1. **Verifica logs:**
   ```bash
   tail -f ~/ml-validator/logs/ml_validator.log
   tail -f ~/ml-validator/logs/webhook_handler.log
   ```

2. **Verifica servicios:**
   ```bash
   ps aux | grep python
   netstat -tulpn | grep -E '5000|5001'
   ```

3. **Reinicia servicios:**
   ```bash
   pkill -f "python server.py"
   pkill -f "python supabase_integration.py"
   cd ~/ml-validator
   ./start_services.sh
   ```

4. **Consulta la guía:**
   ```bash
   cat ~/ml-validator/GUIA_INSTALACION_SUPABASE.md
   ```

---

## 🎉 ¡Listo!

Tu sistema está completamente integrado con:

- ✅ Validación automática de fotos
- ✅ Verificación de identidad con ID
- ✅ Notificaciones en tiempo real
- ✅ Limpieza automática de fotos rechazadas
- ✅ Privacidad total (fotos de ID se borran)
- ✅ Storage optimizado (público/privado)
- ✅ Sistema de revisión manual
- ✅ Estadísticas y reportes

---

**Fecha de creación**: 2026-02-28  
**Versión**: 3.4  
**Estado**: ✅ PRODUCCIÓN
