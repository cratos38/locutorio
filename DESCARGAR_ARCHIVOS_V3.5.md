# 📦 ARCHIVOS DE DESCARGA - ML VALIDATOR v3.5 + SUPABASE

## 🌐 Servidor de Descarga
**URL Base:** https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/

---

## 📁 Archivos Principales

### 1. ML Validator v3.5 (Python)
```bash
wget -O server.py "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/server-v3.5-complete.py"
```
- **Tamaño:** 64 KB
- **Líneas:** 1669
- **Descripción:** Servidor ML con validaciones para perfil, álbum público y álbum privado

---

### 2. Webhook de Supabase v3.5 (Python)
```bash
wget -O supabase_webhook.py "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/supabase_webhook_v3.5.py"
```
- **Tamaño:** 17 KB
- **Líneas:** ~450
- **Descripción:** Webhook que conecta Supabase con ML Validator

---

### 3. Schema SQL v3.5
```bash
wget -O supabase-schema.sql "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/supabase-schema-v3.5.sql"
```
- **Tamaño:** 18 KB
- **Líneas:** ~650
- **Descripción:** Esquema completo de base de datos (tablas, triggers, funciones, policies)

---

### 4. Guía de Integración
```bash
wget -O GUIA_INTEGRACION.md "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/GUIA_INTEGRACION_SUPABASE_V3.5.md"
```
- **Tamaño:** 15 KB
- **Descripción:** Guía paso a paso de instalación y configuración

---

### 5. Resumen de Cambios v3.5
```bash
wget -O RESUMEN_CAMBIOS.md "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/RESUMEN_CAMBIOS_V3.5.md"
```
- **Tamaño:** 10 KB
- **Descripción:** Documentación de cambios en v3.5

---

### 6. Ejemplo de Archivo .env
```bash
wget -O .env.example "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/.env.example"
```
- **Tamaño:** <1 KB
- **Descripción:** Plantilla de variables de entorno

---

## 🚀 Instalación Rápida (Ubuntu)

### Opción 1: Descargar Todo

```bash
# Crear directorio
mkdir -p ~/ml-validator
cd ~/ml-validator

# Descargar todos los archivos
wget -O server.py "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/server-v3.5-complete.py"
wget -O supabase_webhook.py "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/supabase_webhook_v3.5.py"
wget -O supabase-schema.sql "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/supabase-schema-v3.5.sql"
wget -O GUIA_INTEGRACION.md "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/GUIA_INTEGRACION_SUPABASE_V3.5.md"
wget -O RESUMEN_CAMBIOS.md "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/RESUMEN_CAMBIOS_V3.5.md"
wget -O .env.example "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/.env.example"

# Verificar descargas
ls -lh
```

---

### Opción 2: Script de Instalación Automática

```bash
#!/bin/bash
# install_ml_validator_v3.5.sh

echo "📦 Instalando ML Validator v3.5 + Supabase Integration..."

# Variables
PROJECT_DIR="$HOME/ml-validator"
BASE_URL="https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai"

# Crear directorio
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Descargar archivos
echo "📥 Descargando archivos..."
wget -q -O server.py "$BASE_URL/server-v3.5-complete.py"
wget -q -O supabase_webhook.py "$BASE_URL/supabase_webhook_v3.5.py"
wget -q -O supabase-schema.sql "$BASE_URL/supabase-schema-v3.5.sql"
wget -q -O GUIA_INTEGRACION.md "$BASE_URL/GUIA_INTEGRACION_SUPABASE_V3.5.md"
wget -q -O RESUMEN_CAMBIOS.md "$BASE_URL/RESUMEN_CAMBIOS_V3.5.md"
wget -q -O .env.example "$BASE_URL/.env.example"

# Verificar descargas
echo "✅ Archivos descargados:"
ls -lh *.py *.sql *.md

# Crear directorio de logs
mkdir -p logs

# Copiar .env.example a .env
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Archivo .env creado. Por favor edítalo con tus credenciales:"
    echo "   nano .env"
fi

echo ""
echo "✅ Instalación completada!"
echo ""
echo "📖 Próximos pasos:"
echo "   1. Editar archivo .env con tus credenciales de Supabase"
echo "   2. Ejecutar schema SQL en Supabase"
echo "   3. Iniciar servicios: ./start_services.sh"
echo ""
echo "📚 Documentación:"
echo "   • Guía de integración: cat GUIA_INTEGRACION.md"
echo "   • Cambios v3.5:        cat RESUMEN_CAMBIOS.md"
```

**Usar el script:**

```bash
# Descargar script de instalación
wget -O install.sh "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/install_ml_validator_v3.5.sh"

# Hacer ejecutable
chmod +x install.sh

# Ejecutar
./install.sh
```

---

## 📋 Checklist de Instalación

### En tu Servidor Ubuntu:

- [ ] **1. Descargar archivos**
  ```bash
  cd ~/ml-validator
  wget -O server.py "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/server-v3.5-complete.py"
  wget -O supabase_webhook.py "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/supabase_webhook_v3.5.py"
  wget -O supabase-schema.sql "https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/supabase-schema-v3.5.sql"
  ```

- [ ] **2. Verificar archivos**
  ```bash
  wc -l server.py supabase_webhook.py supabase-schema.sql
  ```

- [ ] **3. Instalar dependencia**
  ```bash
  source venv/bin/activate
  pip install python-dotenv
  ```

- [ ] **4. Crear archivo .env**
  ```bash
  nano .env
  ```
  Contenido:
  ```
  SUPABASE_URL=https://tu-proyecto.supabase.co
  SUPABASE_SERVICE_KEY=tu_service_role_key
  ML_VALIDATOR_URL=http://localhost:5000
  ```

- [ ] **5. Crear script de inicio**
  ```bash
  # Descarga el script de inicio desde la guía o créalo manualmente
  chmod +x start_services.sh
  ```

- [ ] **6. Iniciar servicios**
  ```bash
  ./start_services.sh
  ```

- [ ] **7. Verificar health**
  ```bash
  curl http://localhost:5000/health
  curl http://localhost:5001/health
  ```

---

### En Supabase Dashboard:

- [ ] **1. Ejecutar Schema SQL**
  - SQL Editor → New Query → Pegar `supabase-schema.sql` → Run

- [ ] **2. Verificar tablas**
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('photos', 'user_profiles', 'notifications');
  ```

- [ ] **3. Verificar buckets**
  - Storage → Debe haber 4 buckets: `photos-pending`, `photos-approved`, `photos-cropped`, `albums-private`

- [ ] **4. Verificar triggers**
  ```sql
  SELECT tgname FROM pg_trigger WHERE tgname LIKE '%photo%';
  ```

- [ ] **5. Configurar Storage Policies** (ver guía completa)

---

## 🔗 URLs de Verificación

Después de la instalación, verifica que todo funcione:

```bash
# ML Validator Health Check
curl http://localhost:5000/health

# Webhook Health Check
curl http://localhost:5001/health

# Prueba de validación manual
curl -X POST http://localhost:5000/validate \
  -H "Content-Type: application/json" \
  -d '{"photoUrl":"https://ejemplo.com/foto.jpg","type":"profile"}'

# Prueba de webhook manual
curl -X POST http://localhost:5001/webhook/photo-uploaded \
  -H "Content-Type: application/json" \
  -d '{
    "photo_id": "00000000-0000-0000-0000-000000000001",
    "user_id": "00000000-0000-0000-0000-000000000002",
    "photo_type": "profile",
    "storage_path": "test/foto.jpg"
  }'
```

---

## 📚 Documentación Adicional

### Archivos Disponibles en el Servidor:

- `server-v3.4-complete.py` - Versión anterior (referencia)
- `server-v3.3-complete.py` - Versión anterior (referencia)
- `INSTRUCCIONES_V3.5.md` - Instrucciones adicionales
- Todos los archivos anteriores de versiones previas

### Ver Lista Completa:

```bash
# Navegar al servidor
https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/

# O usar curl para listar
curl https://8877-id54dgjudo7klxlkecudl-cc2fbc16.sandbox.novita.ai/
```

---

## 🆘 Soporte

Si tienes problemas:

1. **Consulta la guía:** `cat GUIA_INTEGRACION.md`
2. **Revisa los logs:**
   ```bash
   tail -f ~/ml-validator/logs/ml-validator.log
   tail -f ~/ml-validator/logs/webhook.log
   ```
3. **Verifica la configuración:**
   ```bash
   cat ~/.env
   ps aux | grep -E "server.py|supabase_webhook"
   netstat -tuln | grep -E "5000|5001"
   ```

---

**Versión:** 3.5  
**Fecha:** 2026-02-28  
**Servidor válido hasta:** ~1 hora desde la creación  

**Nota:** Si el servidor de descarga expira, contacta para obtener nuevas URLs.
