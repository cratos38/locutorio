# 🚀 MIGRACIÓN A PLANETSCALE + CLOUDFLARE R2

**Fecha:** 2026-03-01  
**Estado:** En progreso  
**Duración estimada:** 3-4 horas

---

## 📋 PASO 1: CREAR CUENTAS (15 min)

### 1.1 PlanetScale (Base de datos MySQL)

1. Ve a: https://planetscale.com/
2. Clic en "Sign up"
3. Registrarte con GitHub (más fácil)
4. Crear nueva base de datos:
   - Name: `locutorio`
   - Region: `AWS us-east-1` (más cercano)
   - Plan: `Hobby (Free)`

5. **Guardar credenciales:**
   ```
   Host: aws.connect.psdb.cloud
   Username: [COPIAR AQUÍ]
   Password: [COPIAR AQUÍ]
   Database: locutorio
   ```

### 1.2 Cloudflare R2 (Almacenamiento de fotos)

1. Ve a: https://dash.cloudflare.com/
2. Clic en "R2" (menú izquierdo)
3. Clic en "Create bucket"
4. Crear 3 buckets:
   - `photos-pending` (privado)
   - `photos-approved` (público)
   - `photos-rejected` (privado)

5. Crear API Token:
   - R2 → Manage R2 API Tokens → Create API Token
   - Name: `locutorio-validator`
   - Permissions: Object Read & Write
   - TTL: No expiry

6. **Guardar credenciales:**
   ```
   Account ID: [COPIAR AQUÍ]
   Access Key ID: [COPIAR AQUÍ]
   Secret Access Key: [COPIAR AQUÍ]
   Endpoint: https://[account-id].r2.cloudflarestorage.com
   ```

---

## 📋 PASO 2: EXPORTAR DATOS DE SUPABASE (10 min)

### 2.1 Exportar esquema de base de datos

**En Supabase Dashboard:**
1. Ve a: Database → SQL Editor
2. Ejecuta este script para ver las tablas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

3. Para cada tabla, ejecuta:

```sql
-- Ver estructura de tabla photos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'photos'
ORDER BY ordinal_position;

-- Exportar datos (copiar resultado)
SELECT * FROM photos;

-- Repetir para: users, albums, etc.
```

### 2.2 Descargar fotos actuales

**Listar fotos en Supabase:**
- Storage → photos-pending → Ver archivos
- Descargar las ~3-5 fotos de prueba

---

## 📋 PASO 3: CONVERTIR ESQUEMA PostgreSQL → MySQL (30 min)

### 3.1 Diferencias a convertir:

| PostgreSQL (Supabase) | MySQL (PlanetScale) |
|-----------------------|---------------------|
| `UUID` | `VARCHAR(36)` o `CHAR(36)` |
| `TIMESTAMP WITH TIME ZONE` | `TIMESTAMP` |
| `JSONB` | `JSON` |
| `TEXT[]` (array) | `TEXT` (separado por comas) o tabla separada |
| `SERIAL` | `AUTO_INCREMENT` |

### 3.2 Ejemplo de conversión:

**ANTES (PostgreSQL):**
```sql
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    storage_url TEXT NOT NULL,
    cropped_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    validation_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_primary BOOLEAN DEFAULT FALSE
);
```

**DESPUÉS (MySQL):**
```sql
CREATE TABLE photos (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    storage_url TEXT NOT NULL,
    cropped_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    validation_result JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_primary BOOLEAN DEFAULT FALSE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 📋 PASO 4: IMPORTAR A PLANETSCALE (20 min)

### 4.1 Conectar a PlanetScale

**Opción A: Web Console**
- PlanetScale Dashboard → Database → Console

**Opción B: CLI (Recomendado)**
```bash
# Instalar PlanetScale CLI
brew install planetscale/tap/pscale  # Mac
# O descargar desde: https://github.com/planetscale/cli

# Login
pscale auth login

# Conectar a la base de datos
pscale shell locutorio main
```

### 4.2 Crear tablas

Ejecutar los scripts SQL convertidos (uno por uno).

### 4.3 Importar datos del usuario admin

```sql
INSERT INTO users (id, username, email, ...) VALUES (...);
INSERT INTO photos (id, user_id, ...) VALUES (...);
```

---

## 📋 PASO 5: SUBIR FOTOS A CLOUDFLARE R2 (15 min)

### 5.1 Usar AWS CLI (R2 es compatible con S3)

```bash
# Instalar AWS CLI
brew install awscli  # Mac
# O: pip install awscli

# Configurar credenciales de R2
aws configure --profile r2
# AWS Access Key ID: [tu Access Key de R2]
# AWS Secret Access Key: [tu Secret Key de R2]
# Default region: auto
# Default output: json

# Subir fotos
aws s3 cp foto1.jpg s3://photos-pending/admin/foto1.jpg \
    --endpoint-url https://[account-id].r2.cloudflarestorage.com \
    --profile r2
```

---

## 📋 PASO 6: ACTUALIZAR CÓDIGO FRONTEND (30 min)

### 6.1 Instalar dependencias

```bash
cd /home/user/webapp
npm install mysql2
npm install @aws-sdk/client-s3
```

### 6.2 Crear archivo de configuración

**`src/lib/planetscale.ts`:**
```typescript
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.PLANETSCALE_HOST,
  user: process.env.PLANETSCALE_USERNAME,
  password: process.env.PLANETSCALE_PASSWORD,
  database: process.env.PLANETSCALE_DATABASE,
  ssl: {
    rejectUnauthorized: true
  }
});
```

**`src/lib/r2.ts`:**
```typescript
import { S3Client } from '@aws-sdk/client-s3';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  }
});
```

### 6.3 Actualizar `.env.local`

```bash
# PlanetScale
PLANETSCALE_HOST=aws.connect.psdb.cloud
PLANETSCALE_USERNAME=...
PLANETSCALE_PASSWORD=...
PLANETSCALE_DATABASE=locutorio

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-[hash].r2.dev
```

### 6.4 Actualizar APIs principales

**Archivos a modificar:**
- `src/app/api/profile/route.ts`
- `src/app/api/photos/upload/route.ts`
- `src/app/api/photos/route.ts`
- `src/app/api/photos/[id]/route.ts`

---

## 📋 PASO 7: ACTUALIZAR ML VALIDATOR (45 min)

### 7.1 Instalar dependencias en el servidor

```bash
ssh [tu-servidor]
cd ~/ml-validator
source venv/bin/activate
pip install mysql-connector-python boto3
```

### 7.2 Actualizar `server.py`

**Cambiar conexión a base de datos:**
```python
# ANTES
from supabase import create_client
supabase = create_client(url, key)

# DESPUÉS
import mysql.connector
db = mysql.connector.connect(
    host=os.getenv('PLANETSCALE_HOST'),
    user=os.getenv('PLANETSCALE_USERNAME'),
    password=os.getenv('PLANETSCALE_PASSWORD'),
    database=os.getenv('PLANETSCALE_DATABASE'),
    ssl_ca='/etc/ssl/certs/ca-certificates.crt'
)
```

**Cambiar Storage a R2:**
```python
import boto3

r2 = boto3.client(
    's3',
    endpoint_url=os.getenv('R2_ENDPOINT'),
    aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY')
)
```

---

## 📋 PASO 8: TESTING (30 min)

### 8.1 Tests críticos

- [ ] Login funciona
- [ ] Ver perfil funciona
- [ ] Subir foto funciona
- [ ] Avatar se muestra
- [ ] ML Validator procesa foto
- [ ] Foto aprobada se mueve a photos-approved
- [ ] Foto rechazada se mueve a photos-rejected

---

## 📋 PASO 9: DEPLOY FINAL (10 min)

```bash
cd /home/user/webapp
git add .
git commit -m "migrate: PlanetScale + Cloudflare R2"
git push
```

Vercel auto-deploy.

---

## 📋 PASO 10: APAGAR SUPABASE (5 min)

1. Exportar backup final de Supabase
2. Descargar todas las fotos
3. Pausar proyecto en Supabase (para no gastar recursos)

---

## ✅ CHECKLIST FINAL

- [ ] PlanetScale funcionando
- [ ] Cloudflare R2 funcionando
- [ ] Frontend funcionando
- [ ] ML Validator funcionando
- [ ] Avatar se muestra
- [ ] Fotos se suben correctamente
- [ ] Backup de Supabase descargado

---

_Documento creado: 2026-03-01_
