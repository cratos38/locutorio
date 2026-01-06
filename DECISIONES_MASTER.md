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
- **Requisito para ciertas funciones PLUS**

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

2. **Sin límites de mensajes:**
   - Usuarios normales: Límites diarios (ver sección 6)
   - PLUS: Mensajes ilimitados

3. **Mensajes Privados ilimitados:**
   - Usuarios normales: Límite de 10 MP por día
   - PLUS: MP ilimitados

4. **Comentarios privados en fotos:**
   - Usuarios normales: Solo comentarios públicos
   - PLUS: Puede hacer comentarios privados (solo los ve el dueño)

5. **Ver quién visitó tu perfil:**
   - Usuarios normales: No pueden ver quién visitó
   - PLUS: Ve lista completa con fecha/hora

6. **Sin publicidad:**
   - Usuarios normales: Ven anuncios
   - PLUS: Navegación sin publicidad

7. **Perfil destacado en búsquedas:**
   - PLUS aparece primero en resultados de búsqueda

8. **Álbumes ilimitados:**
   - Usuarios normales: Máximo 3 álbumes
   - PLUS: Álbumes ilimitados

9. **Fotos ilimitadas por álbum:**
   - Usuarios normales: Máximo 20 fotos por álbum
   - PLUS: Fotos ilimitadas por álbum

10. **Modo invisible:**
    - PLUS puede navegar sin que otros vean sus visitas

11. **Verificación de identidad (ID):**
    - Solo disponible para usuarios PLUS

12. **Estadísticas avanzadas:**
    - Gráficos de visitas, popularidad, etc.

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

**Límites de mensajes en chat:**
- **Semana 1:** ~100 mensajes/día
- **Semana 2:** ~50 mensajes/día
- **Semana 3:** ~20 mensajes/día
- **Semana 4+:** ~10 mensajes/día

**Límites de mensajes privados (MP):**
- Máximo 10 MP por día

**No puedes:**
- Crear salas de chat (ni temporales ni permanentes)
- Ver quién visitó tu perfil
- Hacer comentarios privados en fotos

**Motivación:** Evitar spam y cuentas falsas

### 🔓 Al verificar teléfono:
- Se eliminan todos los límites de mensajes
- Se permite crear salas TEMPORALES
- Se otorgan 30 días de PLUS gratis

---

## 7. ÁLBUMES Y FOTOS

### 📷 Límites:

**Usuarios normales:**
- Máximo 3 álbumes
- Máximo 20 fotos por álbum
- Total: 60 fotos máximo

**Usuarios PLUS:**
- Álbumes ilimitados
- Fotos ilimitadas por álbum

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

### 💬 Tipos de comentarios:

1. **Comentarios públicos:**
   - Los ve todo el mundo
   - Disponible para todos los usuarios

2. **Comentarios privados:**
   - Solo los ve el dueño de la foto
   - Solo disponible para usuarios PLUS

### Reglas:

- **1 comentario por foto por persona**
  - Si ya comentaste, puedes editar o eliminar
  - No puedes comentar 2 veces la misma foto

- **Sin límite de fotos comentadas**
  - Puedes comentar 10 fotos diferentes → 10 comentarios
  - Puedes comentar 100 fotos diferentes → 100 comentarios

### Permisos:

**El dueño de la foto puede:**
- Ver todos los comentarios (públicos + privados)
- Eliminar cualquier comentario
- Con PLUS: Ocultar comentarios de ciertos usuarios

**El que hizo el comentario puede:**
- Editar su comentario
- Eliminar su comentario

### Notificaciones:

**El dueño recibe notificación cuando:**
- Alguien comenta su foto (público o privado)
- Alguien responde a su comentario

---

## 9. SISTEMA DE VISITAS

### 👀 ¿Qué cuenta como visita?

1. **Visita a perfil:**
   - Entrar a `/publicprofile/[username]`

2. **Visita a foto:**
   - Ver una foto en un álbum
   - Hacer click en una foto

**NOTA:** Cada visita se registra con:
- user_id (quién visitó)
- visited_user_id o photo_id (qué visitó)
- timestamp (cuándo)

### Quién puede ver visitas:

**Usuarios normales:**
- No pueden ver quién visitó su perfil
- Pueden ver **cuántas veces** fue visitado su perfil
- Pueden ver **cuántas veces** fue vista cada foto
- Mensaje: "Tu perfil fue visitado 15 veces" (sin nombres)

**Usuarios PLUS:**
- Ven la lista completa de quién visitó su perfil
- Ven quién vio cada foto específica
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

- Sistema tipo "Tinder"
- Se muestran perfiles de otros usuarios
- Puedes dar: ❤️ Me gusta | ❌ Pasar

### Límites:

**Usuarios normales:**
- Máximo 5 "Me gusta" por día
- Pueden ver 20 perfiles por día

**Usuarios PLUS:**
- "Me gusta" ilimitados
- Perfiles ilimitados por día
- Ven quién les dio "Me gusta" sin hacer match

### Match:

Si dos personas se dan "Me gusta" mutuamente:
- ✨ ¡Match!
- Se abre automáticamente un chat privado
- Notificación: "¡Tienes un nuevo match con [username]!"

### Notificaciones:

**Usuarios normales:**
- "Tienes un nuevo match" (solo si hacen match)

**Usuarios PLUS:**
- "A [username] le gustaste" (sin necesidad de match)
- "Tienes un nuevo match"

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
