# ✅ CHECKLIST RÁPIDO - LoCuToRiO

> **Instrucciones:** Cambia `[ ]` por `[x]` cuando completes cada tarea  
> **Última actualización:** 2026-01-06  
> **Frontend:** 90% | **Supabase cuenta:** ✅ Creada

---

## 🎯 FASE ACTUAL: FINALIZAR FRONTEND (10% restante)

### 📝 Tutoriales - Revisar y Editar (7 tutoriales)
⚠️ **NOTA:** Los tutoriales ya existen, solo hay que REVISARLOS y EDITARLOS
- [ ] Revisar y editar: Tutorial de Chat/Salas
- [ ] Revisar y editar: Tutorial de Búsqueda/Personas
- [ ] Revisar y editar: Tutorial de Mensajes Privados
- [ ] Revisar y editar: Tutorial de Encuentros (Tomar café)
- [ ] Revisar y editar: Tutorial de Historias
- [ ] Revisar y editar: Tutorial de Perfil
- [ ] Revisar y editar: Tutorial de Seguridad/Configuración

### 📄 Página Crítica Faltante
- [ ] Crear página `/amigos` - Gestión de amigos y grupos personalizados

### 📄 Páginas Legales y de Ayuda (Opcional - 8 páginas)
- [ ] Página "Acerca de" (`/about`)
- [ ] Términos y Condiciones (`/about/terminos`)
- [ ] Política de Privacidad (`/about/privacidad`)
- [ ] Protección de Datos (`/about/proteccion-datos`)
- [ ] Ayuda/Soporte (`/ayuda`)
- [ ] FAQ - Preguntas Frecuentes (`/faq`)
- [ ] Página 404 personalizada
- [ ] Página de Mantenimiento

### 🎨 Mejoras UI/UX (Opcional)
- [ ] Optimizar diseño responsive para móviles
- [ ] Añadir animaciones y transiciones suaves
- [ ] Implementar tema claro/oscuro (dark mode)
- [ ] Mejorar accesibilidad (a11y)
- [ ] Añadir loading states mejorados
- [ ] Implementar error boundaries
- [ ] Añadir skeletons para carga de contenido

---

## 🗄️ SIGUIENTE FASE: CONFIGURAR BACKEND (Supabase)

### Supabase Setup
- [x] Crear cuenta en Supabase (https://supabase.com) ✅
- [ ] Crear proyecto de base de datos en Supabase
- [ ] Instalar librerías: `npm install @supabase/supabase-js @supabase/ssr`
- [ ] Configurar variables de entorno en Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (opcional, para admin)
- [ ] Crear archivo `lib/supabase/client.ts`
- [ ] Crear archivo `lib/supabase/server.ts`

### Base de Datos - Tablas Principales
- [ ] Tabla: `users` (usuarios básicos)
- [ ] Tabla: `profiles` (perfiles extendidos)
- [ ] Tabla: `chat_rooms` (salas de chat)
- [ ] Tabla: `chat_messages` (mensajes de chat)
- [ ] Tabla: `private_messages` (mensajes privados)
- [ ] Tabla: `photo_albums` (álbumes de fotos)
- [ ] Tabla: `photos` (fotos)
- [ ] Tabla: `comments` (comentarios en fotos)
- [ ] Tabla: `likes` (me gusta en fotos)
- [ ] Tabla: `visits` (visitas a perfiles)
- [ ] Tabla: `stories` (historias efímeras)
- [ ] Tabla: `meetings` (invitaciones café)
- [ ] Tabla: `friendships` (amistades)
- [ ] Tabla: `blocks` (bloqueos)
- [ ] Tabla: `reports` (denuncias)
- [ ] Tabla: `subscriptions` (suscripciones PLUS+)

### Supabase Storage
- [ ] Bucket: `avatars` (fotos de perfil)
- [ ] Bucket: `photos` (fotos de álbumes)
- [ ] Bucket: `stories` (fotos/videos de historias)
- [ ] Bucket: `covers` (fotos de portada)
- [ ] Configurar políticas de acceso (RLS)
- [ ] Configurar límites de tamaño y formatos

---

## 🔐 DESPUÉS: AUTENTICACIÓN

### Supabase Auth
- [ ] Configurar Supabase Auth
- [ ] Implementar registro de usuarios
- [ ] Implementar login (email + contraseña)
- [ ] Implementar logout
- [ ] Recuperación de contraseña
- [ ] Verificación de email
- [ ] Verificación de teléfono (opcional)

### Middleware
- [ ] Crear middleware Next.js para proteger rutas
- [ ] Redirección automática si no está autenticado
- [ ] Verificación de sesión
- [ ] Refresh tokens automático

---

## 🔌 DESPUÉS: API ROUTES

### APIs de Usuario
- [ ] POST `/api/auth/register`
- [ ] POST `/api/auth/login`
- [ ] POST `/api/auth/logout`
- [ ] GET `/api/users/[id]` (obtener perfil)
- [ ] PUT `/api/users/[id]` (actualizar perfil)
- [ ] POST `/api/users/[id]/avatar` (subir avatar)

### APIs de Chat
- [ ] GET `/api/chat/rooms` (listar salas)
- [ ] POST `/api/chat/rooms` (crear sala)
- [ ] GET `/api/chat/rooms/[id]/messages` (mensajes)
- [ ] POST `/api/chat/rooms/[id]/messages` (enviar mensaje)
- [ ] GET `/api/chat/private/[userId]` (mensajes privados)
- [ ] POST `/api/chat/private/[userId]` (enviar mensaje privado)

### APIs de Álbumes
- [ ] GET `/api/albums` (mis álbumes)
- [ ] POST `/api/albums` (crear álbum)
- [ ] GET `/api/albums/[id]` (álbum específico)
- [ ] POST `/api/albums/[id]/photos` (subir foto)
- [ ] GET `/api/photos/[id]/comments` (comentarios)
- [ ] POST `/api/photos/[id]/comments` (comentar)
- [ ] POST `/api/photos/[id]/like` (dar like)

### APIs Social
- [ ] POST `/api/friends/[userId]` (enviar solicitud)
- [ ] PUT `/api/friends/[userId]` (aceptar/rechazar)
- [ ] POST `/api/blocks/[userId]` (bloquear)
- [ ] POST `/api/visits/[userId]` (registrar visita)
- [ ] GET `/api/visits` (mis visitas)

---

## 🔄 DESPUÉS: CONECTAR FRONTEND CON BACKEND

### Migración de Datos Hardcoded
- [ ] Reemplazar usuarios dummy con DB real
- [ ] Conectar chat con Supabase
- [ ] Conectar álbumes con Storage + DB
- [ ] Conectar perfiles con DB
- [ ] Conectar mensajes privados con DB
- [ ] Conectar visitas con DB
- [ ] Conectar historias con DB

### Real-time
- [ ] Chat en tiempo real (Supabase Realtime)
- [ ] Notificaciones en tiempo real
- [ ] Estado "escribiendo..." en tiempo real
- [ ] Actualización de visitas en tiempo real

---

## 💳 EXTRA: SISTEMA DE PAGOS (PLUS+)

### Pasarela de Pagos
- [ ] Seleccionar proveedor (Stripe, PayPal, Mercado Pago)
- [ ] Crear cuenta de pasarela
- [ ] Configurar webhooks
- [ ] Implementar checkout
- [ ] Implementar confirmación de pago

### Funcionalidades PLUS+
- [ ] Crear salas permanentes
- [ ] Comentarios privados en fotos
- [ ] Badge PLUS+ visible
- [ ] Sin publicidad
- [ ] Más álbumes/fotos

---

## 🤖 EXTRA: VERIFICACIÓN IA Y MODERACIÓN

### Verificación IA
- [ ] Integrar API de verificación facial (ej: AWS Rekognition, Azure Face API)
- [ ] Comparar foto de perfil con ID
- [ ] Validar fecha de nacimiento
- [ ] Otorgar badge verificado

### Moderación Automática
- [ ] Filtro de contenido inapropiado (imágenes)
- [ ] Filtro de lenguaje ofensivo (texto)
- [ ] Detección de spam
- [ ] Sistema de reportes automatizado

---

## 🧪 EXTRA: TESTING Y CALIDAD

### Testing
- [ ] Tests unitarios (componentes)
- [ ] Tests de integración (API routes)
- [ ] Tests E2E (Playwright/Cypress)
- [ ] Performance testing (Lighthouse)

---

## 🚀 LANZAMIENTO

### Pre-lanzamiento
- [ ] Beta testing con usuarios reales
- [ ] Recolección de feedback
- [ ] Corrección de bugs críticos
- [ ] Términos legales finalizados

### Lanzamiento
- [ ] Campaña de redes sociales
- [ ] Programa de referidos
- [ ] Onboarding mejorado
- [ ] Monitoreo de errores (Sentry)
- [ ] Analytics (Google Analytics)

---

## 📊 NOTAS RÁPIDAS

### ✅ Lo que YA funciona:
- Frontend ~90% completo (todas las páginas UI)
- Deployment en Vercel con HTTPS
- Dominio personalizado (locutorio.com.ve)
- Navegación y componentes UI
- Diseño responsive básico
- ✅ Cuenta Supabase creada

### ⏳ Lo que FALTA en Frontend (10%):
- Revisar y editar 7 tutoriales existentes
- Crear página `/amigos`
- (Opcional) Páginas legales

### ❌ Lo que FALTA (Backend):
- Backend real (schema de DB pendiente)
- Autenticación real (solo simulada)
- Datos reales (todo es hardcoded)
- Subida de fotos real
- Chat real (no funcional)
- Pagos (PLUS+)

### 🎯 Prioridad AHORA:
1. ✅ **COMPLETADO**: Deployment en producción ✅
2. ✅ **COMPLETADO**: Cuenta Supabase creada ✅
3. 🔴 **AHORA**: Revisar tutoriales (7) + crear página /amigos
4. 🔴 **SIGUIENTE**: Diseñar schema de base de datos en Supabase
5. 🔴 **DESPUÉS**: Crear tablas y configurar Storage

---

**🔗 Enlaces útiles:**
- Proyecto GitHub: https://github.com/cratos38/locutorio
- Vercel Dashboard: https://vercel.com/dashboard
- App en Producción: https://locutorio.com.ve
- Plan Completo: Ver `PLAN_DE_TRABAJO.md`
