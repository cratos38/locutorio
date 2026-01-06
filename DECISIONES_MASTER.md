# 🗂️ DECISIONES Y FLUJOS COMPLETOS - LoCuToRiO

**Fecha:** 2026-01-06  
**Última actualización:** 2026-01-06 - 18:45  
**Fuente:** Conversación completa de desarrollo  
**Estado:** ✅ COMPLETO - Información validada

---

## 📋 ÍNDICE

1. [Flujo de Registro y Creación de Perfil](#1-flujo-de-registro-y-creación-de-perfil)
2. [Sistema de Verificación Email](#2-sistema-de-verificación-email)
3. [Sistema de Verificación Teléfono](#3-sistema-de-verificación-teléfono)
4. [Verificación de Identidad (ID)](#4-verificación-de-identidad-id)
5. [Sistema PLUS - Beneficios](#5-sistema-plus---beneficios)
6. [Restricciones sin Verificación](#6-restricciones-sin-verificación)
7. [Álbumes y Fotos](#7-álbumes-y-fotos)
8. [Sistema de Comentarios](#8-sistema-de-comentarios)
9. [Sistema de Visitas](#9-sistema-de-visitas)
10. [Sistema de Salas de Chat](#10-sistema-de-salas-de-chat)
11. [Sistema de Encuentros](#11-sistema-de-encuentros)
12. [Links Públicos vs Protegidos](#12-links-públicos-vs-protegidos)
13. [Pagos y Tarifas](#13-pagos-y-tarifas)

---

## 1. FLUJO DE REGISTRO Y CREACIÓN DE PERFIL

### 🔑 Diferencia entre "Registro" y "Crear Perfil"
- **REGISTRO:** Formulario inicial con datos MÍNIMOS para crear cuenta
- **CREAR PERFIL:** Completar información adicional (intereses, descripción, más fotos)

### 📝 Formulario de Registro (Lado Público)

**Ubicación:** `/create-profile` (accesible sin login desde "Únete ahora")

**Campos del formulario:**
- **Nick/Apodo (Locutorio ID):**  
  - Mínimo 3 caracteres, máximo 12  
  - Solo letras, números, guión bajo  
  - Verificación en tiempo real (debounce 500ms)  
  - API: `GET /api/check-username?username=XXX`  
  - Muestra: ✓ disponible | ! ya en uso | spinner verificando

- **Correo electrónico:**  
  - Campo doble (email + confirmación)  
  - Validación de formato  
  - Verificación de que no esté registrado

- **Contraseña:**  
  - Campo doble (password + confirmación)  
  - Mínimo 8 caracteres  
  - Debe incluir: mayúscula, minúscula, número, símbolo

- **Sexo:**  
  - Solo 2 opciones: Hombre / Mujer

- **Fecha de nacimiento:**  
  - Debe ser real (se usa para verificación +18)  
  - Solo se puede cambiar 1 vez  
  - Crítico para acceso a salas +18

- **País:**  
  - Dropdown con todos los países  
  - Por defecto: Venezuela (VE)

- **Ciudad:**  
  - Dropdown dinámico según país seleccionado

- **Preferencias de búsqueda:**  
  - ¿Qué buscas? (Amistad, Pareja, Conversación)  
  - País de búsqueda  
  - Ciudad de búsqueda (si es el mismo país)

- **Fotos:**  
  - Se pueden subir hasta 6 fotos desde el registro  
  - La primera foto es la "Principal"  
  - Fotos se redimensionan automáticamente a 400px ancho (proporción 10:13)  
  - Máximo 5MB por foto  
  - Todas las fotos quedan en estado "pendiente" hasta aprobación

### 🚀 Dos opciones de envío:

1. **"Crear y empezar"** → Registro mínimo, va directo al código de verificación
2. **"Crear y completar perfil"** → Mismo flujo pero con más datos previos (SIMULACIÓN ACTUAL)

### ⚠️ IMPORTANTE: 
Actualmente ambos botones hacen LO MISMO (van a verificación de email).  
La diferencia es CONCEPTUAL, pero el flujo es el mismo:
- Click en botón → Enviar datos al backend
- Backend genera código de 6 dígitos
- Backend envía email con código
- Frontend abre modal de verificación AUTOMÁTICAMENTE

---

## 2. SISTEMA DE VERIFICACIÓN EMAIL

### 📧 Flujo completo:

1. **Usuario hace click en "Crear y empezar" o "Crear y completar perfil"**

2. **Backend (API a crear):**
   ```typescript
   POST /api/auth/register
   
   - Validar todos los campos
   - Verificar email único en DB
   - Verificar nick único en DB
   - Hash de contraseña (bcrypt)
   - Generar código de 6 dígitos aleatorio (ejemplo: 482735)
   - Guardar en tabla users:
     {
       id: uuid,
       nick: string,
       email: string,
       password_hash: string,
       sex: string,
       birth_date: date,
       country_code: string,
       city: string,
       email_verified: false,
       phone_verified: false,
       id_verified: false,
       created_at: timestamp
     }
   - Guardar en tabla verification_codes:
     {
       id: uuid,
       user_id: uuid (FK),
       code: string (encriptado),
       type: 'email',
       expires_at: NOW() + 60 segundos,
       attempts: 0,
       created_at: timestamp
     }
   - Enviar email con código usando servicio de email
   - Responder: { success: true, user_id: uuid }
   ```

3. **Frontend:**
   - Recibe respuesta exitosa
   - Abre `EmailVerificationModal` **AUTOMÁTICAMENTE**
   - Modal **BLOQUEA TODA LA APP** (no se puede cerrar, sin X)

4. **Modal de Verificación de Email:**

   **Componente:** `EmailVerificationModal`

   **Elementos:**
   - Título: "Verifica tu correo electrónico"
   - Texto: "Hemos enviado un código de 6 dígitos a [email]"
   - Input de 6 dígitos (auto-focus)
   - Temporizador: 60 segundos (cuenta regresiva)
   - Botón "Verificar" (deshabilitado si no hay 6 dígitos)
   - Botón "Reenviar código" (deshabilitado hasta que expire el timer)

   **Lógica:**
   - Usuario ingresa código de 6 dígitos
   - Click en "Verificar"
   - Frontend envía: `POST /api/auth/verify-email { code, user_id }`
   - Backend valida:
     - Código correcto
     - No expirado (60 segundos)
     - Máximo 3 intentos
   - Si correcto:
     - Actualizar `users.email_verified = true`
     - Generar JWT token
     - Cerrar modal
     - Redirigir a `/dashboard` (ya logeado)
   - Si incorrecto:
     - Incrementar `attempts`
     - Mostrar error: "Código incorrecto. Te quedan X intentos"
     - Si attempts >= 3:
       - Mostrar: "Demasiados intentos. Por favor solicita un nuevo código"
       - Habilitar botón "Reenviar código"

   **Reenviar código:**
   - Genera nuevo código
   - Resetea timer a 60s
   - Resetea attempts a 0
   - Envía nuevo email

5. **Después de verificar:**
   - Usuario queda LOGEADO
   - Redirige a `/dashboard`
   - **NOTA:** El dashboard muestra tarjetas de verificación:
     - ✅ Email verificado (verde)
     - ⚠️ Teléfono no verificado (amarillo/rojo)

---

## 3. SISTEMA DE VERIFICACIÓN TELÉFONO

### 📱 Flujo completo:

**Ubicación:** `/security` o desde banner/notificación en `/dashboard`

### ¿Cuándo se verifica?
- **NO es obligatorio inmediatamente** después del email
- Se puede hacer desde:
  - Banner en `/dashboard` que dice "Verifica tu teléfono para desbloquear funciones"
  - Desde `/security` → sección "Verificación de teléfono"
  - Desde `/userprofile` → pestaña "Seguridad"

### Opciones de verificación:
1. **WhatsApp**
2. **Telegram**

### Proceso:

1. **Usuario hace click en "Verificar teléfono con WhatsApp" o "Verificar teléfono con Telegram"**

2. **Se abre modal `PhoneVerificationModal`:**
   - Dropdown de código de país (+58, +1, +34, etc.)
   - Input de número de teléfono
   - Botón "Enviar código"

3. **Backend:**
   ```typescript
   POST /api/auth/verify-phone/send-code
   
   Body: {
     phone: string,
     country_code: string,
     method: 'whatsapp' | 'telegram'
   }
   
   - Formatear número completo: +58 412 1234567
   - Generar código de 6 dígitos
   - Guardar en tabla verification_codes:
     {
       id: uuid,
       user_id: uuid (del JWT),
       code: string (encriptado),
       type: 'phone',
       phone_number: string,
       method: 'whatsapp' | 'telegram',
       expires_at: NOW() + 60 segundos,
       attempts: 0
     }
   - Enviar código por WhatsApp o Telegram (API externa)
   - Responder: { success: true }
   ```

4. **Frontend muestra input de código:**
   - Input de 6 dígitos
   - Temporizador: 60 segundos
   - Botón "Verificar"
   - Botón "Reenviar código" (habilitado después de 60s)

5. **Verificación:**
   ```typescript
   POST /api/auth/verify-phone/confirm-code
   
   Body: {
     code: string
   }
   
   - Validar código
   - Validar que no expiró (60s)
   - Validar attempts < 3
   - Si correcto:
     - Actualizar users.phone_verified = true
     - Actualizar users.phone_number = phone
     - Otorgar 30 días de PLUS gratis
     - Cerrar modal
   - Si incorrecto:
     - Incrementar attempts
     - Mostrar error
   ```

6. **Después de verificar:**
   - La tarjeta en `/dashboard` cambia a verde ✅
   - Se desbloquean funciones (ver sección de restricciones)
   - Se otorgan 30 días de PLUS gratis

### ⚠️ IMPORTANTE:
- La verificación de teléfono **NO bloquea** la app como la de email
- El modal **SÍ se puede cerrar** (tiene X)
- Si el usuario cierra el modal, puede verificar después
- Mientras no verifique, tiene restricciones (ver sección 6)

---

## 4. VERIFICACIÓN DE IDENTIDAD (ID)

### 🆔 Flujo completo:

**Ubicación:** `/security` → sección "Verificación de identidad"

### ¿Qué es?
- Usuario sube foto de su cédula/DNI/pasaporte
- Se compara la foto del documento con la foto de perfil
- Usa IA para verificar que es la misma persona
- **NO expone el nombre real del usuario**
- Solo confirma: "Esta persona es real y su edad es correcta"

### Beneficio:
- Badge de "Verificado Real" (✓) en el perfil
- 30 días de PLUS gratis
- **DISPONIBLE PARA TODOS** (no requiere PLUS)
- **AL CONTRARIO:** Verificando tu ID obtienes PLUS gratis

### Proceso:

1. **Usuario hace click en "Verificar mi identidad"**

2. **Se abre modal/página de verificación:**
   - Instrucciones claras
   - Ejemplo de foto aceptada
   - Input para subir foto de documento (cédula/DNI/pasaporte)
   - Input para subir selfie sosteniendo el documento

3. **Backend:**
   ```typescript
   POST /api/auth/verify-id
   
   Body: {
     document_photo: File,
     selfie_photo: File
   }
   
   - Validar que ambas fotos existen
   - Subir a Supabase Storage: bucket 'id-verification'
   - Llamar a API de verificación facial (ej: AWS Rekognition, Azure Face API)
   - Comparar:
     - Foto de perfil del usuario
     - Foto del documento
     - Selfie con documento
   - Extraer fecha de nacimiento del documento
   - Comparar con fecha de nacimiento registrada
   - Si todo coincide (match >= 90%):
     - Actualizar users.id_verified = true
     - Actualizar users.age_verified = true
     - Otorgar 30 días de PLUS gratis
     - Crear registro en tabla id_verifications:
       {
         id: uuid,
         user_id: uuid,
         status: 'approved',
         verified_at: timestamp,
         match_score: float
       }
   - Si no coincide:
     - status: 'rejected'
     - Mostrar: "La verificación falló. Por favor intenta de nuevo"
   ```

4. **Tiempo de verificación:**
   - Automática (IA): 1-5 minutos
   - Si requiere revisión manual: 24-48 horas

5. **Después de verificar:**
   - Badge "✓ Verificado" aparece en:
     - Foto de perfil
     - Perfil público
     - Búsquedas
   - Notificación: "Tu perfil ha sido verificado"

### ⚠️ ¿Qué pasa si se rechaza?
- Mensaje: "No pudimos verificar tu identidad. Asegúrate de que:"
  - La foto del documento sea clara
  - La fecha de nacimiento coincida
  - La foto de perfil muestre tu cara claramente
- Puede intentar de nuevo (máximo 3 intentos por mes)

---

## 5. SISTEMA PLUS - BENEFICIOS

### 💎 ¿Qué incluye PLUS?

**Características exclusivas:**

1. **Salas de Chat Permanentes:**
   - Usuarios normales: Solo salas TEMPORALES (desaparecen al salir)
   - PLUS: Puede crear salas PERMANENTES que persisten

2. **Ver quién visitó tu perfil:**
   - Usuarios normales: No pueden ver quién visitó
   - PLUS: Ve lista completa con fecha/hora

3. **Ver quién visitó tus álbumes:**
   - Usuarios normales: No pueden ver quién visitó
   - PLUS: Ve lista completa con fecha/hora

4. **Ver quién te envió encuentro (invitación "tomar café"):**
   - Usuarios normales: NO pueden ver quién, solo notificación "5 usuarios te invitan"
   - PLUS: Ve lista completa con foto, nombre y fecha

5. **Guardar historial completo:**
   - PLUS puede guardar todo el historial de chat y MP
   - Usuarios normales: No guardan historial

6. **Doble check en MP (✓✓):**
   - PLUS ve: mensaje entregado (✓) y mensaje leído (✓✓)
   - Usuarios normales: No ven estado de entrega/lectura

7. **Ocultar comentarios en tus fotos:**
   - Usuarios normales: Comentarios SIEMPRE públicos
   - PLUS: Puede ocultar comentarios públicos en sus fotos (solo él los ve)

8. **Sin publicidad:**
   - Usuarios normales: Ven anuncios
   - PLUS: Navegación sin publicidad

9. **Modo invisible:**
   - PLUS puede navegar sin que otros vean sus visitas
   - Excepción: Si escribe en chat público → aparece como Online
   - En MP: permanece invisible

10. **Enviar invitaciones de Encuentros:**
   - PLUS puede enviar invitaciones "tomar café" ILIMITADAS
   - Usuarios normales NO pueden enviar invitaciones

11. **Estadísticas avanzadas:**
   - Gráficos de visitas, popularidad, etc.

### ⚠️ LO QUE PLUS **NO** INCLUYE:

❌ **NO** hay límites diferentes de mensajes en chat (igual para todos)
❌ **NO** hay límites diferentes de MP (igual para todos)
❌ **NO** hay comentarios privados en fotos (todos son públicos)
❌ **NO** hay perfil destacado en búsquedas (búsqueda por filtros)
❌ **NO** hay límite de álbumes (ilimitado para todos)
❌ **NO** hay límite de fotos por álbum (ilimitado para todos)
❌ **NO** hay prioridad en verificación de ID (todos iguales)

### 🎁 Formas de obtener PLUS gratis:

1. **Completar perfil al 70%:** → 10 días gratis
2. **Subir foto de perfil real:** → 10 días gratis
3. **Tener al menos 3 fotos:** → 10 días gratis
4. **Verificar teléfono (WhatsApp/Telegram):** → 30 días gratis
5. **Verificar identidad (ID):** → 30 días gratis
6. **Invitar amigos (por cada registro exitoso):** → 10 días gratis

**Máximo acumulable:** 3 meses gratis (90 días)

---

## 6. RESTRICCIONES SIN VERIFICACIÓN

### 🚫 Si NO verificaste EMAIL:
- **BLOQUEO TOTAL** hasta verificar
- No puedes acceder a ninguna función
- Solo ves el modal de verificación

### ⚠️ Si NO verificaste TELÉFONO:

**Límites de mensajes en CHAT (todas las salas combinadas):**
- **Semana 1:** 100 mensajes/día en TODAS las salas
- **Semana 2:** 50 mensajes/día en TODAS las salas
- **Semana 3:** 20 mensajes/día en TODAS las salas
- **Semana 4+:** 10 mensajes/día en TODAS las salas

**Límites de Mensajes Privados (MP):**
- ❌ **NO puede iniciar conversaciones nuevas** (enviar primer MP)
- ✅ **SÍ puede responder** si alguien le escribe primero
- ✅ **Mensajes ilimitados** con usuarios con los que ya se comunica

**Motivación:** Evitar spam y cuentas falsas

### ✅ Si verificaste TELÉFONO (con o sin PLUS):

**Límites de mensajes en CHAT:**
- ✅ **Sin límites** en número de mensajes por día en salas

**Límites de Mensajes Privados (MP):**
- ✅ **Puede iniciar conversaciones nuevas**
- ⚠️ **Máximo 10 nuevas conversaciones por día**
  - "Nueva conversación" = Primer MP a alguien con quien NUNCA has hablado antes
  - Ejemplo: Si envías primer MP a Juan (nunca hablaste con él) → cuenta 1 de 10
  - Ejemplo: Si hoy escribes a María (con quien ya hablaste ayer) → NO cuenta, es conversación existente
- ✅ **Mensajes ilimitados** con usuarios con los que ya se comunicó antes
- ⚠️ **REGLA ANTI-SPAM:** Si envías MP y la persona NO acepta tu invitación → NO puedes enviar otro MP hasta que acepte

**IMPORTANTE:** La restricción de "10 nuevas conversaciones/día" aplica tanto a usuarios normales como PLUS.

---

## 7. ÁLBUMES Y FOTOS

### 📷 Límites:

**TODOS los usuarios (con y sin PLUS):**
- ✅ Álbumes ilimitados
- ✅ Fotos ilimitadas por álbum
- Ejemplo: Puedes crear 100 álbumes si quieres
- Ejemplo: Puedes poner 500 fotos en un álbum si deseas

**NO hay diferencia entre usuarios normales y PLUS en cantidad de álbumes/fotos**

### Privacidad de álbumes:

**Opciones:**
1. **Público:** Todos pueden ver
2. **Privado:** Solo yo puedo ver
3. **Solo amigos:** Solo mis amigos pueden ver

### Privacidad de fotos individuales:

Cada foto puede tener su propia configuración:
- Pública (independiente del álbum)
- Privada (solo yo)
- Solo amigos

**NOTA:** Si el álbum es privado, TODAS las fotos son privadas (independiente de la config individual)

### Aprobación de fotos:

**Todas las fotos pasan por moderación:**

**Estados:**
1. **Pendiente:** Recién subida, esperando aprobación
2. **Aprobada:** ✅ Visible para otros
3. **Rechazada:** ❌ No cumple requisitos

**Requisitos para aprobar:**
- Cara claramente visible
- Solo 1 persona en la foto
- No contenido obsceno/sexual
- No grupos de personas
- No fotos de famosos
- No fotos borrosas

**Tiempo de aprobación:** 
- Automático (IA): 1-5 minutos
- Revisión manual: 24 horas máximo

**Si se rechaza:**
- Notificación: "Tu foto fue rechazada. Motivo: [razón]"
- Debe subir otra foto

### Fotos de perfil:

**Foto principal:**
- Es la única foto que se muestra en:
  - Búsquedas
  - Lista de usuarios
  - Chat
- Debe estar aprobada
- Si se rechaza, debe cambiarla para poder usar la app

**Álbum de fotos de perfil:**
- Es un álbum especial
- Siempre es público
- Otros pueden ver todas las fotos del álbum
- Puede tener hasta 20 fotos (usuarios normales) o ilimitadas (PLUS)

---

## 8. SISTEMA DE COMENTARIOS

### 💬 Tipo de comentarios:

**TODOS los comentarios son PÚBLICOS:**
- Todos los usuarios pueden leer todos los comentarios
- Todos los usuarios pueden escribir comentarios
- ❌ **NO existen comentarios privados**

**Excepción PLUS:**
- Si el dueño de la foto tiene PLUS, puede:
  - ✅ Ocultar los comentarios que otros hicieron en su foto
  - Resultado: Los comentarios siguen existiendo, pero solo el dueño los ve
  - Otros usuarios no ven los comentarios públicos ocultos

### Reglas:

- **1 comentario por foto por persona**
  - Si ya comentaste, puedes editar o eliminar
  - No puedes comentar 2 veces la misma foto

- **Sin límite de fotos comentadas**
  - Puedes comentar 10 fotos diferentes → 10 comentarios
  - Puedes comentar 100 fotos diferentes → 100 comentarios

### Permisos:

**El dueño de la foto puede:**
- Ver todos los comentarios
- Eliminar cualquier comentario
- Con PLUS: Ocultar comentarios públicos (solo él los ve)

**El que hizo el comentario puede:**
- Editar su comentario
- Eliminar su comentario

### Notificaciones:

**El dueño recibe notificación cuando:**
- Alguien comenta su foto
- Alguien responde a su comentario

---

## 9. SISTEMA DE VISITAS

### 👀 ¿Qué cuenta como visita?

1. **Visita a perfil:**
   - Entrar a `/publicprofile/[username]`

2. **Visita a álbum:**
   - Ver un álbum completo

3. **Visita a foto:**
   - Ver una foto específica en un álbum

**NOTA:** Cada visita se registra con:
- user_id (quién visitó)
- visited_user_id, album_id o photo_id (qué visitó)
- timestamp (cuándo)

### Quién puede ver visitas:

**Usuarios normales:**
- ❌ No pueden ver quién visitó su perfil
- ❌ No pueden ver quién visitó sus álbumes
- ❌ No pueden ver quién envió encuentro
- ✅ Pueden ver **cuántas veces** fue visitado su perfil
- ✅ Pueden ver **cuántas veces** fue visitado cada álbum
- ✅ Pueden ver **cuántas veces** fue vista cada foto
- Mensaje: "Tu perfil fue visitado 15 veces" (sin nombres)

**Usuarios PLUS:**
- ✅ Ven la lista completa de quién visitó su perfil
- ✅ Ven quién visitó cada álbum
- ✅ Ven quién vio cada foto específica
- ✅ Ven quién les envió encuentro
- Con fecha/hora exacta
- Ejemplo: "Ana_M visitó tu perfil hace 2 horas"

### Estadísticas:

**En cada foto se muestra:**
- 👁️ 45 vistas (para todos)
- 💬 12 comentarios (para todos)
- ❤️ 8 me gusta (para todos)

**En el perfil:**
- "Tu perfil fue visitado 123 veces esta semana"
- PLUS: Lista completa de visitantes

---

## 10. SISTEMA DE SALAS DE CHAT

### 💬 Tipos de salas:

1. **Salas TEMPORALES (gratis):**
   - Cualquiera puede crearlas (si tiene teléfono verificado)
   - Desaparecen cuando el creador sale
   - No persisten en la base de datos
   - Ideal para conversaciones rápidas

2. **Salas PERMANENTES (PLUS):**
   - Solo usuarios PLUS pueden crearlas
   - Persisten en la base de datos
   - No desaparecen al salir el creador
   - Se eliminan si están vacías 7+ días consecutivos

### Límites:

**Sin teléfono verificado:**
- No puede crear ninguna sala
- Puede entrar a salas existentes

**Con teléfono verificado:**
- Puede crear salas TEMPORALES
- Puede entrar a cualquier sala

**Con PLUS:**
- Puede crear salas PERMANENTES
- Puede crear hasta 5 salas PERMANENTES simultáneas
- Puede entrar a cualquier sala

### Reglas de salas:

**Salas +18:**
- Requieren verificación de edad (fecha de nacimiento)
- Solo usuarios con birthdate >= 18 años pueden entrar
- Badge especial: 🔞 ADULTOS

**Moderación:**
- El creador puede:
  - Silenciar usuarios (mute)
  - Banear usuarios (kick)
  - Eliminar mensajes
  - Cerrar la sala (si es PERMANENTE)

**Reglas de conducta:**
- No spam
- No contenido sexual (excepto salas +18 explícitas)
- No acoso
- No publicidad

**Sanciones:**
- Primer aviso: Advertencia
- Segundo aviso: Silencio temporal (1 hora)
- Tercer aviso: Ban de la sala (permanente)
- Cuarto aviso: Ban de TODAS las salas (temporal, 24h)

---

## 11. SISTEMA DE ENCUENTROS

### 💘 ¿Qué son los Encuentros?

**Encuentros = Invitaciones a "Tomar café"**
- Sistema de invitaciones entre usuarios
- Solo usuarios PLUS pueden ver y enviar invitaciones
- Usuarios sin PLUS reciben notificación pero no ven quién

### Límites:

**GRUPO A (sin verificar teléfono O sin PLUS):**
- ❌ NO pueden ver invitaciones a "tomar café"
- ❌ NO pueden enviar invitaciones
- ✅ Reciben notificación: "5 usuarios te invitan a tomar café"
- ❌ NO pueden ver quiénes son esos usuarios
- ❌ NO pueden responder

**GRUPO B (con PLUS):**
- ✅ Ven quién les invitó (foto, nombre, fecha)
- ✅ Pueden responder
- ✅ Pueden enviar invitaciones ILIMITADAS

### Sistema de Likes (❤️):

**LIKES SON DIFERENTES A ENCUENTROS:**
- ✅ Likes son TOTALMENTE ANÓNIMOS
- ✅ TODOS los usuarios ven: "❤️ con número"
- ✅ Al pulsar el número → se anula y solo ves los de ese día
- ✅ En estadísticas completas: número total acumulado
- ✅ Notificación: "Obtuviste un like en perfil" o "Obtuviste un like en foto"
- ❌ **NO se muestra quién dio el like** (anónimo para todos, con y sin PLUS)

**DIFERENCIA:**
- **Likes:** Anónimos, solo número, para TODOS
- **Encuentros:** Invitaciones con foto y nombre, solo PLUS

---

## 12. LINKS PÚBLICOS VS PROTEGIDOS

### 🌐 Páginas PÚBLICAS (sin login):

- `/` → Landing page
- `/about` → Acerca de
- `/terminos` → Términos y condiciones
- `/privacidad` → Política de privacidad
- `/proteccion-datos` → Protección de datos
- `/ayuda` → Centro de ayuda
- `/faq` → Preguntas frecuentes
- `/tutorial` → Página principal de tutoriales
- `/tutorial/la-cuenta` → Tutorial: La cuenta
- `/tutorial/chat` → Tutorial: Chat
- `/tutorial/foto-albumes` → Tutorial: Foto álbumes
- `/tutorial/busqueda` → Tutorial: Búsqueda
- `/publicprofile/[username]` → Perfil público de usuario
- `/login` → Iniciar sesión (redirige si ya está logeado)
- `/register` → Crear cuenta (redirige a create-profile)
- `/create-profile` → Formulario de registro

### 🔒 Páginas PROTEGIDAS (requieren login):

- `/dashboard` → Mi Espacio (página principal)
- `/userprofile` → Mi Perfil (editar)
- `/security` → Seguridad y verificaciones
- `/settings` → Configuración
- `/chat` → Chat / Salas
- `/chat/private` → Mensajes privados
- `/personas` → Búsqueda de personas
- `/encuentros` → Encuentros (tipo Tinder)
- `/albums` → Mis álbumes
- `/albums/[id]` → Ver álbum específico
- `/visits` → Quién visitó mi perfil (PLUS)
- `/stories` → Historias
- `/amigos` → Mis amigos ⚠️ (pendiente de crear)

### 📌 En tutoriales:

**Puedes poner links a páginas protegidas PERO:**
- Aclarar que requieren registro
- Ejemplo: "Para ver tu perfil, [inicia sesión](/login) y ve a [Mi Perfil](/userprofile)"

### 🔗 Verificación de email:

**IMPORTANTE:** Los links de verificación NO deben requerir estar logeado

**Por qué:**
- El usuario abre el link desde su email
- Si requiere login, debe loguearse primero
- Si cierra la app, pierde el link
- Solución: Usar CÓDIGO de 6 dígitos (como lo hacemos)

---

## 13. PAGOS Y TARIFAS

### 💳 Precios de PLUS:

**Desde 1 USD/mes:**

**Planes:**
1. **Mensual:** $1 USD/mes (sin descuento)
2. **3 meses:** $2.70 USD ($0.90/mes) → 10% descuento
3. **6 meses:** $5.10 USD ($0.85/mes) → 15% descuento
4. **12 meses:** $9.60 USD ($0.80/mes) → 20% descuento

### Métodos de pago aceptados:

1. **PayPal:** Internacional
2. **Mercado Pago:** Latinoamérica
3. **Stripe:** Internacional (tarjetas)
4. **Binance Pay:** Criptomonedas
5. **[A definir]:** Métodos locales venezolanos (Zelle, Pago Móvil, etc.)

### Soporte a pagos pequeños:

**Por qué 1 USD:**
- Venezuela: economía complicada
- Pagos pequeños son más accesibles
- PayPal soporta pagos desde $1 USD
- Mercado Pago también

### Renovación automática:

**Por defecto:** SÍ (se renueva automáticamente)
- Notificación 3 días antes: "Tu suscripción se renovará el [fecha]"
- Puede cancelar desde `/settings/subscription`

**Si cancela:**
- Sigue teniendo PLUS hasta que expire
- Después vuelve a usuario normal
- No pierde datos, solo funciones PLUS

---

## 14. ESTADOS DE PRESENCIA (Online/Ocupado/Invisible)

### 🟢 Estados disponibles:

1. **🟢 Online (verde)** - Disponible para TODOS
2. **🟠 Ocupado (naranja)** - Disponible para TODOS  
3. **⚫ Invisible (gris)** - Solo PLUS

### Ubicación del selector:

**En "Mi Espacio" (Dashboard):**
- Opción A: Tres botones → [🟢 Online] [🟠 Ocupado] [⚫ Invisible]
- Opción B: Dropdown → Estado: [Online ▼]
- Opción C: Slider/Toggle

### Comportamiento por estado:

#### 🟢 ONLINE (todos):
- Punto verde al lado del icono/foto
- Usuario aparece como conectado
- Otros ven: "🟢 Online"
- Actividad visible para todos

#### 🟠 OCUPADO (todos):
- Punto naranja/amarillo al lado del icono
- Usuario aparece como "ocupado pero conectado"
- Otros ven: "🟠 Ocupado"
- Significa: "Estoy aquí pero no me molesten, tengo algo en este momento"
- Puede navegar y escribir normalmente
- Recibes notificaciones pero con indicador de ocupado

#### ⚫ INVISIBLE (solo PLUS):
- Símbolo de "no conectado" o sin punto
- Otros ven: "Offline" (aunque estés conectado)
- Puedes navegar sin que te vean
- Visitas NO se registran
- ⚠️ EXCEPCIÓN 1: Si escribes en CHAT público → automáticamente apareces "Online"
- ⚠️ EXCEPCIÓN 2: Si envías MP → permaneces "Invisible"

**Motivación modo invisible:**
- Privacidad al navegar
- Ver perfiles sin dejar rastro
- Revisar mensajes sin presión de responder

**Restricción:**
- Usuarios sin PLUS no pueden activar modo invisible
- Si intentan: Modal "Necesitas PLUS para modo invisible"

---

## 15. SISTEMA DE APROBACIÓN DE MENSAJES PRIVADOS (Anti-spam)

### 📨 Cuando recibes un PRIMER MENSAJE de alguien nuevo:

**Tres opciones:**

1. ✅ **"Aceptar"** → Conversación activa, puedes responder
2. ❌ **"Rechazar"** → Conversación bloqueada, sender NO puede enviar más
3. 💾 **"Guardar para luego"** → Pendiente, sender NO puede enviar más

### Reglas importantes:

**Si eliges "Rechazar" o "Guardar para luego":**
- El sender NO puede enviar otro mensaje
- El sender ve: "Tu mensaje está pendiente de respuesta"
- Debe esperar tu decisión

**Si eliges "Aceptar":**
- ✅ Conversación activa
- ⚠️ "Aceptar" NO significa que debes responder
- ⚠️ AMBOS pueden después BLOQUEAR al otro usuario (derecho bilateral)
- ⚠️ AMBOS pueden después DENUNCIAR por mensajes inapropiados (derecho bilateral)
- Aceptar solo abre el canal de comunicación

### 📸 Restricción de fotos en nuevas conversaciones:

**REGLA:** NO se puede enviar fotos hasta intercambiar **5 mensajes por cada lado**

**Definición:**
- "5 por cada lado" = 5 de Juan + 5 de María = 10 mensajes totales
- Ejemplo:
  - Juan envía 1 → María responde 1
  - Juan envía 2 → María responde 2
  - Juan envía 3 → María responde 3
  - Juan envía 4 → María responde 4
  - Juan envía 5 → María responde 5
  - ✅ AHORA ambos pueden enviar fotos

**Implementación:**
- Botón "📷 Enviar foto" deshabilitado si:
  - messages_count_sender < 5 O messages_count_receiver < 5
- Tooltip: "Envía 5 mensajes más para desbloquear fotos"

**Motivación:** Evitar spam de fotos inapropiadas en primeros mensajes

⚠️ Esta restricción aplica solo a NUEVAS conversaciones

---

## ✅ NOTAS FINALES

### 🎯 Prioridades de implementación:

1. **Email verification** (modal + API) → CRÍTICO
2. **Phone verification** (modal + API + WhatsApp/Telegram) → ALTA
3. **ID verification** (IA facial) → MEDIA (solo para PLUS)
4. **PLUS features** → MEDIA
5. **Restricciones sin verificación** → ALTA
6. **Álbumes y moderación de fotos** → ALTA
7. **Comentarios** → MEDIA
8. **Visitas** → BAJA
9. **Salas permanentes** → MEDIA
10. **Encuentros** → BAJA
11. **Pagos** → ÚLTIMA (después de tener usuarios)

### 📝 TODO - Backend:

- [ ] Diseñar schema de DB en Supabase
- [ ] Crear tablas: users, verification_codes, photos, albums, comments, visits, chat_rooms, messages, etc.
- [ ] Configurar Supabase Storage (buckets para fotos)
- [ ] Implementar API de registro y verificación de email
- [ ] Implementar API de verificación de teléfono (WhatsApp/Telegram)
- [ ] Implementar API de verificación de ID (IA facial)
- [ ] Implementar sistema de restricciones
- [ ] Implementar sistema PLUS (activación/desactivación)
- [ ] Implementar moderación de fotos (IA + manual)
- [ ] Implementar sistema de comentarios
- [ ] Implementar sistema de visitas
- [ ] Implementar salas de chat (real-time con Supabase)
- [ ] Implementar encuentros (swipe system)
- [ ] Implementar pagos (Stripe/PayPal/Mercado Pago)

### 📝 TODO - Frontend:

- [ ] Crear `EmailVerificationModal` component
- [ ] Crear `PhoneVerificationModal` component
- [ ] Crear página `/amigos`
- [ ] Revisar y corregir tutoriales (7 pendientes)
- [ ] Crear páginas legales (About, Términos, Privacidad, etc.)
- [ ] Implementar restricciones visuales (sin teléfono verificado)
- [ ] Implementar badges de verificación (✓)
- [ ] Implementar sistema de notificaciones
- [ ] Implementar real-time en chat
- [ ] Mejorar responsive móvil

---

**FIN DEL DOCUMENTO - Última actualización: 2026-01-06 18:45**
