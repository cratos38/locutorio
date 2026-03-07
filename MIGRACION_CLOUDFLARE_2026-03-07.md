# 🚀 Migración a Cloudflare D1 + R2

**Fecha:** 2026-03-07  
**Estado:** En progreso

---

## 📋 **Credenciales configuradas:**

### **Cloudflare R2 (Storage):**
```
Account ID: 130f04e76a4e3a1c4ce2b048a4422ee7
Endpoint: https://130f04e76a4e3a1c4ce2b048a4422ee7.r2.cloudflarestorage.com
```

### **Buckets creados (9):**
1. ✅ `photos-profile-pending` (privado)
2. ✅ `photos-profile-approved` (público) → https://pub-120688e0a3084219a049f90bc8e2dece.r2.dev
3. ✅ `photos-profile-rejected` (privado)
4. ✅ `photos-albums-pending` (privado)
5. ✅ `photos-albums-approved` (público) → https://pub-75ac634676f8440aae96e50c823c14f9.r2.dev
6. ✅ `photos-albums-rejected` (privado)
7. ✅ `users-files` (privado)
8. ✅ `photo-reports` (privado)
9. ✅ `photo-appeals` (privado)

### **Cloudflare D1 (Database):**
```
Database ID: 689222cb-b8eb-4c77-8638-4b0a58fd66e9
Database name: locutorio
Location: Western North America
```

---

## 📊 **Datos actuales en Supabase:**

### **Usuario admin:**
- ID: `ae346f5e-4a0e-419f-aa5a-0ecf6ecc9b3c`
- Username: `admin`
- Email: `admin@locutorio.com.ve`
- Fotos: 0
- Álbumes: 1 (con 3 fotos)

### **Tablas existentes:**
- ✅ `users` (con datos del admin)
- ✅ `photos` (vacía)
- ✅ `albums` (1 álbum del admin)
- ⚠️ `messages` (no existe)
- ✅ `notifications` (vacía)
- ✅ `user_profiles` (vacía)

---

## 🔄 **Plan de migración:**

### **Fase 1: Configuración (✅ COMPLETADO)**
1. ✅ Crear cuenta Cloudflare
2. ✅ Crear 9 buckets en R2
3. ✅ Configurar 2 buckets públicos
4. ✅ Crear API token de R2
5. ✅ Crear base de datos D1
6. ✅ Configurar `.env.local`

### **Fase 2: Migración de Base de Datos (EN PROGRESO)**
1. 🔄 Crear esquema SQLite para D1
2. ⏳ Importar datos del usuario admin
3. ⏳ Verificar integridad de datos

### **Fase 3: Migración de Storage (PENDIENTE)**
1. ⏳ Actualizar código de subida de fotos para usar R2
2. ⏳ Copiar fotos existentes de Supabase → R2
3. ⏳ Actualizar URLs de fotos en la base de datos

### **Fase 4: Actualización de Código (PENDIENTE)**
1. ⏳ Actualizar API routes para usar D1
2. ⏳ Actualizar API routes para usar R2
3. ⏳ Actualizar ML Validator para leer desde R2
4. ⏳ Probar flujo completo

### **Fase 5: Despliegue (PENDIENTE)**
1. ⏳ Deploy a Vercel
2. ⏳ Verificar login
3. ⏳ Verificar subida de fotos
4. ⏳ Verificar avatar
5. ⏳ Verificar álbumes

---

## 🎯 **Ventajas de la nueva arquitectura:**

| Aspecto | Supabase | Cloudflare D1 + R2 |
|---------|----------|-------------------|
| **Storage** | 1 GB | 10 GB |
| **DB Size** | 500 MB | 5 GB |
| **Transferencia** | 2 GB/mes | Ilimitada |
| **Backups** | ❌ No | ✅ Sí |
| **Costo** | $0 (luego $25/mes) | $0 hasta 10,000 usuarios |
| **Escalabilidad** | Limitada | Alta |

---

## 📝 **Notas importantes:**

1. ⚠️ **Supabase Auth se mantiene** - Solo migramos DB + Storage
2. ✅ **Sin downtime** - Solo 1 usuario (admin) actualmente
3. 🔒 **Seguridad** - Buckets privados usan signed URLs
4. 🌐 **CDN global** - Fotos rápidas en toda Latinoamérica
5. 💾 **Backups automáticos** - D1 hace snapshots diarios

---

## 🚀 **Siguiente paso:**

Crear esquema SQLite en Cloudflare D1 e importar datos del usuario admin.

---

## 📊 **Progreso actual:**

### ✅ **COMPLETADO:**

1. ✅ Cuenta Cloudflare creada
2. ✅ 9 buckets R2 creados
3. ✅ 2 buckets públicos configurados
4. ✅ API token R2 generado
5. ✅ Base de datos D1 creada
6. ✅ `.env.local` configurado con credenciales
7. ✅ Wrangler CLI instalado
8. ✅ Esquema SQLite creado (`d1_schema.sql`)
9. ✅ Esquema ejecutado en D1 local

### ⚠️ **PROBLEMA ACTUAL:**

El API token actual solo tiene permisos para R2, no para D1.

**Solución temporal:** Vamos a enfocarnos primero en migrar el **storage (R2)** que es lo más importante y urgente. La migración de la base de datos a D1 la haremos después cuando tengamos un token con permisos completos.

### 🎯 **NUEVO PLAN:**

**Fase A: Migrar Storage a R2 (HOY - 1 hora)**
1. ⏳ Actualizar código de subida de fotos para usar R2
2. ⏳ Probar subida de fotos a R2
3. ⏳ Verificar que el avatar funciona con R2
4. ⏳ Deploy a Vercel

**Fase B: Mantener DB en Supabase (temporal)**
1. ✅ Supabase PostgreSQL sigue siendo la base de datos
2. ✅ Solo cambiamos el storage (fotos) a R2
3. ✅ Ventaja inmediata: 10 GB de storage gratis vs 1 GB

**Fase C: Migrar DB a D1 (después, cuando tengamos token completo)**
1. ⏳ Crear nuevo API token con permisos de Workers + D1
2. ⏳ Ejecutar esquema en D1 remoto
3. ⏳ Migrar datos de usuarios/fotos/álbumes
4. ⏳ Actualizar código para usar D1
5. ⏳ Deploy final

---

## 💡 **Ventajas del enfoque híbrido (R2 + Supabase):**

| Componente | Servicio | Límite Gratis | Ventaja |
|------------|----------|---------------|---------|
| **Auth** | Supabase | 50,000 usuarios/mes | ✅ Ya funciona |
| **Database** | Supabase | 500 MB | ✅ Suficiente por ahora |
| **Storage** | Cloudflare R2 | 10 GB | ✅ 10x más espacio |
| **Transfer** | Cloudflare R2 | Ilimitado | ✅ No se cobra nada |

**Costo actual:** $0/mes hasta ~5,000 usuarios

**Cuando crezcas:** Solo necesitas upgrade de Supabase DB ($25/mes) o migrar a D1 (gratis).

---

## 🚀 **Siguiente paso:**

Actualizar el código de subida de fotos para usar Cloudflare R2 en lugar de Supabase Storage.

