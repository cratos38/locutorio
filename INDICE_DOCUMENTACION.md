# 📚 ÍNDICE MAESTRO DE DOCUMENTACIÓN - LoCuToRiO

**Fecha de creación:** 2026-01-06  
**Última actualización:** 2026-01-06 23:10  
**Propósito:** Navegación rápida entre toda la documentación del proyecto

---

## 🎯 CÓMO USAR ESTE ÍNDICE

### Para empezar una nueva sesión:
1. Lee primero: **[ESTADO_PROYECTO_2026-01-06.md](#estado-del-proyecto)**
2. Revisa las actualizaciones: **[ACTUALIZACION_SESION_2026-01-06.md](#actualizaciones)**
3. Consulta reglas específicas: **[DECISIONES_MASTER.md](#decisiones-maestras)**
4. Lee el código documentado de la feature que vas a implementar

### Para implementar una feature:
1. Busca la feature en la **[Sección de Código Documentado](#código-documentado)**
2. Lee los comentarios en el archivo correspondiente
3. Consulta la **[Sección de APIs](#apis-necesarias)** si necesitas backend
4. Revisa el **[TodoList](#tareas-pendientes)** para ver el estado

---

## 📋 TABLA DE CONTENIDOS

1. [Documentación General](#documentación-general)
2. [Código Documentado](#código-documentado)
3. [Features Completas](#features-completas)
4. [APIs Necesarias](#apis-necesarias)
5. [Tareas Pendientes](#tareas-pendientes)
6. [Guías de Implementación](#guías-de-implementación)

---

## 📖 DOCUMENTACIÓN GENERAL

### Estado del Proyecto
📄 **Archivo:** `ESTADO_PROYECTO_2026-01-06.md`

**Contiene:**
- Estado actual completo del proyecto
- 10 errores corregidos
- Reglas clarificadas
- Tareas pendientes organizadas
- Estructura de archivos documentada

**Cuándo leer:** Al inicio de cada sesión

---

### Actualizaciones de Sesión
📄 **Archivo:** `ACTUALIZACION_SESION_2026-01-06.md`

**Contiene:**
- Nuevas reglas anti-spam documentadas
- Sistema de aprobación de mensajes
- Restricción de fotos en MP
- Estados de presencia (Online/Ocupado/Invisible)
- Sistema de bloqueo y denuncia bilateral

**Cuándo leer:** Después del estado del proyecto

---

### Resumen de Sesión
📄 **Archivo:** `RESUMEN_SESION_2026-01-06.md`

**Contiene:**
- Resumen ejecutivo de todo lo hecho
- Estadísticas de la sesión
- Commits realizados
- Próximos pasos recomendados

**Cuándo leer:** Para entender qué se hizo en la última sesión

---

### Decisiones Maestras
📄 **Archivo:** `DECISIONES_MASTER.md`

**Contiene:** 15 secciones completas con TODAS las reglas:

1. Flujo de Registro y Creación de Perfil
2. Sistema de Verificación Email
3. Sistema de Verificación Teléfono
4. Verificación de Identidad (ID)
5. Sistema PLUS - Beneficios
6. Restricciones sin Verificación
7. Álbumes y Fotos
8. Sistema de Comentarios
9. Sistema de Visitas
10. Sistema de Salas de Chat
11. Sistema de Encuentros
12. Links Públicos vs Protegidos
13. Pagos y Tarifas
14. **Estados de Presencia (Online/Ocupado/Invisible)** ⭐ NUEVO
15. **Sistema de Aprobación de Mensajes Privados (Anti-spam)** ⭐ NUEVO

**Cuándo leer:** Cuando necesites entender una feature completa

---

## 💻 CÓDIGO DOCUMENTADO

### 1. Registro y Verificaciones

#### Crear Perfil
📄 **Archivo:** `src/app/create-profile/page.tsx`

**Líneas de documentación:** 400+

**Contiene:**
- FASE 1: Formulario de registro (campos, validaciones, fotos)
- FASE 2: Envío del formulario (backend/frontend)
- FASE 3: Verificación de email (modal bloqueante, 60s)
- Referencias a verificaciones adicionales

**Implementar:** EmailVerificationModal.tsx

---

#### Seguridad y Verificaciones
📄 **Archivo:** `src/app/security/page.tsx`

**Contiene:**
- Verificación de teléfono (WhatsApp/Telegram)
- Verificación de ID (para TODOS, no solo PLUS)
- Bonificaciones PLUS

**Implementar:** PhoneVerificationModal.tsx

---

### 2. Mensajes Privados (MP)

#### Sistema Completo de MP
📄 **Archivo:** `src/app/chat/private/page.tsx`

**Líneas de documentación:** 370+

**Contiene:**
- Grupos de usuarios (A sin tel, B con tel)
- Reglas de mensajes (10 nuevas conversaciones/día)
- **Sistema de aprobación:** Aceptar/Rechazar/Guardar para luego ⭐
- **Restricción de fotos:** 5 mensajes por lado ⭐
- **Sistema de bloqueo bilateral:** Proceso completo ⭐ NUEVO
- **Sistema de denuncia bilateral:** Motivos, moderación ⭐ NUEVO
- PLUS: doble check, historial completo
- API endpoints necesarios
- Validaciones frontend

**Implementar:**
- Sistema de aprobación de mensajes
- Restricción de fotos
- Sistema de bloqueo
- Sistema de denuncia

---

### 3. Encuentros

#### Sistema de Encuentros
📄 **Archivo:** `src/app/encuentros/page.tsx`

**Líneas de documentación:** 370+

**Contiene:**
- Grupo A (sin PLUS): NO ve ni envía invitaciones
- Grupo B (PLUS): ve todo, responde, envía ilimitado
- Likes totalmente anónimos (diferentes a Encuentros)
- API endpoints necesarios
- UI/UX completo

**Implementar:**
- Carrusel de perfiles tipo Tinder
- Sistema de invitaciones
- Lista de invitaciones recibidas/enviadas

---

### 4. Estados de Presencia

#### Tipos y Lógica de Estados
📄 **Archivo:** `src/types/presence.ts`

**Líneas de documentación:** 300+

**Contiene:**
- 🟢 Online (todos)
- 🟠 Ocupado (todos)
- ⚫ Invisible (solo PLUS)
- Excepciones del modo invisible
- API endpoints necesarios
- WebSocket para sincronización
- Casos de uso completos

**Implementar:**
- PresenceSelector en Dashboard
- API PATCH /api/user/presence
- WebSocket para real-time
- Lógica de excepciones

---

## 🎯 FEATURES COMPLETAS

### ✅ Completamente Documentadas

| Feature | Archivo Principal | Líneas | Estado |
|---------|-------------------|--------|--------|
| Registro y Email | `create-profile/page.tsx` | 400+ | 📝 Documentado |
| Mensajes Privados | `chat/private/page.tsx` | 370+ | 📝 Documentado |
| Encuentros | `encuentros/page.tsx` | 370+ | 📝 Documentado |
| Estados Presencia | `types/presence.ts` | 300+ | 📝 Documentado |
| Verificaciones | `security/page.tsx` | 200+ | 📝 Documentado |

**Total:** +1640 líneas de documentación técnica

---

### ⏳ Pendientes de Implementar

| Feature | Prioridad | Tiempo Estimado |
|---------|-----------|-----------------|
| EmailVerificationModal | 🔴 Alta | 2-3h |
| PhoneVerificationModal | 🔴 Alta | 2-3h |
| Sistema Aprobación MP | 🔴 Alta | 3-4h |
| Sistema Bloqueo/Denuncia | 🔴 Alta | 3-4h |
| Estados Presencia UI | 🔴 Alta | 2-3h |
| APIs Backend | 🔴 Alta | 4-6h |
| Schema DB Supabase | 🔴 Alta | 2-3h |

---

## 🔌 APIs NECESARIAS

### Autenticación

#### POST /api/auth/register
```typescript
Body: {
  nick: string,
  email: string,
  password: string,
  sex: 'M' | 'F',
  birth_date: date,
  country_code: string,
  city: string
}

Response: {
  success: boolean,
  user_id: uuid
}
```

**Documentación completa en:** `src/app/create-profile/page.tsx` líneas 176-208

---

#### POST /api/auth/verify-email
```typescript
Body: {
  code: string,
  user_id: uuid
}

Response: {
  success: boolean,
  token: string
}
```

**Documentación completa en:** `src/app/create-profile/page.tsx` líneas 241-272

---

#### POST /api/auth/verify-phone/send-code
```typescript
Body: {
  phone: string,
  country_code: string,
  method: 'whatsapp' | 'telegram'
}

Response: {
  success: boolean
}
```

**Documentación completa en:** `src/app/security/page.tsx`

---

### Mensajes Privados

#### POST /api/messages/send
**Documentación completa en:** `src/app/chat/private/page.tsx` líneas 200-250

#### POST /api/messages/accept-conversation
**Documentación completa en:** `src/app/chat/private/page.tsx` líneas 252-260

#### POST /api/messages/block-user
**Documentación completa en:** `src/app/chat/private/page.tsx` líneas 140-160

#### POST /api/messages/report-user
**Documentación completa en:** `src/app/chat/private/page.tsx` líneas 162-180

---

### Estados de Presencia

#### PATCH /api/user/presence
**Documentación completa en:** `src/types/presence.ts` líneas 150-180

---

## 📝 TAREAS PENDIENTES

### 🔴 Alta Prioridad (Hacer primero)

1. ✅ **Crear EmailVerificationModal.tsx**
   - Modal bloqueante (no se cierra con X)
   - Código 6 dígitos, temporizador 60s
   - Documentación: `create-profile/page.tsx`

2. ✅ **Crear PhoneVerificationModal.tsx**
   - Modal con WhatsApp/Telegram (se puede cerrar)
   - Código 6 dígitos, 3 intentos
   - Documentación: `security/page.tsx`

3. ✅ **Implementar APIs de autenticación**
   - POST /api/auth/register
   - POST /api/auth/verify-email
   - POST /api/auth/verify-phone

4. ✅ **Implementar sistema de aprobación MP**
   - Botones: Aceptar/Rechazar/Guardar
   - Documentación: `chat/private/page.tsx`

5. ✅ **Implementar restricción de fotos en MP**
   - Deshabilitar botón hasta 5 mensajes/lado
   - Documentación: `chat/private/page.tsx`

6. ✅ **Implementar sistema de bloqueo bilateral**
   - Botón bloquear, efectos para ambas partes
   - Documentación: `chat/private/page.tsx` líneas 124-160

7. ✅ **Implementar sistema de denuncia bilateral**
   - Modal con motivos, envío a moderadores
   - Documentación: `chat/private/page.tsx` líneas 162-210

8. ✅ **Implementar selector de estados de presencia**
   - Botones o slider en Dashboard
   - Documentación: `types/presence.ts`

9. ✅ **Crear schema de DB en Supabase**
   - Tablas: users, verification_codes, photos, etc.
   - Documentación: cada archivo tiene esquema sugerido

---

### 🟡 Media Prioridad

10. **Crear panel de moderación**
    - Ver denuncias pendientes
    - Aprobar/rechazar denuncias

11. **Revisar y corregir 5 tutoriales**
    - Enlaces rotos
    - Información obsoleta

12. **Implementar verificación ID con IA**
    - Comparar foto documento con perfil

13. **Implementar moderación fotos con IA**
    - Validar cara visible, no obsceno

---

### 🟢 Baja Prioridad

14. **Crear página /amigos**
15. **Implementar sistema de pagos**

---

## 🛠️ GUÍAS DE IMPLEMENTACIÓN

### Para implementar Modales de Verificación:

1. **Lee la documentación:**
   - `src/app/create-profile/page.tsx` (líneas 216-280)

2. **Crea el componente:**
   ```tsx
   src/components/EmailVerificationModal.tsx
   ```

3. **Elementos necesarios:**
   - Input de 6 dígitos (solo números)
   - Temporizador cuenta regresiva (60s)
   - Botón "Verificar"
   - Botón "Reenviar código"
   - Modal bloqueante (no se cierra)

4. **Integra en:**
   - `src/app/create-profile/page.tsx`

---

### Para implementar Sistema de Aprobación MP:

1. **Lee la documentación:**
   - `src/app/chat/private/page.tsx` (líneas 46-90)

2. **Elementos UI necesarios:**
   - Modal cuando recibes nuevo mensaje
   - Tres botones: Aceptar / Rechazar / Guardar
   - Estado de conversación: pending/accepted/rejected

3. **API endpoints:**
   - POST /api/messages/accept-conversation
   - POST /api/messages/reject-conversation

4. **Base de datos:**
   - Tabla: conversations
   - Campo: status ('pending' | 'accepted' | 'rejected')

---

### Para implementar Estados de Presencia:

1. **Lee la documentación:**
   - `src/types/presence.ts` (todo el archivo)

2. **Componente UI:**
   - Selector en Dashboard
   - Tres opciones: Online / Ocupado / Invisible
   - Botón Invisible deshabilitado si no es PLUS

3. **API:**
   - PATCH /api/user/presence

4. **WebSocket:**
   - Broadcast cambios de estado
   - Sincronización en tiempo real

---

## 🎯 RESUMEN RÁPIDO

### ¿Qué tengo que leer?

**Si es tu primera sesión:**
1. `ESTADO_PROYECTO_2026-01-06.md`
2. `DECISIONES_MASTER.md` (secciones 1-6 primero)

**Si ya conoces el proyecto:**
1. `ACTUALIZACION_SESION_2026-01-06.md`
2. Código documentado de la feature a implementar

**Si quieres implementar algo:**
1. Busca la feature en este índice
2. Lee el archivo de código documentado
3. Sigue la guía de implementación

---

## 📊 ESTADÍSTICAS DEL PROYECTO

| Métrica | Valor |
|---------|-------|
| **Archivos de documentación** | 6 |
| **Archivos de código documentado** | 5 |
| **Total líneas documentadas** | +2200 |
| **Features completamente documentadas** | 5 |
| **APIs documentadas** | 12+ |
| **Tareas pendientes** | 19 |
| **Commits en GitHub** | 7 |

---

## 🔗 LINKS RÁPIDOS

### Documentación:
- [Estado del Proyecto](./ESTADO_PROYECTO_2026-01-06.md)
- [Actualizaciones](./ACTUALIZACION_SESION_2026-01-06.md)
- [Decisiones Maestras](./DECISIONES_MASTER.md)
- [Resumen de Sesión](./RESUMEN_SESION_2026-01-06.md)

### Código:
- [Crear Perfil](./src/app/create-profile/page.tsx)
- [Mensajes Privados](./src/app/chat/private/page.tsx)
- [Encuentros](./src/app/encuentros/page.tsx)
- [Estados Presencia](./src/types/presence.ts)
- [Seguridad](./src/app/security/page.tsx)

---

**✅ TODA LA DOCUMENTACIÓN ESTÁ INTERCONECTADA Y LISTA PARA USAR**

**Fecha:** 2026-01-06 23:10  
**Última actualización:** Commit 3f12233  
**Estado:** ✅ Completo y actualizado
