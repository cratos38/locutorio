# 📋 NOMENCLATURA OFICIAL DEL PROYECTO LOCUTORIO

## ⚠️ IMPORTANTE: LEER ANTES DE HACER CUALQUIER CAMBIO

Esta es la **nomenclatura oficial** que SIEMPRE debemos usar al hablar del proyecto.

**TODAS LAS RUTAS ESTÁN EN INGLÉS** (para facilitar localización y seguir estándares internacionales)

---

## 🎯 RUTAS Y NOMBRES OFICIALES

| NOMBRE OFICIAL (español) | RUTA (inglés) | CARPETA | ALIAS |
|----------------|------|---------|-------|
| **Inicio** (página principal) | `/` | `src/app/page.tsx` | Landing, Página Principal |
| **Mi Espacio** | `/dashboard` | `src/app/dashboard/` | Área Personal, Home (logeado) |
| **Perfil de Usuario** | `/userprofile` | `src/app/userprofile/` | Perfil Editable, Mis Datos |
| **Perfil Público** | `/publicprofile/[username]` | `src/app/publicprofile/[username]/` | Ver Perfil de Otros |
| **Seguridad y Configuración** | `/security` | `src/app/security/` | Email, Teléfono, 2FA, Contraseña |
| **Historias** | `/stories` | `src/app/stories/` | Historias de Éxito |
| **Tutorial** | `/tutorial` | `src/app/tutorial/` | Guía, Ayuda |
| **Acerca de** | `/about` | `src/app/about/` | Información, Sobre Nosotros |
| **Usuarios** | `/people` | `src/app/people/` | Buscar Usuarios |
| **Chat** | `/chat` | `src/app/chat/` | Salas de Chat |
| **Álbumes** | `/albums` | `src/app/albums/` | Galería, Fotos |
| **Mensajes** | (flotante) | `src/components/FloatingMessagesWindow.tsx` | Mensajería Interna |
| **Encuentros** | `/meetings` | `src/app/meetings/` | Reuniones, Conocerse en Vivo |
| **Login** | `/login` | `src/app/login/` | Iniciar Sesión |
| **Registro** | `/register` | `src/app/register/` | Crear Cuenta |
| **Crear Perfil** | `/create-profile` | `src/app/create-profile/` | Datos Básicos (post-registro) |

---

## 🌍 ¿POR QUÉ RUTAS EN INGLÉS?

### **Ventajas:**
1. ✅ **Estándar internacional** (convención de desarrollo web)
2. ✅ **Localización más fácil** (URL no cambia, solo contenido)
3. ✅ **SEO internacional** (mejor posicionamiento global)
4. ✅ **Más profesional** (GitHub, Google, Facebook usan inglés)

### **Ejemplo de localización:**

```
✅ CORRECTO (URL fija, contenido cambia):
URL: locutorio.com.ve/dashboard
- Español: "Mi Espacio"
- English: "My Dashboard"
- Français: "Mon Espace"

❌ INCORRECTO (URL cambia):
- locutorio.com.ve/mi-espacio
- locutorio.com.ve/my-space
- locutorio.com.ve/mon-espace
```

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
❌ INCORRECTO: "El logo en /profile"

✅ CORRECTO: "La página de Encuentros"
❌ INCORRECTO: "La página de /meetings"
```

### **2. AL BUSCAR EN CÓDIGO:**
```
Para INICIO → Busca: src/app/page.tsx
Para MI ESPACIO → Busca: src/app/dashboard/
Para PERFIL DE USUARIO → Busca: src/app/userprofile/
Para PERFIL PÚBLICO → Busca: src/app/publicprofile/[username]/
Para SEGURIDAD Y CONFIGURACIÓN → Busca: src/app/security/
Para ENCUENTROS → Busca: src/app/meetings/
Para USUARIOS → Busca: src/app/people/
Para ÁLBUMES → Busca: src/app/albums/
Para HISTORIAS → Busca: src/app/stories/
Para ACERCA DE → Busca: src/app/about/
Para REGISTRO → Busca: src/app/register/
Para CREAR PERFIL → Busca: src/app/create-profile/
```

### **3. AL ESCRIBIR RUTAS EN CÓDIGO:**
```tsx
// ✅ CORRECTO (rutas en inglés)
<Link href="/">Inicio</Link>
<Link href="/dashboard">Mi Espacio</Link>
<Link href="/userprofile">Perfil de Usuario</Link>
<Link href="/publicprofile/Ana_M">Perfil Público</Link>
<Link href="/security">Seguridad y Configuración</Link>
<Link href="/meetings">Encuentros</Link>
<Link href="/people">Usuarios</Link>
<Link href="/albums">Álbumes</Link>
<Link href="/stories">Historias</Link>
<Link href="/about">Acerca de</Link>
<Link href="/register">Registro</Link>
<Link href="/create-profile">Crear Perfil</Link>

// ❌ INCORRECTO (rutas en español - YA NO EXISTEN)
<Link href="/mi-espacio">Mi Espacio</Link>  // ❌ Esta ruta NO existe
<Link href="/perfil-usuario">Perfil</Link>  // ❌ Esta ruta NO existe
<Link href="/encuentros">Encuentros</Link>  // ❌ Esta ruta NO existe
<Link href="/personas">Personas</Link>      // ❌ Esta ruta NO existe
<Link href="/albumes">Álbumes</Link>        // ❌ Esta ruta NO existe
```

---

## 🗂️ ESTRUCTURA DE CARPETAS

```
src/app/
├── page.tsx                    ← INICIO (página principal)
├── dashboard/
│   └── page.tsx               ← MI ESPACIO
├── userprofile/
│   └── page.tsx               ← PERFIL DE USUARIO
├── publicprofile/
│   └── [username]/
│       └── page.tsx           ← PERFIL PÚBLICO
├── security/
│   └── page.tsx               ← SEGURIDAD Y CONFIGURACIÓN
├── stories/
│   └── page.tsx               ← HISTORIAS
├── tutorial/
│   └── page.tsx               ← TUTORIAL
├── about/
│   └── page.tsx               ← ACERCA DE
├── people/
│   └── page.tsx               ← USUARIOS
├── chat/
│   └── page.tsx               ← CHAT
├── albums/
│   ├── page.tsx               ← ÁLBUMES
│   └── [id]/page.tsx          ← Álbum individual
├── meetings/
│   ├── page.tsx               ← ENCUENTROS
│   └── matches/page.tsx       ← Matches
├── login/
│   └── page.tsx               ← LOGIN
├── register/
│   └── page.tsx               ← REGISTRO
└── create-profile/
    └── page.tsx               ← CREAR PERFIL
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
   MI ESPACIO (/dashboard)
   
4. Click en "Editar Perfil"
   ↓
   PERFIL DE USUARIO (/profile)
   
5. Click en Logo "LoCuToRiO"
   ↓
   INICIO (/)
   
6. Click en "Personas"
   ↓
   PERSONAS (/people)
   
7. Click en "Encuentros"
   ↓
   ENCUENTROS (/meetings)
```

---

## ❓ PREGUNTAS FRECUENTES

### **P: ¿Por qué las rutas están en inglés si el sitio es en español?**
**R:** Las rutas son parte de la infraestructura técnica, no del contenido. Facilita localización y es estándar internacional.

### **P: ¿Cómo se localiza el contenido?**
**R:** La URL no cambia (`/dashboard`), pero el título y contenido sí:
- Español: "Mi Espacio"
- English: "My Dashboard"

### **P: ¿Por qué Inicio no está en `/inicio`?**
**R:** Porque `/` es la convención web estándar. Todos los sitios profesionales tienen su página principal en `/`.

### **P: ¿Dónde busco el código de Inicio?**
**R:** En `src/app/page.tsx`

### **P: ¿Por qué "Encuentros" es `/meetings` y no `/matches`?**
**R:** Porque "Encuentros" significa **reunirse en persona** (tomar un café, conocerse en vivo). `meetings` es más preciso que `matches` (que sería solo coincidencia digital).

---

## 🚨 ERRORES COMUNES A EVITAR

| ❌ ERROR | ✅ CORRECTO |
|---------|------------|
| "Vamos a /mi-espacio" | "Vamos a Mi Espacio (`/dashboard`)" |
| "Modifica /perfil-usuario" | "Modifica Perfil de Usuario (`/profile`)" |
| "La página /encuentros" | "La página Encuentros (`/meetings`)" |
| "El botón va a /personas" | "El botón va a Personas (`/people`)" |
| "Los álbumes en /albumes" | "Los álbumes en Álbumes (`/albums`)" |

---

## 📅 ÚLTIMA ACTUALIZACIÓN

**Fecha:** 3 de enero de 2026  
**Versión:** 2.0 (Rutas en inglés)  
**Estado:** Reestructuración completa finalizada  

---

## 🎉 CONCLUSIÓN

**SIEMPRE USA ESTOS NOMBRES EN CONVERSACIONES:**
- **Inicio** (no digas "/")
- **Mi Espacio** (no digas "/dashboard")
- **Perfil de Usuario** (no digas "/profile")
- **Encuentros** (no digas "/meetings")
- **Personas** (no digas "/people")

**SIEMPRE USA ESTAS RUTAS EN CÓDIGO:**
- `/` (no `/inicio`)
- `/dashboard` (no `/mi-espacio`)
- `/profile` (no `/perfil-usuario`)
- `/meetings` (no `/encuentros`)
- `/people` (no `/personas`)
- `/albums` (no `/albumes`)
- `/stories` (no `/historias`)
- `/about` (no `/acerca-de`)
- `/register` (no `/registro`)
- `/create-profile` (no `/crear-perfil`)

**No inventes nombres nuevos. Usa solo los de esta tabla.** ✅
