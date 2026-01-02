# 🗺️ MAPEO COMPLETO DE RUTAS - PROYECTO LOCUTORIO

## 📊 ESTADÍSTICAS:
- **35 referencias** a `/connect`
- **14 referencias** a `/inicio`
- **Total a cambiar**: ~49 referencias

---

## 🎯 CAMBIOS A REALIZAR:

### **CAMBIO #1: Landing Page**
```
ANTES                    →    DESPUÉS
────────────────────────────────────────
Carpeta: /connect/       →    Carpeta: / (contenido movido a page.tsx)
Ruta: /connect           →    Ruta: / (sin redirect)
Nombre en nav: "Inicio"  →    Nombre: "Inicio" (correcto)
```

**Referencias a actualizar (35):**
- `href="/connect"` → `href="/"`
- `router.push("/connect")` → `router.push("/")`
- `Link to="/connect"` → `Link to="/"`

---

### **CAMBIO #2: Mi Espacio (después de login)**
```
ANTES                    →    DESPUÉS
────────────────────────────────────────
Carpeta: /inicio/        →    Carpeta: /mi-espacio/
Ruta: /inicio            →    Ruta: /mi-espacio
Nombre en nav: "Mi Espacio" →  Nombre: "Mi Espacio" (correcto)
```

**Referencias a actualizar (14):**
- `href="/inicio"` → `href="/mi-espacio"`
- `router.push("/inicio")` → `router.push("/mi-espacio")`
- `Link to="/inicio"` → `Link to="/mi-espacio"`

---

## 🔧 PLAN DE EJECUCIÓN:

### **FASE 1: PREPARACIÓN (5 min)**
1. ✅ Crear documento de mapeo completo
2. ✅ Listar TODOS los archivos afectados
3. ✅ Hacer backup de seguridad

### **FASE 2: CAMBIAR /connect → / (20 min)**
1. Mover contenido de `/connect/page.tsx` a `/page.tsx`
2. Actualizar las 35 referencias de `/connect` a `/`
3. Eliminar carpeta `/connect/` (después de verificar)
4. Probar que funciona

### **FASE 3: CAMBIAR /inicio → /mi-espacio (15 min)**
1. Renombrar carpeta `/inicio/` a `/mi-espacio/`
2. Actualizar las 14 referencias de `/inicio` a `/mi-espacio`
3. Probar que funciona

### **FASE 4: VERIFICACIÓN (10 min)**
1. Probar todas las rutas principales
2. Verificar navegación entre páginas
3. Confirmar que no hay 404s
4. Commit final

**⏱️ TIEMPO TOTAL ESTIMADO: ~50 minutos**

---

## 📝 ARCHIVOS QUE NECESITAN CAMBIOS:

### **Archivos con /connect (35 referencias):**
```bash
# Buscando...
Generando lista de archivos con /connect...
src/app/connect/page.tsx
src/app/connect/tutorial/busqueda/page.tsx
src/app/connect/tutorial/chat/page.tsx
src/app/connect/tutorial/foto-albumes/page.tsx
src/app/connect/tutorial/la-cuenta/page.tsx
src/app/connect/tutorial/page.tsx
src/app/page.tsx
src/components/FloatingMessagesWindow.tsx
src/components/InternalHeader.tsx

### **Archivos con /inicio (14 referencias):**
src/app/ajustes/perfil/page.tsx
src/app/buscar/page.tsx
src/app/connect/tutorial/busqueda/page.tsx
src/app/connect/tutorial/la-cuenta/page.tsx
src/app/connect/tutorial/page.tsx
src/app/crear-perfil/page.tsx
src/app/login/page.tsx
src/app/perfil/[username]/page.tsx
src/app/perfil/editar/page.tsx
src/app/salas/page.tsx
src/app/visitas/he-visitado/page.tsx
src/app/visitas/me-vieron/page.tsx
src/components/InternalHeader.tsx
