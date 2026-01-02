# 🗺️ MAPA DE RUTAS - LA VERDAD DEL PROYECTO LOCUTORIO

## 📋 RUTAS PRINCIPALES (LAS QUE IMPORTAN)

| RUTA EN NAVEGADOR | CARPETA REAL | QUÉ ES | REQUIERE LOGIN | NOMBRE QUE DEBERÍA TENER |
|-------------------|--------------|---------|----------------|--------------------------|
| `/` | `./page.tsx` | Redirige a `/connect` | ❌ No | **"Inicio"** (Landing) |
| `/connect` | `./connect/` | Página de bienvenida/landing | ❌ No | **"Inicio"** (Landing) |
| `/inicio` | `./inicio/` | Feed/actividad después de login | ✅ Sí | **"Mi Espacio"** |
| `/login` | `./login/` | Página de inicio de sesión | ❌ No | "Login" |
| `/registro` | `./registro/` | Página de registro | ❌ No | "Registro" |
| `/crear-perfil` | `./crear-perfil/` | Registro de datos básicos | ✅ Sí | "Crear Perfil" |
| `/ajustes/perfil` | `./ajustes/perfil/` | Editar perfil detallado | ✅ Sí | "Editar Perfil" |

## 🎯 RUTAS FUNCIONALES (Después de login)

| RUTA | CARPETA | QUÉ ES | NOMBRE EN NAV |
|------|---------|---------|---------------|
| `/personas` | `./personas/` | Buscar personas | "Personas" |
| `/chat` | `./chat/` | Chat en vivo | "Chat" |
| `/albumes` | `./albumes/` | Álbumes de fotos | "Álbumes" |
| `/buscar` | `./buscar/` | Búsqueda avanzada | "Buscar" |
| `/encuentros` | `./encuentros/` | Matches | "Encuentros" |
| `/salas` | `./salas/` | Salas de chat | "Salas" |
| `/visitas/me-vieron` | `./visitas/me-vieron/` | Quién vio mi perfil | "Me vieron" |
| `/visitas/he-visitado` | `./visitas/he-visitado/` | Perfiles que visité | "He visitado" |

## 🏛️ RUTAS INFORMATIVAS (Sin login)

| RUTA | CARPETA | QUÉ ES |
|------|---------|---------|
| `/acerca-de` | `./acerca-de/` | Información general |
| `/acerca-de/sobre-nosotros` | `./acerca-de/sobre-nosotros/` | Sobre nosotros |
| `/acerca-de/terminos` | `./acerca-de/terminos/` | Términos y condiciones |
| `/acerca-de/cookies` | `./acerca-de/cookies/` | Política de cookies |
| `/acerca-de/proteccion-datos` | `./acerca-de/proteccion-datos/` | Protección de datos |
| `/connect/tutorial` | `./connect/tutorial/` | Tutorial de uso |

---

## 🔥 EL PROBLEMA PRINCIPAL:

### **CONFUSIÓN #1: Landing Page**
```
/ → redirige a /connect
/connect → tiene botón "Inicio" que apunta a sí mismo
```
**DEBERÍA SER:**
```
/ → Página de landing directa (sin redirect)
"Inicio" en nav → apunta a /
```

### **CONFUSIÓN #2: Mi Espacio**
```
/inicio → es "Mi Espacio" pero se llama "inicio"
InternalHeader → Logo apunta a /connect (cierra sesión!)
```
**DEBERÍA SER:**
```
/mi-espacio → es "Mi Espacio" (nombre correcto)
InternalHeader → Logo apunta a /mi-espacio (vuelve a tu espacio)
```

---

## ✅ PLAN DE CORRECCIÓN:

### **FASE 1: Arreglar lo crítico (SIN renombrar carpetas)**
1. ✅ Cambiar logo en InternalHeader: `/connect` → `/inicio`
2. ✅ Mantener las rutas actuales funcionando
3. ✅ Evitar que el logo "cierre sesión"

### **FASE 2: Renombrar correctamente (OPCIONAL - MUCHO TRABAJO)**
1. Renombrar `/connect` → hacer que `/` sea la landing directa
2. Renombrar `/inicio` → `/mi-espacio`
3. Actualizar TODAS las referencias en ~30 archivos
4. Actualizar todos los Links, hrefs, router.push, etc.

---

## 📝 NOTAS:

- El proyecto se copió de otro y mantuvo la estructura original
- Por eso hay nombres confusos entre rutas y navegación
- Funciona, pero es confuso para el desarrollador
- NO afecta al usuario final (él ve solo los botones)

