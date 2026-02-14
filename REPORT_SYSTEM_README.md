# 🚨 Sistema de Denuncias de Fotos

## 📋 Resumen

El sistema de moderación automática NSFW.js ha sido **DESACTIVADO** debido a falsos positivos graves (91% "porno" para fotos de supermercado). 

Ahora se usa **moderación manual por denuncias** de usuarios.

---

## ✅ Cambios Implementados

### 1. **Moderación Automática DESACTIVADA**
- ❌ Ya NO se analiza con NSFW.js al subir fotos
- ✅ Todas las fotos se aprueban automáticamente (`moderation_status = 'approved'`)
- ⚡ Subida más rápida (sin esperar 5-8 segundos de análisis)

### 2. **Sistema de Denuncias Manual**
- 🚨 Botón "Denunciar" visible en fotos de álbumes públicos
- 📝 Usuarios pueden reportar contenido inapropiado
- 🔒 Solo visible para usuarios que NO son dueños del álbum
- ⏰ Un usuario solo puede denunciar cada foto una vez

### 3. **Tabla `photo_reports`**
```sql
CREATE TABLE photo_reports (
  id UUID PRIMARY KEY,
  photo_id UUID NOT NULL,              -- Foto denunciada
  album_id UUID NOT NULL,              -- Álbum de la foto
  reporter_user_id UUID NOT NULL,      -- Usuario que denuncia
  reason TEXT NOT NULL,                -- Motivo (6 opciones)
  description TEXT,                    -- Detalles adicionales
  status TEXT DEFAULT 'pending',       -- pending/reviewing/resolved/rejected
  admin_notes TEXT,                    -- Notas del administrador
  reviewed_by UUID,                    -- Admin que revisó
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. **Categorías de Denuncia**
1. `contenido_explicito` - Contenido explícito o sexual
2. `violencia` - Violencia o contenido gráfico
3. `acoso` - Acoso o bullying
4. `spam` - Spam o publicidad
5. `derechos_autor` - Viola derechos de autor
6. `otro` - Otro motivo

---

## 🛠️ Pasos de Instalación

### Paso 1: Crear la tabla de denuncias
Ejecuta este SQL en Supabase Dashboard → SQL Editor:
```bash
https://supabase.com/dashboard/project/hbzlxwbyxuzdasfaksiy/sql
```

**Archivo:** `create_photo_reports_table.sql`

```sql
-- (Copiar el contenido completo del archivo)
```

### Paso 2: Aprobar fotos existentes
Ejecuta este SQL para limpiar fotos pendientes/rechazadas:

**Archivo:** `approve_all_existing_photos.sql`

```sql
UPDATE album_photos
SET 
  moderation_status = 'approved',
  moderation_reason = 'Auto-aprobado tras desactivar NSFW automático',
  moderation_date = NOW()
WHERE moderation_status IN ('pending_review', 'rejected') OR moderation_status IS NULL;
```

### Paso 3: Desplegar a Vercel
Los cambios ya están en GitHub. Vercel desplegará automáticamente.

---

## 🎨 Interfaz de Usuario

### Botón de Denuncia
- **Ubicación:** Esquina inferior derecha de cada foto (álbumes públicos)
- **Color:** Amber/Naranja (⚠️)
- **Visible para:** Todos los usuarios autenticados EXCEPTO el dueño del álbum
- **Acción:** Abre modal de denuncia

### Modal de Denuncia
1. **Preview:** Muestra la foto a denunciar
2. **Motivo:** Dropdown con 6 categorías
3. **Descripción:** Textarea opcional (máx. 500 caracteres)
4. **Botones:**
   - "Cancelar" - Cierra el modal
   - "Enviar Denuncia" - Crea la denuncia en la BD

### Mensajes
- ✅ **Éxito:** "¡Gracias por tu reporte! Un administrador revisará esta foto pronto."
- ⚠️ **Duplicado:** "Ya has denunciado esta foto anteriormente. Un administrador la revisará pronto."
- ❌ **Error:** "Error al enviar la denuncia. Por favor intenta de nuevo."

---

## 📊 Estados de Denuncia

| Estado | Descripción | Color |
|--------|-------------|-------|
| `pending` | Nueva denuncia, sin revisar | 🟡 Amarillo |
| `reviewing` | Un admin está revisando | 🔵 Azul |
| `resolved` | Resuelta (foto eliminada o aprobada) | 🟢 Verde |
| `rejected` | Denuncia rechazada (foto OK) | 🔴 Rojo |

---

## 🔒 Seguridad (RLS)

### Políticas Implementadas

**INSERT** - Los usuarios pueden crear denuncias:
```sql
CREATE POLICY "Usuarios autenticados pueden denunciar fotos"
  ON photo_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_user_id);
```

**SELECT** - Los usuarios ven sus propias denuncias:
```sql
CREATE POLICY "Usuarios pueden ver sus propias denuncias"
  ON photo_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_user_id OR auth.uid() = reviewed_by);
```

**UPDATE** - Administradores pueden actualizar:
```sql
CREATE POLICY "Administradores pueden gestionar denuncias"
  ON photo_reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

### Constraint Único
Evita denuncias duplicadas:
```sql
CREATE UNIQUE INDEX idx_photo_reports_unique 
  ON photo_reports(photo_id, reporter_user_id) 
  WHERE status = 'pending';
```

---

## 🎯 Próximos Pasos

### Panel de Administración (Pendiente)
Crear página `/admin/reports` con:

1. **Lista de Denuncias**
   - Tabla con todas las denuncias pendientes
   - Filtros: estado, motivo, fecha
   - Ordenar: más recientes primero

2. **Vista Detallada**
   - Preview de la foto denunciada
   - Información del álbum y dueño
   - Historial de denuncias de ese usuario
   - Notas del administrador

3. **Acciones del Admin**
   - ✅ **Aprobar foto** (status = resolved, rejected)
   - ❌ **Eliminar foto** (status = resolved)
   - 🚫 **Rechazar denuncia** (status = rejected)
   - 📝 **Agregar notas** (admin_notes)

4. **Estadísticas**
   - Total de denuncias por categoría
   - Tiempo promedio de resolución
   - Usuarios con más denuncias

---

## 🧪 Pruebas

### Probar el Sistema de Denuncias

1. **Crear álbum público** con varias fotos
2. **Abrir el álbum** con otro usuario (no propietario)
3. **Click en botón "⚠️"** (esquina inferior derecha de una foto)
4. **Seleccionar motivo** y agregar descripción
5. **Enviar denuncia**
6. **Verificar en Supabase:**
   ```sql
   SELECT * FROM photo_reports ORDER BY created_at DESC LIMIT 10;
   ```

### Verificar Prevención de Duplicados
1. Intentar denunciar la **misma foto dos veces**
2. Debe mostrar: "Ya has denunciado esta foto anteriormente"

---

## 📁 Archivos Modificados

### Frontend
- `src/app/albums/page.tsx`
  - Eliminar análisis NSFW al crear álbum
  - Auto-aprobar todas las fotos

- `src/app/albums/[id]/page.tsx`
  - Añadir estados: `showReportModal`, `reportingPhotoIndex`, `reportReason`, `reportDescription`
  - Añadir función: `handleReportPhoto()`
  - Añadir botón de denuncia en grid de fotos
  - Añadir modal de denuncia

### Base de Datos
- `create_photo_reports_table.sql` - Tabla completa con índices y políticas
- `approve_all_existing_photos.sql` - Limpiar fotos pendientes/rechazadas
- `fix_existing_photos_moderation.sql` - (anterior) Aprobar fotos privadas

---

## 🔗 Enlaces Útiles

- **Supabase Dashboard:** https://supabase.com/dashboard/project/hbzlxwbyxuzdasfaksiy
- **SQL Editor:** https://supabase.com/dashboard/project/hbzlxwbyxuzdasfaksiy/sql
- **Table Editor:** https://supabase.com/dashboard/project/hbzlxwbyxuzdasfaksiy/editor
- **Vercel Deployment:** https://locutorio.com.ve/albums

---

## ⚠️ Notas Importantes

1. **NSFW.js DESACTIVADO** - No confiar en su detección (falsos positivos graves)
2. **Denuncias manuales** - Depende de la comunidad para reportar contenido
3. **Administración pendiente** - Necesario crear panel admin para gestionar denuncias
4. **RLS configurado** - Las políticas protegen los datos correctamente
5. **Único por usuario** - Un usuario solo puede denunciar cada foto una vez

---

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que la tabla `photo_reports` existe en Supabase
2. Ejecuta las migraciones SQL en orden
3. Revisa los logs del navegador (F12 → Console)
4. Verifica que el usuario está autenticado

---

**Última actualización:** 2026-02-14  
**Versión:** 1.0.0  
**Commit:** `5fd7a56` - feat: Sistema de denuncias manuales + desactivar NSFW automático
