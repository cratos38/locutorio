# 📋 NOMENCLATURA OFICIAL DEL PROYECTO LOCUTORIO

## ⚠️ IMPORTANTE: LEER ANTES DE HACER CUALQUIER CAMBIO

Esta es la **nomenclatura oficial** que SIEMPRE debemos usar al hablar del proyecto.

---

## 🎯 RUTAS Y NOMBRES OFICIALES

| NOMBRE OFICIAL | RUTA | CARPETA | ALIAS |
|----------------|------|---------|-------|
| **Inicio** (página principal) | `/` | `src/app/page.tsx` | Landing, Página Principal |
| **Mi Espacio** | `/mi-espacio` | `src/app/mi-espacio/` | Área Personal, Home (logeado) |
| **Perfil de Usuario** | `/perfil-usuario` | `src/app/perfil-usuario/` | Perfil, Datos del Usuario |
| **Historias** | `/historias` | `src/app/historias/` | Historias de Éxito |
| **Tutorial** | `/tutorial` | `src/app/tutorial/` | Guía, Ayuda |
| **Personas** | `/personas` | `src/app/personas/` | Buscar Perfiles |
| **Chat** | `/chat` | `src/app/chat/` | Salas de Chat |
| **Álbumes** | `/albumes` | `src/app/albumes/` | Galería, Fotos |
| **Mensajes** | (flotante) | `src/components/FloatingMessagesWindow.tsx` | Mensajería Interna |
| **Encuentros** | `/encuentros` | `src/app/encuentros/` | Estadísticas de Solicitudes |
| **Login** | `/login` | `src/app/login/` | Iniciar Sesión |
| **Registro** | `/registro` | `src/app/registro/` | Crear Cuenta |
| **Crear Perfil** | `/crear-perfil` | `src/app/crear-perfil/` | Datos Básicos (post-registro) |

---

## 🔴 CASO ESPECIAL: INICIO

### **⚠️ MUY IMPORTANTE:**

```
CUANDO DICES "INICIO" → RUTA = "/"

NO busques carpeta /inicio/
NO busques /connect/
```

**INICIO está en:** `src/app/page.tsx` (la raíz)

**Razón:** Es la convención web estándar. La página principal siempre es `/`.

---

## 📝 REGLAS PARA NOMENCLATURA

### **1. AL HABLAR DEL PROYECTO:**
```
✅ CORRECTO: "Vamos a modificar Inicio"
❌ INCORRECTO: "Vamos a modificar / " o "la raíz"

✅ CORRECTO: "El logo en Perfil de Usuario"
❌ INCORRECTO: "El logo en /perfil-usuario"
```

### **2. AL BUSCAR EN CÓDIGO:**
```
Para INICIO → Busca: src/app/page.tsx
Para MI ESPACIO → Busca: src/app/mi-espacio/
Para PERFIL DE USUARIO → Busca: src/app/perfil-usuario/
```

### **3. AL ESCRIBIR RUTAS EN CÓDIGO:**
```tsx
// ✅ CORRECTO
<Link href="/">Inicio</Link>
<Link href="/mi-espacio">Mi Espacio</Link>
<Link href="/perfil-usuario">Perfil de Usuario</Link>

// ❌ INCORRECTO
<Link href="/inicio">Inicio</Link>  // Esta ruta NO existe
<Link href="/perfil">Perfil</Link>  // Esta ruta NO existe
```

---

## 🗂️ ESTRUCTURA DE CARPETAS

```
src/app/
├── page.tsx                    ← INICIO (página principal)
├── mi-espacio/
│   └── page.tsx               ← MI ESPACIO
├── perfil-usuario/
│   └── page.tsx               ← PERFIL DE USUARIO
├── historias/
├── tutorial/
├── personas/
├── chat/
├── albumes/
├── encuentros/
├── login/
├── registro/
└── crear-perfil/
```

---

## 🎯 FLUJO DE NAVEGACIÓN

```
1. Usuario entra → locutorio.com.ve
   ↓
   INICIO (/)
   
2. Click en [Iniciar Sesión]
   ↓
   LOGIN (/login)
   
3. Hace login exitoso
   ↓
   MI ESPACIO (/mi-espacio)
   
4. Click en "Editar Perfil"
   ↓
   PERFIL DE USUARIO (/perfil-usuario)
   
5. Click en Logo "LoCuToRiO"
   ↓
   INICIO (/)
```

---

## ❓ PREGUNTAS FRECUENTES

### **P: ¿Por qué Inicio no está en `/inicio`?**
**R:** Porque `/` es la convención web estándar. Todos los sitios profesionales tienen su página principal en `/` (Google, Facebook, Amazon, etc.).

### **P: ¿Dónde busco el código de Inicio?**
**R:** En `src/app/page.tsx`

### **P: ¿Por qué Mi Espacio no se llama "Inicio"?**
**R:** Porque INICIO es la página principal pública (antes de login). MI ESPACIO es tu área personal (después de login). Son dos páginas diferentes.

### **P: ¿Puedo crear una página `/inicio`?**
**R:** No. Ya existe y se llama `/` (raíz). Crear `/inicio` causaría confusión.

---

## 🚨 ERRORES COMUNES A EVITAR

| ❌ ERROR | ✅ CORRECTO |
|---------|------------|
| "Vamos a /inicio" | "Vamos a Inicio (`/`)" |
| "Modifica /connect" | "Modifica Inicio (`/`)" |
| "El perfil en /ajustes/perfil" | "Perfil de Usuario (`/perfil-usuario`)" |
| "La carpeta inicio/" | "El archivo page.tsx (raíz)" |

---

## 📅 ÚLTIMA ACTUALIZACIÓN

**Fecha:** 3 de enero de 2026  
**Versión:** 1.0  
**Estado:** Reestructuración completa finalizada  

---

## 🎉 CONCLUSIÓN

**SIEMPRE USA ESTOS NOMBRES:**
- **Inicio** = `/` = `src/app/page.tsx`
- **Mi Espacio** = `/mi-espacio`
- **Perfil de Usuario** = `/perfil-usuario`

**No inventes nombres nuevos. Usa solo los de esta tabla.** ✅
