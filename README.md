# 🌐 Locutorio - Red Social Venezolana

> **Estado del Proyecto**: Frontend completado (100%) | Backend pendiente
> 
> **Última actualización**: 19 de diciembre de 2025
> 
> **Backup disponible**: [Descargar aquí](https://www.genspark.ai/api/files/s/dW3ZUzhG) (26.8 MB)

---

## 📋 Descripción

**Locutorio** es una red social única diseñada para la comunidad venezolana, enfocada en **interacción colectiva/pública** en lugar de acumulación de amigos o likes individuales. 

### 🎯 Objetivos del Proyecto
- **Meta de usuarios**: 200,000 registrados
- **Usuarios activos diarios**: 10,000-15,000 simultáneos
- **Diferenciador clave**: NO es "otro Facebook" - enfoque en comunidad sobre individualismo

---

## ✅ Funcionalidades Completadas (Frontend)

### 💬 **Sistema de Mensajes Privados Flotantes**
Ventana flotante completamente funcional con **10 modalidades diferentes**:

1. ✅ **MENSAJES PRIVADOS** - Chat en tiempo real con interfaz tipo WhatsApp
2. ✅ **ARCHIVO** - Historial de conversaciones con búsqueda
3. ✅ **AJUSTES** - Configuración de sonidos y auto-apertura de ventanas
4. ✅ **DENUNCIAR** - Sistema de reportes con 6 categorías + advertencia 911
5. ✅ **NOTAS (PLUS)** - Post-it virtual pegado al perfil (solo usuarios PLUS)
6. ✅ **FOTOS** - Galería flotante con animación y brillo verde neón
7. ✅ **AÑADIR AMIGO** - Organizar contactos en grupos (Familia, Trabajo, Clase)
8. ✅ **SOLICITUDES** - Aceptar/Rechazar/Guardar para después
9. ✅ **NUEVA CONVERSACIÓN** - Buscar por nick + Amigos online + Conversaciones guardadas
10. ✅ **EMOTICONES** - Selector de 20 emojis populares

### 🎨 **Diseño y UX**
- ✅ Tema verde oscuro consistente (`forest-dark` + `neon-green`)
- ✅ Ventana flotante arrastrable y redimensionable
- ✅ Animaciones suaves y efectos visuales
- ✅ Tabs con indicador verde neón brillante (imposible confundir)
- ✅ Sistema de estado online/away/offline con indicadores de color

### 📄 **Páginas Existentes**
- ✅ `/connect` - Página principal con mensajes flotantes
- ✅ `/perfil/[username]` - Perfil público de usuarios
- ✅ `/perfil/editar` - Editar información personal
- ✅ `/personas` - Buscar personas
- ✅ `/albumes` - Gestión de álbumes de fotos
- ✅ `/encuentros` - Sistema de matches
- ✅ `/salas` - Salas de chat públicas
- ✅ `/visitas` - Quién visitó tu perfil
- ✅ `/connect/tutorial` - Tutoriales completos del sistema

---

## ⏳ Funcionalidades Pendientes (Backend)

### 🗄️ **Base de Datos**
- ❌ Cloudflare D1 (temporal para desarrollo)
- ❌ MySQL/PostgreSQL (producción en tu hosting)
- ❌ Migraciones y seeds

### 🔌 **API Backend**
- ❌ Endpoints con Hono
- ❌ Autenticación JWT
- ❌ WebSocket para chat en tiempo real
- ❌ Sistema de usuarios real
- ❌ CRUD para mensajes, amigos, notas, fotos
- ❌ Sistema de reportes y strikes (3 strikes = ban)
- ❌ Restricciones temporales (24h block después de rechazo)

### 📄 **Páginas Faltantes**
- ❌ `/amigos` - Gestionar lista de amigos y grupos personalizados
- ❌ Otras páginas que pueden dar 404 (pendiente de identificar)

---

## 🛠️ Stack Tecnológico

### **Frontend**
- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Iconos**: Material Symbols
- **Fuentes**: Geist (Vercel)

### **Backend (Pendiente)**
- **Framework**: Hono (edge-first)
- **Base de Datos Temporal**: Cloudflare D1 (SQLite)
- **Base de Datos Producción**: MySQL/PostgreSQL
- **Real-time**: WebSocket
- **Autenticación**: JWT

### **Infraestructura**
- **Desarrollo**: Cloudflare Pages
- **Producción Final**: Tu webhosting contratado
- **Backup**: NAS personal (para respaldos automáticos)

---

## 🚀 Instalación y Desarrollo

### **Requisitos Previos**
- Node.js 18+
- npm o yarn
- Git

### **Instalación**

```bash
# Clonar repositorio
git clone https://github.com/cratos38/locutorio.git
cd locutorio

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará disponible en: **http://localhost:3000**

### **Scripts Disponibles**

```bash
npm run dev          # Desarrollo (localhost:3000)
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Verificar código
```

### **Con PM2 (para desarrollo en sandbox)**

```bash
# Iniciar con PM2
pm2 start ecosystem.config.cjs

# Ver logs
pm2 logs locutorio --nostream

# Reiniciar
pm2 restart locutorio

# Detener
pm2 stop locutorio
```

---

## 📦 Estructura del Proyecto

```
locutorio/
├── src/
│   ├── app/                    # Páginas Next.js (App Router)
│   │   ├── connect/           # Página principal + tutoriales
│   │   ├── perfil/            # Perfiles públicos y edición
│   │   ├── personas/          # Búsqueda de personas
│   │   ├── albumes/           # Álbumes de fotos
│   │   ├── encuentros/        # Sistema de matches
│   │   ├── salas/             # Salas de chat
│   │   └── visitas/           # Historial de visitas
│   │
│   ├── components/            # Componentes React
│   │   ├── FloatingMessagesWindow.tsx  # ⭐ COMPONENTE PRINCIPAL
│   │   └── ui/                # Shadcn components
│   │
│   ├── contexts/              # Context API
│   │   └── MessagesContext.tsx
│   │
│   └── lib/                   # Utilidades
│
├── public/                    # Assets estáticos
├── ecosystem.config.cjs       # Configuración PM2
├── tailwind.config.ts         # Configuración Tailwind
├── tsconfig.json             # Configuración TypeScript
└── package.json              # Dependencias
```

---

## 🎨 Sistema de Colores

```css
/* Paleta principal */
--forest-base: #1a5319      /* Verde oscuro base */
--forest-dark: #0d2818      /* Verde muy oscuro */
--forest-light: #2e5c2e     /* Verde medio */
--neon-green: #50fa7b       /* Verde neón brillante */
--connect-bg-dark: #0f1e13  /* Fondo oscuro principal */
--text-muted: #6b7280       /* Texto secundario */
```

### **Uso de Colores**
- **Fondo principal**: `bg-connect-bg-dark`
- **Elementos activos**: `bg-neon-green` o `text-neon-green`
- **Bordes**: `border-neon-green/30` (30% opacidad)
- **Sombras brillantes**: `shadow-[0_0_10px_rgba(80,250,123,0.3)]`
- **Hover effects**: `hover:bg-neon-green/20`

---

## 📱 Sistema de Mensajes Flotantes

### **Características Técnicas**

#### **Ventana Flotante**
- ✅ Arrastrable (drag & drop)
- ✅ Redimensionable
- ✅ Posición persistente (localStorage)
- ✅ Tamaño mínimo: 400x500px
- ✅ Tamaño máximo: 1000x800px

#### **Pestañas del Header**
- ✅ Mensajes Privados
- ✅ Archivo
- ✅ Ajustes

#### **Sidebar de Conversaciones**
- ✅ Tabs: Conversaciones / Solicitudes
- ✅ Lista de usuarios con avatar
- ✅ Estados: online (verde), away (naranja), offline (gris)
- ✅ Contador de mensajes no leídos
- ✅ Indicador "Escribiendo..."

#### **Área de Chat**
- ✅ Profile strip con micro-perfil
- ✅ Botones: Amigos, Fotos, Notas, Denunciar
- ✅ Historial de mensajes con scroll automático
- ✅ Input con emojis y botón enviar
- ✅ Separadores de fecha

---

## 🔐 Sistema de Reportes (Diseño)

### **Flujo Completo (Pendiente de Backend)**

1. **Usuario reporta** → Frontend captura razones
2. **Sistema toma screenshot** de mensajes privados
3. **Envía a admin panel** → Backend almacena en DB
4. **Admin revisa**:
   - ✅ Válido → Ban al emisor (7-30 días / 3-6 meses / permanente)
   - ❌ Falso → Strike al reportador
   - ⚠️ Ambiguo → Advertencias a ambos

5. **Sistema de Strikes**:
   - Strike 1 → Advertencia
   - Strike 2 → Suspensión 7 días
   - Strike 3 → Ban permanente

---

## 📊 Datos Demo Actuales

### **Usuarios de Prueba**
```typescript
const demoUsers = [
  {
    id: 1,
    name: "Javier Solis",
    username: "javier",
    avatar: "...",
    status: "online",
    lastMessage: "Hola Ana! ¿Cómo estás?",
    unreadCount: 2
  },
  {
    id: 2,
    name: "Laura García",
    username: "laura",
    status: "away",
    lastMessage: "Nos vemos luego",
    unreadCount: 0
  },
  {
    id: 3,
    name: "Carlos Martínez",
    username: "carlos",
    status: "offline",
    lastMessage: "Hasta mañana",
    unreadCount: 0
  }
];
```

---

## 🔄 Plan de Migración a Producción

### **Fase 1: Desarrollo Actual**
- ✅ Frontend completo en Cloudflare Pages
- ✅ Base de datos temporal: Cloudflare D1 (SQLite)
- ✅ Todo funciona visualmente

### **Fase 2: Migración a Tu Servidor**
1. Exportar código del proyecto
2. Configurar MySQL/PostgreSQL en tu hosting
3. Adaptar conexiones de DB (D1 → MySQL)
4. Configurar variables de entorno
5. Migrar datos de prueba
6. Deploy en tu webhosting

### **Fase 3: Backup Automático**
1. Script de backup diario
2. Exportar DB a tu NAS
3. Sistema de recuperación ante desastres

---

## 🐛 Problemas Conocidos y Soluciones

### **Tabs de Conversaciones/Solicitudes**
- ❌ **Problema**: Botones mostraban el tab incorrecto como activo
- ✅ **Solución**: Cambiado a verde neón brillante para tab activo
- 📝 **Código**: `bg-neon-green/20 text-neon-green border-2 border-neon-green`

### **Cache de Tailwind**
- ❌ **Problema**: Cambios CSS no se reflejaban
- ✅ **Solución**: Borrar `.next` y `node_modules/.cache`
- 📝 **Comando**: `rm -rf .next && pm2 restart locutorio`

---

## 📝 Notas de Desarrollo

### **Decisiones de Diseño**

1. **¿Por qué ventana flotante?**
   - Inspirado en Facebook Messenger
   - Permite navegar por el sitio sin perder conversaciones
   - UX familiar para usuarios

2. **¿Por qué verde oscuro?**
   - Diferenciación visual de otras redes sociales
   - Tema "bosque" coherente con naturaleza venezolana
   - Verde neón para elementos activos = alta visibilidad

3. **¿Por qué Next.js + Cloudflare?**
   - Edge-first: baja latencia global
   - Escalable sin esfuerzo
   - Fácil migración a hosting tradicional después

### **Convenciones de Código**

```typescript
// Estado de componentes
const [estado, setEstado] = useState<Tipo>(valorInicial);

// Props de componentes
interface MiComponenteProps {
  propiedad: tipo;
}

// Clases Tailwind
className={`clase-base ${condicion ? 'clase-activa' : 'clase-inactiva'}`}

// Commits
// feat: Nueva funcionalidad
// fix: Corrección de bug
// chore: Mantenimiento
// docs: Documentación
```

---

## 🚧 Roadmap Futuro

### **Corto Plazo (Próximas 2 semanas)**
- [ ] Crear página `/amigos`
- [ ] Identificar y crear páginas 404
- [ ] Testing exhaustivo de UI

### **Medio Plazo (1-2 meses)**
- [ ] Implementar backend con Hono
- [ ] Base de datos Cloudflare D1
- [ ] API REST completa
- [ ] WebSocket para chat real-time

### **Largo Plazo (3-6 meses)**
- [ ] Migración a servidor final
- [ ] Sistema de autenticación real
- [ ] Notificaciones push
- [ ] App móvil (React Native?)
- [ ] Sistema de bots para testing

---

## 📞 Contacto y Soporte

- **GitHub**: [cratos38/locutorio](https://github.com/cratos38/locutorio)
- **Backup del Proyecto**: [Descargar aquí](https://www.genspark.ai/api/files/s/dW3ZUzhG)

---

## 📜 Licencia

Este proyecto es privado y propiedad exclusiva del creador. Todos los derechos reservados.

---

## 🎉 Agradecimientos

Proyecto desarrollado con dedicación para crear una red social única para la comunidad venezolana.

**Última actualización**: 19 de diciembre de 2025

---

> 💡 **Nota**: Este README será actualizado continuamente conforme avance el desarrollo del proyecto.
