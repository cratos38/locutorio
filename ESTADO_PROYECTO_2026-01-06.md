# 📊 ESTADO DEL PROYECTO - LoCuToRiO

**Fecha:** 2026-01-06 22:30  
**Última actualización:** 2026-01-06 22:30  
**Propósito:** DOCUMENTAR TODO PARA NO PERDER INFORMACIÓN ENTRE SESIONES

---

## 🎯 OBJETIVO PRINCIPAL

Documentar COMPLETAMENTE el flujo end-to-end de registro/login/verificación con TODAS las reglas y detalles en el código fuente mediante comentarios extensos, para que la información NO SE PIERDA entre sesiones de chat.

---

## ✅ LO QUE YA SE HIZO HOY (2026-01-06)

### 1. Documentación Maestra Creada

- ✅ **DECISIONES_MASTER.md**: 885 líneas con TODO el flujo documentado
  - Registro y creación de perfil
  - Verificación de email (obligatoria, bloqueante)
  - Verificación de teléfono (opcional, WhatsApp/Telegram)
  - Verificación de ID para TODOS (no solo PLUS)
  - Sistema PLUS: beneficios reales y bonificaciones
  - Restricciones sin verificación (chat y MP)
  - Álbumes y fotos (sin límite para todos)
  - Sistema de comentarios (todos públicos)
  - Sistema de visitas (PLUS ve quién, normal ve cantidad)
  - Salas de chat (temporales y permanentes)
  - Sistema de encuentros (PLUS ve/envía, normal solo notificación)
  - Sistema de Likes (totalmente anónimos)
  - Links públicos vs protegidos
  - Pagos y tarifas (desde $1 USD/mes)

### 2. Correcciones Críticas Aplicadas

#### ❌ ERRORES CORREGIDOS:

1. **"8 puntos" → "8 caracteres"** en requisitos de contraseña
2. **Límite de 6 fotos de perfil → SIN LÍMITE** (ahora ilimitado)
3. **Verificación ID solo para PLUS → DISPONIBLE PARA TODOS**
4. **PLUS incluye mensajes ilimitados → NO, los límites son iguales para todos**
5. **Límite 10 MP/día → 10 NUEVAS CONVERSACIONES/DÍA** (con usuarios que nunca hablaste)
6. **Comentarios privados en fotos → NO EXISTEN, todos son públicos**
7. **Perfil destacado en búsqueda → NO EXISTE, búsqueda por filtros**
8. **Límite de álbumes → ILIMITADO para todos**
9. **Límite de fotos por álbum → ILIMITADO para todos**
10. **Prioridad verificación ID → NO HAY prioridad**

#### ✅ REGLAS CLARIFICADAS:

- **GRUPOS DE USUARIOS:**
  - **Grupo A:** Sin verificación de teléfono
  - **Grupo B:** Teléfono verificado (con o sin PLUS)

- **LÍMITES DE MENSAJES PRIVADOS (MP):**
  - **Grupo A (sin tel verificado):**
    - ❌ NO puede iniciar conversaciones nuevas
    - ✅ SÍ puede responder si alguien le escribe
    - ✅ Conversaciones existentes: ILIMITADAS
  
  - **Grupo B (tel verificado, con o sin PLUS):**
    - ✅ Puede iniciar conversaciones nuevas
    - ⚠️ Máximo 10 NUEVAS CONVERSACIONES/DÍA
    - ✅ Conversaciones existentes: ILIMITADAS
    - ⚠️ REGLA ANTI-SPAM: Si envías MP y no aceptan → NO puedes enviar otro hasta que acepte

- **LÍMITES DE CHAT (sin verificar teléfono):**
  - Semana 1: 100 mensajes/día (todas las salas combinadas)
  - Semana 2: 50 mensajes/día
  - Semana 3: 20 mensajes/día
  - Semana 4+: 10 mensajes/día

- **ENCUENTROS (invitaciones "tomar café"):**
  - **Grupo A (sin PLUS):**
    - ❌ NO ve invitaciones
    - ❌ NO puede enviar
    - ✅ Recibe notificación: "5 usuarios te invitan" (sin ver quiénes)
    - ❌ NO puede responder
  
  - **Grupo B (con PLUS):**
    - ✅ Ve quién invitó (foto, nombre, fecha)
    - ✅ Puede responder
    - ✅ Puede enviar invitaciones ILIMITADAS

- **LIKES (❤️):**
  - ✅ TOTALMENTE ANÓNIMOS (para todos, con y sin PLUS)
  - ✅ Solo se muestra el número
  - ✅ Notificación: "Obtuviste un like en perfil" o "en foto"
  - ❌ NUNCA se muestra quién dio el like

- **PLUS INCLUYE:**
  1. Salas de chat permanentes
  2. Ver quién visitó tu perfil
  3. Ver quién visitó tus álbumes
  4. Ver quién te envió encuentro
  5. Guardar historial completo (chat + MP)
  6. Doble check en MP (✓ entregado / ✓✓ leído)
  7. Ocultar comentarios públicos en tus fotos
  8. Sin publicidad
  9. Modo invisible
  10. Estadísticas avanzadas

- **PLUS NO INCLUYE:**
  - ❌ Límites diferentes de mensajes (iguales para todos)
  - ❌ Comentarios privados en fotos (no existen)
  - ❌ Perfil destacado en búsqueda
  - ❌ Límites de álbumes (ilimitado para todos)
  - ❌ Límites de fotos (ilimitado para todos)
  - ❌ Prioridad verificación ID

### 3. Código Documentado Extensamente

- ✅ **src/app/create-profile/page.tsx**: 400+ líneas de comentarios con:
  - FASE 1: Formulario de registro (campos, validaciones, fotos)
  - FASE 2: Envío del formulario (backend/frontend)
  - FASE 3: Verificación de email (modal bloqueante, 60s)
  - Referencias a /security para verificación teléfono
  - Referencias a /security para verificación ID
  - Notas importantes sobre correcciones

- ✅ **src/app/security/page.tsx**: Documentación movida aquí
  - FASE 4: Verificación de teléfono (WhatsApp/Telegram)
  - FASE 5: Verificación de ID (para TODOS)
  - FASE 6: Bonificaciones PLUS

### 4. Commits Realizados

```bash
# Commit 1: Correcciones críticas + Documentación completa
74a60a5 - docs: CORRECCIONES CRÍTICAS + Documentación completa en código
- 414 insertions en create-profile/page.tsx
- Correcciones en DECISIONES_MASTER.md

# Commit 2: Reorganización de documentación
c5ea866 - docs: Reorganizar documentación a carpetas correctas
- Verificación teléfono → security/page.tsx
- Verificación ID → security/page.tsx
- Eliminar límite de 6 fotos → SIN LÍMITE

# Commit 3: Corregir MP, Encuentros y Likes
(último push) - fix: Corregir MP, Encuentros y Likes según explicación real
- Reglas MP: 10 NUEVAS conversaciones/día
- Encuentros: Grupo A no ve, Grupo B ve todo
- Likes: totalmente anónimos
```

---

## 🚨 PROBLEMAS ACTUALES

### ❌ PÉRDIDA DE INFORMACIÓN

**Problema:** Se han gastado **+2600 créditos** en más de **1 hora** respondiendo SIN avanzar.

**Causa:** Falta documentar TODO en el código para que NO se pierda entre sesiones.

### ❌ DOCUMENTACIÓN DISPERSA

**Problema:** Información en DECISIONES_MASTER.md NO está en el código correspondiente.

**Ejemplo:**
- Reglas de MP documentadas en DECISIONES_MASTER.md
- Reglas de MP NO documentadas en:
  - `src/app/chat/private/page.tsx` (donde se usan)
  - `src/components/MessageList.tsx` (donde se implementarían)

**Solución:** Copiar TODA la documentación de DECISIONES_MASTER.md al código fuente en forma de comentarios.

---

## 📋 TAREAS PENDIENTES CRÍTICAS

### 🔴 ALTA PRIORIDAD

1. **Documentar reglas MP en código**
   - Archivo: `src/app/chat/private/page.tsx` (crear si no existe)
   - Contenido: Copiar sección 6 de DECISIONES_MASTER.md como comentarios
   - Reglas: 10 nuevas conversaciones/día, anti-spam, grupos A y B

2. **Documentar sistema Encuentros en código**
   - Archivo: `src/app/encuentros/page.tsx` (crear si no existe)
   - Contenido: Copiar sección 11 de DECISIONES_MASTER.md
   - Reglas: Grupo A vs B, likes anónimos, invitaciones

3. **Crear EmailVerificationModal.tsx**
   - Ubicación: `src/components/EmailVerificationModal.tsx`
   - Modal bloqueante (no se cierra con X, ESC, click fuera)
   - Input 6 dígitos, temporizador 60s, reenviar código
   - API: POST /api/auth/verify-email

4. **Crear PhoneVerificationModal.tsx**
   - Ubicación: `src/components/PhoneVerificationModal.tsx`
   - Modal con WhatsApp/Telegram, se puede cerrar
   - Input 6 dígitos, temporizador 60s, 3 intentos
   - API: POST /api/auth/verify-phone/send-code

5. **Implementar APIs de autenticación**
   - POST /api/auth/register
   - POST /api/auth/verify-email
   - POST /api/auth/verify-phone/send-code
   - POST /api/auth/verify-phone/confirm-code
   - POST /api/auth/verify-id

6. **Crear schema de DB en Supabase**
   - Tablas: users, verification_codes, photos, albums, comments, visits, chat_rooms, messages, encounters
   - Configurar Supabase Storage: buckets para fotos

### 🟡 MEDIA PRIORIDAD

7. **Documentar restricciones en código**
   - Archivo: Middleware de autenticación
   - Lógica de límites de mensajes según semana
   - Bloqueo de MP sin verificación teléfono

8. **Revisar y corregir 5 tutoriales**
   - `/tutorial/la-cuenta/page.tsx`
   - `/tutorial/chat/page.tsx`
   - `/tutorial/foto-albumes/page.tsx`
   - `/tutorial/busqueda/page.tsx`
   - `/tutorial/page.tsx` (índice)
   - Corregir: enlaces rotos, info obsoleta, ortografía

9. **Implementar verificación ID con IA**
   - Comparar foto documento con perfil
   - Extraer edad del documento
   - Marcar id_verified=true
   - Otorgar 30 días PLUS

10. **Implementar moderación fotos con IA**
    - Validar cara visible
    - Validar 1 sola persona
    - Validar no obsceno
    - Aprobar/rechazar automático

### 🟢 BAJA PRIORIDAD

11. **Crear página /amigos**
    - Lista de amigos
    - Solicitudes pendientes
    - Buscar y agregar

12. **Implementar sistema de pagos**
    - Stripe/PayPal/MercadoPago
    - Planes PLUS ($1/mes)
    - Renovación automática

---

## 📁 ESTRUCTURA DE ARCHIVOS ACTUAL

```
/home/user/webapp/
├── DECISIONES_MASTER.md          ✅ 885 líneas - COMPLETO
├── SPEC_REGISTRO_VERIFICACION.md ✅ Flujo completo
├── ESTADO_PROYECTO_2026-01-06.md ✅ ESTE ARCHIVO
├── PLAN_DE_TRABAJO.md             ⚠️ Revisar
├── CHECKLIST-RAPIDO.md            ⚠️ Revisar
├── RESUMEN.md                     ⚠️ Revisar
├── ESTADO-ACTUAL.md               ⚠️ Revisar
├── README.md                      ⚠️ Actualizar
│
├── src/
│   ├── app/
│   │   ├── create-profile/
│   │   │   └── page.tsx           ✅ 400+ líneas comentarios
│   │   │
│   │   ├── security/
│   │   │   └── page.tsx           ✅ Documentación verificaciones
│   │   │
│   │   ├── albums/
│   │   │   ├── page.tsx           ⚠️ Documentar reglas álbumes
│   │   │   └── [id]/page.tsx     ⚠️ Documentar
│   │   │
│   │   ├── chat/
│   │   │   └── private/
│   │   │       └── page.tsx       ❌ NO EXISTE - Crear y documentar MP
│   │   │
│   │   ├── encuentros/
│   │   │   └── page.tsx           ❌ NO EXISTE - Crear y documentar
│   │   │
│   │   ├── tutorial/
│   │   │   ├── page.tsx           ⚠️ Revisar
│   │   │   ├── la-cuenta/
│   │   │   │   └── page.tsx       ⚠️ Corregir enlaces
│   │   │   ├── chat/
│   │   │   │   └── page.tsx       ⚠️ Corregir
│   │   │   ├── foto-albumes/
│   │   │   │   └── page.tsx       ⚠️ Corregir
│   │   │   └── busqueda/
│   │   │       └── page.tsx       ⚠️ Corregir
│   │   │
│   │   └── amigos/
│   │       └── page.tsx           ❌ NO EXISTE - Crear
│   │
│   └── components/
│       ├── EmailVerificationModal.tsx  ❌ NO EXISTE - Crear
│       └── PhoneVerificationModal.tsx  ❌ NO EXISTE - Crear
```

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### Opción A: DOCUMENTAR TODO EN CÓDIGO AHORA

1. Copiar reglas MP de DECISIONES_MASTER.md → crear `src/app/chat/private/page.tsx` con comentarios
2. Copiar reglas Encuentros → crear `src/app/encuentros/page.tsx` con comentarios
3. Copiar reglas Álbumes → documentar en `src/app/albums/page.tsx`
4. Copiar restricciones → crear middleware con comentarios
5. **Resultado:** TODO documentado, NO se pierde información

### Opción B: IMPLEMENTAR COMPONENTES CRÍTICOS

1. Crear EmailVerificationModal.tsx
2. Crear PhoneVerificationModal.tsx
3. Integrar en create-profile/page.tsx
4. Probar flujo completo
5. **Resultado:** Avance concreto visible

### Opción C: CORREGIR TUTORIALES AHORA

1. Leer `/tutorial/la-cuenta/page.tsx`
2. Corregir enlaces rotos
3. Actualizar información obsoleta
4. Corregir ortografía
5. Repetir con los 4 tutoriales restantes
6. **Resultado:** Tutoriales funcionales y actualizados

---

## 🤝 DECISIÓN REQUERIDA

**Usuario debe elegir:**

- [ ] **Opción A:** Documentar TODO en código (2-3 horas, garantiza NO perder info)
- [ ] **Opción B:** Implementar componentes críticos (1-2 horas, avance visible)
- [ ] **Opción C:** Corregir tutoriales (1 hora, mejora UX)
- [ ] **Opción D:** Otra cosa específica que quieras hacer

**Recomendación:** OPCIÓN A primero, luego B, luego C.

---

## 📊 ESTADÍSTICAS DE LA SESIÓN

- **Tiempo invertido:** ~1.5 horas
- **Créditos gastados:** ~2600
- **Commits realizados:** 3
- **Líneas documentadas:** 800+
- **Archivos modificados:** 3 (DECISIONES_MASTER.md, create-profile/page.tsx, security/page.tsx)
- **Archivos creados:** 1 (ESTE DOCUMENTO)

---

## ⚠️ NOTA IMPORTANTE PARA FUTURAS SESIONES

**SI EMPIEZAS UNA NUEVA CONVERSACIÓN:**

1. Lee ESTE archivo primero: `ESTADO_PROYECTO_2026-01-06.md`
2. Lee `DECISIONES_MASTER.md` para conocer TODAS las reglas
3. Lee los comentarios en `src/app/create-profile/page.tsx`
4. Lee los comentarios en `src/app/security/page.tsx`
5. Revisa el TodoList para ver qué falta por hacer

**NO REPITAS EXPLICACIONES QUE YA ESTÁN DOCUMENTADAS.**

---

**FIN DEL DOCUMENTO**
