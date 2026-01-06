# 📋 PLAN DE TRABAJO - LoCuToRiO

**Red Social Venezolana**  
**Última actualización:** 2026-01-06 18:30 UTC

> 📖 **Cómo usar este plan:**  
> - Cada tarea tiene un checkbox `[ ]` → Márcalo como `[x]` cuando esté completado  
> - Las fases están ordenadas por prioridad  
> - Usa Ctrl+F para buscar temas específicos  
> - Revisa la sección "Prioridades Inmediatas" al final

---

## ✅ FASE 1: FRONTEND BÁSICO Y DEPLOYMENT (COMPLETADA)

### 1.1 Estructura Inicial ✅
- [x] Proyecto Next.js 15.5.9 configurado
- [x] Componentes UI base (shadcn/ui)
- [x] Sistema de rutas (App Router)
- [x] Estilos y tema visual

### 1.2 Páginas Principales ✅
- [x] Página de inicio (landing)
- [x] Login
- [x] Registro / Crear perfil
- [x] Dashboard
- [x] Chat/Salas
- [x] Personas
- [x] Encuentros (Tomar café)
- [x] Foto Álbumes
- [x] Perfil de usuario
- [x] Perfil público
- [x] Configuración/Seguridad
- [x] Visitas
- [x] Historias
- [x] Tutorial

### 1.3 Funcionalidades Frontend ✅
- [x] Sistema de navegación
- [x] Componentes reutilizables
- [x] Mensajes flotantes (UI)
- [x] Sistema de notificaciones (UI)
- [x] Carrusel de fotos (UI)
- [x] Lightbox de imágenes (UI)
- [x] Sistema de comentarios (UI)

### 1.4 Deployment ✅
- [x] Repositorio GitHub conectado (https://github.com/cratos38/locutorio)
- [x] Proyecto Vercel configurado (locutorio-tjyb → renombrar a "locutorio")
- [x] Dominio locutorio.com.ve configurado ✅
- [x] DNS configurados en Donweb:
  - [x] Registro A: locutorio.com.ve → 216.198.79.1 ✅
  - [x] Registro CNAME: www.locutorio.com.ve → 07a3247280589c60.vercel-dns-017.com. ✅
  - [x] Eliminados registros AAAA conflictivos ✅
- [x] Certificado SSL activo (HTTPS) ✅
- [x] Deployments automáticos desde GitHub ✅
- [x] Fix de errores useSearchParams() con Suspense en 5 páginas:
  - [x] /chat
  - [x] /security
  - [x] /login
  - [x] /create-profile
  - [x] /meetings
- [x] App en producción funcionando: https://locutorio.com.ve ✅

---

## 🚧 FASE 2: FINALIZAR FRONTEND (90% COMPLETADO)

### 2.1 Páginas Faltantes (Opcional)
- [ ] Página "Acerca de" (About)
- [ ] Términos y condiciones
- [ ] Política de privacidad
- [ ] Protección de datos
- [ ] Ayuda/Soporte
- [ ] FAQ (Preguntas frecuentes)
- [ ] Página 404 personalizada
- [ ] Página de mantenimiento

### 2.2 Tutoriales - Revisar y Editar ⚠️
- [x] Tutorial de Foto Álbumes (completado y actualizado)
- [ ] Tutorial de Chat/Salas - **REVISAR Y EDITAR**
- [ ] Tutorial de Búsqueda/Personas - **REVISAR Y EDITAR**
- [ ] Tutorial de Mensajes Privados - **REVISAR Y EDITAR**
- [ ] Tutorial de Encuentros - **REVISAR Y EDITAR**
- [ ] Tutorial de Historias - **REVISAR Y EDITAR**
- [ ] Tutorial de Perfil - **REVISAR Y EDITAR**
- [ ] Tutorial de Seguridad - **REVISAR Y EDITAR**

### 2.3 Páginas Adicionales Críticas
- [ ] Página `/amigos` - Gestión de lista de amigos y grupos personalizados

### 2.4 Mejoras de UI/UX (Opcional)
- [ ] Diseño responsive para móviles (optimización)
- [ ] Animaciones y transiciones
- [ ] Sistema de temas (claro/oscuro)
- [ ] Mejoras de accesibilidad (a11y)
- [ ] Optimización de imágenes
- [ ] Loading states mejorados
- [ ] Error boundaries
- [ ] Skeletons para carga

### 2.5 Componentes Adicionales (Opcional)
- [ ] Sistema de búsqueda avanzada
- [ ] Filtros de usuarios
- [ ] Sistema de reportes (UI)
- [ ] Modal de confirmaciones
- [ ] Toast notifications mejoradas
- [ ] Sistema de badges/insignias
- [ ] Verificación IA visual (UI)

---

## 🗄️ FASE 3: BACKEND Y BASE DE DATOS

### 3.1 Configuración de Supabase
- [x] Crear cuenta en Supabase ✅
- [ ] Crear proyecto de base de datos
- [ ] Configurar variables de entorno en Vercel
- [ ] Instalar librerías de Supabase en Next.js: `npm install @supabase/supabase-js @supabase/ssr`
- [ ] Configurar cliente de Supabase (`lib/supabase/client.ts`)
- [ ] Configurar servidor de Supabase (`lib/supabase/server.ts`)

### 3.2 Diseño de Base de Datos
- [ ] Tabla: users (usuarios)
  - id, username, email, password_hash, birth_date, gender, city, etc.
- [ ] Tabla: profiles (perfiles extendidos)
  - user_id, bio, interests, avatar_url, cover_photo_url, etc.
- [ ] Tabla: chat_rooms (salas de chat)
  - id, name, icon, type (temporal/permanent), privacy, creator_id, etc.
- [ ] Tabla: chat_messages (mensajes de chat)
  - id, room_id, user_id, message, timestamp, reply_to, etc.
- [ ] Tabla: private_messages (mensajes privados)
  - id, sender_id, receiver_id, message, timestamp, read, etc.
- [ ] Tabla: photo_albums (álbumes)
  - id, user_id, name, privacy, created_at, etc.
- [ ] Tabla: photos (fotos)
  - id, album_id, url, caption, privacy, upload_date, etc.
- [ ] Tabla: comments (comentarios)
  - id, photo_id, user_id, comment, timestamp, is_private, etc.
- [ ] Tabla: likes (me gusta)
  - id, photo_id, user_id, timestamp
- [ ] Tabla: visits (visitas)
  - id, visitor_id, visited_id, timestamp
- [ ] Tabla: stories (historias)
  - id, user_id, media_url, text, expires_at, created_at
- [ ] Tabla: meetings (invitaciones a tomar café)
  - id, sender_id, receiver_id, message, status, date, location
- [ ] Tabla: friendships (amistades)
  - id, user1_id, user2_id, status, created_at
- [ ] Tabla: blocks (bloqueos)
  - id, blocker_id, blocked_id, timestamp
- [ ] Tabla: reports (denuncias)
  - id, reporter_id, reported_user_id, reported_message_id, reason, timestamp
- [ ] Tabla: subscriptions (PLUS+)
  - id, user_id, plan, status, start_date, end_date

### 3.3 Relaciones y Constraints
- [ ] Configurar foreign keys
- [ ] Índices para optimización
- [ ] Triggers para lógica automática
- [ ] Políticas de seguridad (RLS - Row Level Security)

### 3.4 Storage Configuration
- [ ] Configurar Supabase Storage
- [ ] Buckets: avatars, photos, stories, covers
- [ ] Políticas de acceso a archivos
- [ ] Límites de tamaño y formato

---

## 🔐 FASE 4: AUTENTICACIÓN Y AUTORIZACIÓN

### 4.1 Sistema de Autenticación
- [ ] Configurar Supabase Auth
- [ ] Implementar registro de usuarios
- [ ] Implementar login (email/password)
- [ ] Implementar logout
- [ ] Recuperación de contraseña
- [ ] Verificación de email
- [ ] Verificación de teléfono (WhatsApp/Telegram)

### 4.2 Autenticación Social (opcional)
- [ ] Login con Google
- [ ] Login con Facebook
- [ ] Login con Twitter/X

### 4.3 Middleware y Protección de Rutas
- [ ] Middleware de Next.js para proteger rutas
- [ ] Redirección de usuarios no autenticados
- [ ] Verificación de sesión
- [ ] Refresh tokens

### 4.4 Roles y Permisos
- [ ] Sistema de roles (usuario, PLUS+, admin, moderador)
- [ ] Permisos por rol
- [ ] Verificación de edad (18+)
- [ ] Verificación IA (perfil verificado)

---

## 🔌 FASE 5: API ROUTES Y SERVER ACTIONS

### 5.1 API Routes - Usuarios
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] POST /api/auth/logout
- [ ] GET /api/users/[id]
- [ ] PUT /api/users/[id]
- [ ] DELETE /api/users/[id]
- [ ] POST /api/users/[id]/avatar
- [ ] GET /api/users/search

### 5.2 API Routes - Chat
- [ ] GET /api/chat/rooms
- [ ] POST /api/chat/rooms (crear sala)
- [ ] DELETE /api/chat/rooms/[id]
- [ ] GET /api/chat/rooms/[id]/messages
- [ ] POST /api/chat/rooms/[id]/messages
- [ ] GET /api/chat/private/[userId]
- [ ] POST /api/chat/private/[userId]

### 5.3 API Routes - Álbumes
- [ ] GET /api/albums
- [ ] POST /api/albums (crear álbum)
- [ ] GET /api/albums/[id]
- [ ] PUT /api/albums/[id]
- [ ] DELETE /api/albums/[id]
- [ ] POST /api/albums/[id]/photos
- [ ] DELETE /api/photos/[id]
- [ ] GET /api/photos/[id]/comments
- [ ] POST /api/photos/[id]/comments
- [ ] POST /api/photos/[id]/like
- [ ] DELETE /api/photos/[id]/like

### 5.4 API Routes - Historias
- [ ] GET /api/stories
- [ ] POST /api/stories
- [ ] DELETE /api/stories/[id]

### 5.5 API Routes - Encuentros
- [ ] GET /api/meetings
- [ ] POST /api/meetings
- [ ] PUT /api/meetings/[id]
- [ ] DELETE /api/meetings/[id]

### 5.6 API Routes - Social
- [ ] POST /api/friends/[userId] (enviar solicitud)
- [ ] PUT /api/friends/[userId] (aceptar/rechazar)
- [ ] DELETE /api/friends/[userId]
- [ ] POST /api/blocks/[userId]
- [ ] DELETE /api/blocks/[userId]
- [ ] POST /api/visits/[userId] (registrar visita)
- [ ] GET /api/visits (mis visitas)

### 5.7 API Routes - Reportes
- [ ] POST /api/reports
- [ ] GET /api/reports (admin/moderador)
- [ ] PUT /api/reports/[id] (resolver)

### 5.8 API Routes - Suscripciones
- [ ] POST /api/subscriptions/checkout
- [ ] GET /api/subscriptions/status
- [ ] POST /api/subscriptions/cancel

---

## 🔄 FASE 6: INTEGRACIÓN FRONTEND-BACKEND

### 6.1 Migrar Datos Hardcoded a DB
- [ ] Reemplazar usuarios dummy con datos reales
- [ ] Conectar chat con base de datos
- [ ] Conectar álbumes con Storage y DB
- [ ] Conectar perfiles con DB
- [ ] Conectar mensajes privados con DB
- [ ] Conectar visitas con DB

### 6.2 Implementar Real-time
- [ ] Chat en tiempo real (Supabase Realtime)
- [ ] Notificaciones en tiempo real
- [ ] Estado "escribiendo..." en tiempo real
- [ ] Actualización de visitas en tiempo real

### 6.3 Optimización de Queries
- [ ] Implementar paginación
- [ ] Implementar infinite scroll
- [ ] Caching con React Query / SWR
- [ ] Optimistic updates

---

## 💳 FASE 7: SISTEMA DE PAGOS (PLUS+)

### 7.1 Integración de Pasarela de Pago
- [ ] Seleccionar proveedor (Stripe, PayPal, Mercado Pago)
- [ ] Configurar cuenta
- [ ] Implementar checkout
- [ ] Webhooks para confirmación de pago

### 7.2 Funcionalidades PLUS+
- [ ] Crear salas permanentes
- [ ] Comentarios privados en fotos
- [ ] Verificación de perfil
- [ ] Badge PLUS+ visible
- [ ] Sin publicidad
- [ ] Más álbumes/fotos

### 7.3 Gestión de Suscripciones
- [ ] Panel de administración de suscripción
- [ ] Renovación automática
- [ ] Cancelación
- [ ] Reembolsos

---

## 🤖 FASE 8: VERIFICACIÓN IA Y MODERACIÓN

### 8.1 Verificación de Perfil con IA
- [ ] Integrar API de verificación facial
- [ ] Comparar foto de perfil con ID
- [ ] Validar fecha de nacimiento
- [ ] Otorgar badge de verificado

### 8.2 Moderación Automática
- [ ] Filtro de contenido inapropiado (imágenes)
- [ ] Filtro de lenguaje ofensivo (texto)
- [ ] Detección de spam
- [ ] Sistema de reportes automatizado

---

## 🧪 FASE 9: TESTING Y CALIDAD

### 9.1 Testing Unitario
- [ ] Tests de componentes (Jest + React Testing Library)
- [ ] Tests de utilidades
- [ ] Tests de hooks personalizados

### 9.2 Testing de Integración
- [ ] Tests de API routes
- [ ] Tests de Server Actions
- [ ] Tests de flujos completos

### 9.3 Testing E2E
- [ ] Configurar Playwright o Cypress
- [ ] Tests de registro/login
- [ ] Tests de chat
- [ ] Tests de álbumes
- [ ] Tests de pagos

### 9.4 Performance
- [ ] Lighthouse audits
- [ ] Core Web Vitals
- [ ] Optimización de bundle size
- [ ] Lazy loading de componentes

---

## 🚀 FASE 10: LANZAMIENTO Y MARKETING

### 10.1 Pre-lanzamiento
- [ ] Beta testing con usuarios reales
- [ ] Recolección de feedback
- [ ] Corrección de bugs
- [ ] Preparar términos legales

### 10.2 Lanzamiento
- [ ] Campaña de redes sociales
- [ ] Landing page de marketing
- [ ] Programa de referidos
- [ ] Onboarding mejorado

### 10.3 Post-lanzamiento
- [ ] Monitoreo de errores (Sentry)
- [ ] Analytics (Google Analytics, Plausible)
- [ ] Sistema de feedback de usuarios
- [ ] Actualizaciones regulares

---

## 📊 FASE 11: ADMINISTRACIÓN Y MODERACIÓN

### 11.1 Panel de Admin
- [ ] Dashboard de estadísticas
- [ ] Gestión de usuarios
- [ ] Gestión de reportes
- [ ] Moderación de contenido
- [ ] Gestión de salas de chat
- [ ] Gestión de suscripciones

### 11.2 Herramientas de Moderación
- [ ] Bans temporales y permanentes
- [ ] Sistema de advertencias
- [ ] Logs de actividad
- [ ] Revisión de reportes

---

## 🔧 FASE 12: MANTENIMIENTO Y MEJORAS

### 12.1 Monitoreo
- [ ] Uptime monitoring
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] Database backups automáticos

### 12.2 Mejoras Continuas
- [ ] Nuevas funcionalidades basadas en feedback
- [ ] Optimizaciones de rendimiento
- [ ] Actualizaciones de seguridad
- [ ] Mejoras de UI/UX

---

## 📝 NOTAS IMPORTANTES

### Stack Tecnológico Actual:
- **Frontend**: Next.js 15.5.9 (React)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel
- **Dominio**: locutorio.com.ve (Donweb)
- **Git**: GitHub (cratos38/locutorio)

### Stack Tecnológico Planeado:
- **Backend/API**: Next.js API Routes + Server Actions
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Pagos**: Por definir (Stripe/PayPal/Mercado Pago)
- **IA**: Por definir (OpenAI/Google Vision)
- **Analytics**: Google Analytics o Plausible
- **Monitoring**: Sentry

### Prioridades Inmediatas:
1. ✅ **COMPLETADO**: Deployment en producción con dominio y HTTPS
2. ✅ **COMPLETADO**: Cuenta Supabase creada
3. 🔴 **AHORA**: Finalizar frontend (10% restante)
   - Revisar y editar 7 tutoriales
   - Crear página `/amigos`
4. 🔴 **SIGUIENTE**: Diseñar schema de base de datos en Supabase (Fase 3.2)
5. 🔴 **DESPUÉS**: Crear tablas y configurar Storage en Supabase (Fase 3.2-3.4)
6. 🔴 **DESPUÉS**: Implementar autenticación básica (Fase 4.1)
7. 🟡 **DESPUÉS**: Crear primeras API routes (Fase 5)

### Orden de Trabajo Recomendado:

#### 📝 **Semana 1: Finalizar Frontend (10%)**
- [ ] Revisar y editar Tutorial de Chat/Salas
- [ ] Revisar y editar Tutorial de Búsqueda/Personas  
- [ ] Revisar y editar Tutorial de Mensajes Privados
- [ ] Revisar y editar Tutorial de Encuentros
- [ ] Revisar y editar Tutorial de Historias
- [ ] Revisar y editar Tutorial de Perfil
- [ ] Revisar y editar Tutorial de Seguridad
- [ ] Crear página `/amigos`
- [ ] (Opcional) Páginas legales: About, Términos, FAQ

#### 🗄️ **Semana 2-3: Backend Base (Supabase)**
- [x] Crear cuenta Supabase ✅
- [ ] Crear proyecto en Supabase
- [ ] Diseñar schema completo de DB (16 tablas)
- [ ] Crear todas las tablas en Supabase
- [ ] Configurar Storage buckets (4 buckets)
- [ ] Instalar librerías: `npm install @supabase/supabase-js @supabase/ssr`
- [ ] Configurar `lib/supabase/client.ts` y `lib/supabase/server.ts`
- [ ] Configurar variables de entorno en Vercel

#### 🔐 **Semana 4-5: Autenticación**
- [ ] Implementar registro completo
- [ ] Implementar login/logout
- [ ] Middleware de protección de rutas
- [ ] Verificación de email
- [ ] Recuperación de contraseña
- [ ] Sistema de roles básico

#### 🔌 **Semana 6-9: API Routes y Conexión**
- [ ] API de usuarios
- [ ] API de perfiles
- [ ] API de chat (mensajes)
- [ ] API de álbumes y fotos
- [ ] API de comentarios y likes
- [ ] API de visitas
- [ ] API de encuentros
- [ ] Conectar componentes frontend con APIs
- [ ] Implementar real-time en chat
- [ ] Migrar todos los datos hardcoded

#### 💳 **Semana 10-11: Pagos y Extras**
- [ ] Integrar pasarela de pagos
- [ ] Sistema PLUS+ completo
- [ ] Verificación IA (opcional)
- [ ] Panel de admin básico
- [ ] Sistema de reportes

#### 🧪 **Semana 12: Testing y Pulido**
- [ ] Testing básico de componentes
- [ ] Testing de API routes
- [ ] Corrección de bugs
- [ ] Optimización de performance
- [ ] Preparar para beta

#### 🚀 **Semana 13+: Lanzamiento**
- [ ] Beta testing con usuarios reales
- [ ] Correcciones finales
- [ ] Marketing y lanzamiento público
- [ ] Monitoreo y mejoras continuas

---

## 🎯 META FINAL

Lanzar una **red social funcional y completa** para la comunidad venezolana con:
- ✅ Sistema de perfiles verificados
- ✅ Chat en tiempo real
- ✅ Compartir fotos y álbumes
- ✅ Historias efímeras
- ✅ Invitaciones a encuentros presenciales
- ✅ Sistema de suscripciones PLUS+
- ✅ Moderación automática con IA
- ✅ Seguridad y privacidad robustas

---

**Última actualización:** 2026-01-06 19:00 UTC  
**Estado actual:** ✅ Frontend 90% completado, ✅ Supabase cuenta creada, ⏳ Revisar tutoriales + página /amigos  
**Siguiente objetivo:** Finalizar frontend, luego diseñar schema de base de datos en Supabase

---

## 📚 HISTORIAL DE CAMBIOS IMPORTANTES

### 2026-01-06: Deployment Exitoso en Producción ✅

**Problema inicial:**
- Build fallaba en Vercel con error: `useSearchParams() should be wrapped in a suspense boundary`
- Vercel quedó atascado usando commit viejo (b503823)
- Dominio locutorio.com.ve no se podía configurar

**Solución implementada:**
1. **Fix de useSearchParams:** Agregado Suspense wrapper y `export const dynamic = 'force-dynamic'` en 5 páginas:
   - `/chat` (ChatRoomsPage)
   - `/security` (AjustesPage)
   - `/login` (LoginPage)
   - `/create-profile` (CrearPerfilPage)
   - `/meetings` (EncuentrosPage)

2. **Nuevo proyecto en Vercel:** 
   - Creado proyecto nuevo `locutorio-tjyb` para evitar caché
   - Código deployado con commit: `fec7e93`
   - Build exitoso: ✅

3. **Configuración DNS en Donweb:**
   - Eliminados 3 registros AAAA conflictivos (2800:6c0:2::c:272)
   - Registro A: `locutorio.com.ve` → `216.198.79.1`
   - Registro CNAME: `www.locutorio.com.ve` → `07a3247280589c60.vercel-dns-017.com.`
   - FTP registro intacto: `ftp.locutorio.com.ve` → `200.58.111.97` (no tocar)

4. **Resultado:**
   - ✅ App funcionando en: https://locutorio.com.ve
   - ✅ App funcionando en: https://www.locutorio.com.ve
   - ✅ Certificado SSL activo (HTTPS)
   - ✅ Deployments automáticos desde GitHub
   - ✅ DNS propagados correctamente

**Commits relevantes:**
- `fec7e93`: Trigger Vercel deployment con todos los fixes
- `8ccbfdf`: Suspense y dynamic export en todas las páginas
- `2714454`: Move dynamic export y mejora de useSearchParams
- `71d575b`: Dynamic export para página de chat

**Próximos pasos:**
1. Renombrar proyecto de `locutorio-tjyb` a `locutorio` (opcional, cosmético)
2. Completar tutoriales pendientes (7 tutoriales)
3. Crear páginas legales y de ayuda (8 páginas)
4. Iniciar configuración de Supabase para backend
