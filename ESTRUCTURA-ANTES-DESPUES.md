# 🏗️ ESTRUCTURA DEL PROYECTO - ANTES vs DESPUÉS

## 📁 ESTRUCTURA DE CARPETAS

### **ANTES (CONFUSO):**
```
src/app/
├── page.tsx                    # Redirige a /connect
├── connect/                    # ← Landing page (nombre confuso)
│   ├── page.tsx               
│   └── tutorial/
│       ├── page.tsx
│       ├── busqueda/
│       ├── chat/
│       ├── foto-albumes/
│       └── la-cuenta/
├── inicio/                     # ← Mi Espacio (nombre confuso)
│   └── page.tsx
├── login/
├── registro/
├── crear-perfil/
├── ajustes/
│   └── perfil/
├── personas/
├── chat/
├── albumes/
└── ... (otras páginas)
```

### **DESPUÉS (CLARO):**
```
src/app/
├── page.tsx                    # ← Landing page directa (sin redirect)
├── tutorial/                   # ← Movido desde /connect/tutorial
│   ├── page.tsx
│   ├── busqueda/
│   ├── chat/
│   ├── foto-albumes/
│   └── la-cuenta/
├── mi-espacio/                 # ← Renombrado desde /inicio
│   └── page.tsx
├── login/
├── registro/
├── crear-perfil/
├── ajustes/
│   └── perfil/
├── personas/
├── chat/
├── albumes/
└── ... (otras páginas)
```

---

## 🔗 RUTAS EN EL NAVEGADOR

### **ANTES:**
```
URL que ves             Lo que hace
──────────────────────────────────────────────
/                    →  Redirige a /connect
/connect             →  Página de landing (bienvenida)
/connect/tutorial    →  Tutorial
/inicio              →  Mi Espacio (después de login)
/login               →  Login
/crear-perfil        →  Crear perfil
/ajustes/perfil      →  Editar perfil
```

### **DESPUÉS:**
```
URL que ves             Lo que hace
──────────────────────────────────────────────
/                    →  Página de landing (bienvenida) ✅
/tutorial            →  Tutorial ✅
/mi-espacio          →  Mi Espacio (después de login) ✅
/login               →  Login (sin cambios)
/crear-perfil        →  Crear perfil (sin cambios)
/ajustes/perfil      →  Editar perfil (sin cambios)
```

---

## 🧭 NAVEGACIÓN - NOMBRES EN BOTONES

### **ANTES (CONFUSO):**

**En página de landing (/connect):**
```
┌─────────────────────────────────────────┐
│  🏠 LoCuToRiO                          │
│                                         │
│  Inicio | Comunidad | Chat | Álbumes   │ ← "Inicio" apunta a /connect
│                    [Iniciar Sesión]    │
└─────────────────────────────────────────┘
```

**En página de usuario logeado (InternalHeader):**
```
┌─────────────────────────────────────────┐
│  🏠 LoCuToRiO                          │ ← Logo apunta a /connect (¡te saca!)
│                                         │
│  Mi Espacio | Personas | Mensajes      │ ← "Mi Espacio" apunta a /inicio
└─────────────────────────────────────────┘
```

### **DESPUÉS (CLARO):**

**En página de landing (/):**
```
┌─────────────────────────────────────────┐
│  🏠 LoCuToRiO                          │ ← Logo apunta a / (landing)
│                                         │
│  Inicio | Comunidad | Chat | Álbumes   │ ← "Inicio" apunta a / (correcto!)
│                    [Iniciar Sesión]    │
└─────────────────────────────────────────┘
```

**En página de usuario logeado (InternalHeader):**
```
┌─────────────────────────────────────────┐
│  🏠 LoCuToRiO                          │ ← Logo apunta a /mi-espacio (correcto!)
│                                         │
│  Mi Espacio | Personas | Mensajes      │ ← "Mi Espacio" apunta a /mi-espacio (correcto!)
└─────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE USUARIO

### **ANTES:**
```
Usuario entra → locutorio.com
     ↓
  page.tsx (/)
     ↓ (redirect)
  /connect (landing)
     ↓
  Hace login
     ↓
  /inicio (Mi Espacio) ← nombre confuso!
     ↓
  Click en Logo
     ↓
  /connect ← ¡te saca de sesión!
```

### **DESPUÉS:**
```
Usuario entra → locutorio.com
     ↓
  / (landing directa)
     ↓
  Hace login
     ↓
  /mi-espacio (Mi Espacio) ← nombre correcto!
     ↓
  Click en Logo
     ↓
  /mi-espacio ← ¡te mantiene en tu espacio!
```

---

## 📝 CAMBIOS EN CÓDIGO

### **1. page.tsx (raíz)**

**ANTES:**
```tsx
// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/connect');  // ← Redirect innecesario
}
```

**DESPUÉS:**
```tsx
// src/app/page.tsx
// Contiene TODO el contenido de /connect/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-connect-bg-dark">
      {/* Todo el contenido de landing aquí */}
      <nav>
        <Link href="/">Inicio</Link>  {/* ← Ahora apunta a / */}
        <Link href="/login">Iniciar Sesión</Link>
      </nav>
      {/* ... resto del contenido ... */}
    </div>
  );
}
```

### **2. InternalHeader.tsx**

**ANTES:**
```tsx
<Link href="/connect">  {/* ← Te saca de sesión! */}
  <span>LoCuToRiO</span>
</Link>

<Link href="/inicio">Mi Espacio</Link>  {/* ← Nombre confuso */}
```

**DESPUÉS:**
```tsx
<Link href="/mi-espacio">  {/* ← Te mantiene logeado */}
  <span>LoCuToRiO</span>
</Link>

<Link href="/mi-espacio">Mi Espacio</Link>  {/* ← Nombre correcto */}
```

### **3. Todas las referencias**

**ANTES:**
```tsx
// En ~13 archivos diferentes:
router.push('/connect');
router.push('/inicio');
<Link href="/connect">
<Link href="/inicio">
```

**DESPUÉS:**
```tsx
// En los mismos 13 archivos:
router.push('/');
router.push('/mi-espacio');
<Link href="/">
<Link href="/mi-espacio">
```

---

## ✅ BENEFICIOS DEL CAMBIO

| Aspecto | ANTES | DESPUÉS |
|---------|-------|---------|
| **Claridad** | ❌ Confuso | ✅ Claro |
| **Lógica** | ❌ Nombres ≠ Rutas | ✅ Nombres = Rutas |
| **Mantenimiento** | ❌ Difícil | ✅ Fácil |
| **Errores 404** | ❌ Frecuentes | ✅ Eliminados |
| **Velocidad desarrollo** | ❌ Lenta | ✅ Rápida |
| **Profesionalismo** | ❌ Amateur | ✅ Profesional |

---

## 📋 CHECKLIST DE CAMBIOS

### **FASE 2: /connect → /**
- [ ] Mover contenido de `/connect/page.tsx` a `/page.tsx`
- [ ] Mover `/connect/tutorial/` a `/tutorial/`
- [ ] Actualizar 35 referencias en 9 archivos:
  - [ ] `src/app/page.tsx`
  - [ ] `src/components/InternalHeader.tsx`
  - [ ] `src/components/FloatingMessagesWindow.tsx`
  - [ ] `src/app/connect/tutorial/*.tsx` (5 archivos)
- [ ] Eliminar carpeta `/connect/`
- [ ] Probar que `/` carga correctamente

### **FASE 3: /inicio → /mi-espacio**
- [ ] Renombrar carpeta `/inicio/` → `/mi-espacio/`
- [ ] Actualizar 14 referencias en 13 archivos:
  - [ ] `src/app/ajustes/perfil/page.tsx`
  - [ ] `src/app/buscar/page.tsx`
  - [ ] `src/app/crear-perfil/page.tsx`
  - [ ] `src/app/login/page.tsx`
  - [ ] `src/app/perfil/*.tsx` (2 archivos)
  - [ ] `src/app/salas/page.tsx`
  - [ ] `src/app/visitas/*.tsx` (2 archivos)
  - [ ] `src/app/tutorial/*.tsx` (3 archivos)
  - [ ] `src/components/InternalHeader.tsx`
- [ ] Probar que `/mi-espacio` carga correctamente

### **FASE 4: VERIFICACIÓN**
- [ ] Probar ruta `/` (landing)
- [ ] Probar ruta `/mi-espacio` (después de login)
- [ ] Probar ruta `/tutorial`
- [ ] Probar navegación entre páginas
- [ ] Verificar que no hay 404s
- [ ] Probar click en logo (debe ir a `/mi-espacio` si está logeado)
- [ ] Commit final

---

## ⏱️ TIEMPO ESTIMADO

| Fase | Tiempo |
|------|--------|
| FASE 2: /connect → / | 20 min |
| FASE 3: /inicio → /mi-espacio | 15 min |
| FASE 4: Verificación | 10 min |
| **TOTAL** | **~45 min** |

