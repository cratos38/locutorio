# 🔐 ESPECIFICACIÓN COMPLETA: Flujo de Registro y Verificación

## 📋 ESTADO ACTUAL DEL CÓDIGO (2026-01-06)

### ❌ LO QUE FALTA IMPLEMENTAR:

El archivo `/src/app/create-profile/page.tsx` tiene:
- ✅ Formulario de registro completo
- ✅ Subida de foto en sidebar
- ✅ Validación de campos
- ✅ Dos botones: "Crear y Empezar" y "Crear y Completar Perfil"

Pero NO tiene implementado:
- ❌ Modal de verificación de email con código
- ❌ Bloqueo de aplicación hasta verificar
- ❌ Envío de código por email (backend)
- ❌ Modal de verificación de teléfono (WhatsApp/Telegram)
- ❌ Sistema de expiración de código
- ❌ Botón "Reenviar código"

---

## 🎯 FLUJO COMPLETO A IMPLEMENTAR

### **FASE 1: Registro Inicial**

#### 1.1 Usuario rellena formulario `/create-profile`

**Campos obligatorios:**
- Nombre (apodo/nick) - máx 12 caracteres
- Email - escribir DOS VECES ✅ (campo emailConfirm)
- Contraseña - escribir DOS VECES ✅ (campo passwordConfirm)
  - Mínimo 8 CARACTERES (NO "puntos")
  - Debe incluir: mayúsculas, minúsculas, números, símbolos
- Sexo (Hombre/Mujer/Otro)
- Fecha de nacimiento
- País (dropdown)
- Ciudad (dropdown que depende del país)
- ¿Qué buscas? (pareja/amistad/conversar/aventuras/no sé)
- ¿Dónde buscas pareja? (país y opcionalmente ciudad)

**Foto de perfil:**
- Se sube DURANTE el registro (sidebar izquierdo)
- Proporción 10:13
- Máximo 5MB original → redimensiona a 400px ancho
- Formatos: JPG, PNG
- Requisitos:
  - Foto real y actual (máximo 6 meses)
  - Una sola persona
  - Cara claramente visible (50%+)
  - Centrada en el cuadro
  - Sin filtros
- Puede subir hasta 6 fotos
- Marca una como "principal" (⭐)

#### 1.2 Usuario elige qué hacer

**Dos botones al final del formulario:**

**Botón 1: "Crear y Empezar"**
- Crea cuenta con información mínima
- Puede completar perfil después
- Redirige a verificación de email

**Botón 2: "Crear y Completar Perfil"**
- Continúa a formularios extendidos (intereses, descripción, más fotos)
- Luego redirige a verificación de email

---

### **FASE 2: Verificación de Email (CRÍTICA)**

#### 2.1 Al hacer clic en cualquier botón

**Backend debe:**
1. Validar todos los campos
2. Verificar que email no esté registrado
3. Verificar que nick no esté en uso
4. Generar código de verificación de 6 dígitos
5. Guardar código en DB con:
   - `user_id` (temporal)
   - `code` (6 dígitos)
   - `expires_at` (timestamp + 5 minutos) ← **DECISIÓN PENDIENTE: 30, 60 segundos o 5 min?**
   - `type: 'email'`
6. Enviar email a la dirección proporcionada con el código
7. Crear usuario en DB con estado `email_verified: false`

**Frontend debe:**
1. Mostrar **modal de verificación de email** INMEDIATAMENTE
2. **BLOQUEAR toda la aplicación** (no se puede cerrar el modal con X)
3. El modal muestra:
   - Título: "Verifica tu correo electrónico"
   - Texto: "Hemos enviado un código de 6 dígitos a **[email]**"
   - Input para 6 dígitos (números solamente)
   - Botón "Verificar"
   - Botón "Reenviar código" (se habilita después de X segundos)
   - Temporizador regresivo: "El código expira en 04:32"
   - Link: "¿No recibiste el código? Revisa spam"

#### 2.2 Usuario introduce código

**Si código es CORRECTO:**
- ✅ Cerrar modal
- ✅ Marcar email como verificado en DB (`email_verified: true`)
- ✅ Generar token de sesión (JWT)
- ✅ Redirigir a:
  - Si eligió "Crear y Empezar" → `/dashboard` (ya logeado)
  - Si eligió "Crear y Completar Perfil" → `/userprofile?edit=true` (ya logeado)

**Si código es INCORRECTO:**
- ❌ Mostrar error: "Código incorrecto. Inténtalo de nuevo."
- ❌ Permitir reintentar
- ❌ Después de 3 intentos fallidos: bloquear 5 minutos

**Si código EXPIRA:**
- ⏱️ Mostrar: "El código ha expirado"
- ⏱️ Habilitar botón "Reenviar código"
- ⏱️ Al reenviar: generar nuevo código y reiniciar timer

#### 2.3 Modal NO se puede cerrar

**Restricciones del modal:**
- ❌ NO tiene botón X (cerrar)
- ❌ NO se cierra haciendo clic fuera
- ❌ NO se cierra con tecla ESC
- ✅ SOLO se cierra al verificar correctamente
- ✅ Opciones: "Verificar" o "Reenviar código"

---

### **FASE 3: Verificación de Teléfono (OPCIONAL pero recomendada)**

#### 3.1 Después de verificar email

**Si el usuario YA está en dashboard:**
- Mostrar banner/notificación: "¿Quieres ganar 30 días gratis de PLUS? Verifica tu teléfono"
- Botón: "Verificar ahora" o "Después"

**Si el usuario eligió "Completar Perfil":**
- Al llegar a `/userprofile?edit=true`
- Mostrar sección: "Verificación adicional"
- Opciones: WhatsApp o Telegram

#### 3.2 Usuario elige plataforma

**Dos opciones:**
- 📱 Verificar con WhatsApp
- 📱 Verificar con Telegram

**Proceso:**
1. Usuario introduce número de teléfono (con código de país)
2. Click en "Enviar código"
3. Backend:
   - Validar formato de número
   - Generar código de 6 dígitos
   - Enviar vía API de WhatsApp o Telegram
   - Guardar en DB con `type: 'phone'` y `expires_at`
4. Frontend:
   - Mostrar modal similar al de email
   - Input para código
   - Temporizador
   - Botón "Verificar" y "Reenviar"

**Si verifica teléfono:**
- ✅ Marcar `phone_verified: true` en DB
- 🎁 Otorgar 30 días de PLUS gratis
- ✅ Mostrar mensaje: "¡Verificado! Has ganado 30 días de PLUS"

---

### **FASE 4: Bonificaciones PLUS**

**Tabla de bonificaciones:**

| Acción | Bonificación |
|--------|--------------|
| Completar perfil al menos 70% | 10 días gratis PLUS |
| Establecer foto de perfil real verificada | 10 días gratis PLUS |
| Subir al menos 3 fotos | 10 días gratis PLUS |
| **Verificar email** | **OBLIGATORIO (sin bonificación)** |
| **Verificar teléfono (WhatsApp/Telegram)** | **30 días gratis PLUS** |
| Validar identidad con ID | 30 días gratis PLUS |
| **Total acumulable** | **Hasta 90 días (3 meses) gratis** |
| Por cada amigo invitado que se registre | 10 días adicionales PLUS |

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### **Componente: `EmailVerificationModal.tsx`**

```typescript
interface EmailVerificationModalProps {
  email: string;
  onVerified: () => void;
  onResendCode: () => Promise<void>;
}

export function EmailVerificationModal({ 
  email, 
  onVerified, 
  onResendCode 
}: EmailVerificationModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos = 300 segundos
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  // TODO: Implementar lógica
  // - Timer que decrementa cada segundo
  // - Validación del código (6 dígitos)
  // - Call a API: POST /api/verify-email { code }
  // - Manejo de errores
  // - Bloqueo después de 3 intentos fallidos
  
  return (
    <Dialog open={true} modal={true} /* NO se puede cerrar */>
      {/* ... UI del modal ... */}
    </Dialog>
  );
}
```

### **Componente: `PhoneVerificationModal.tsx`**

Estructura similar a `EmailVerificationModal` pero:
- Permite elegir plataforma (WhatsApp/Telegram)
- Input para número de teléfono con código de país
- Call a API: POST /api/verify-phone

### **API Endpoints necesarios:**

```typescript
// POST /api/auth/register
// Body: { nombre, email, password, sexo, fechaNacimiento, ... }
// Response: { userId, message: "Código enviado a email" }

// POST /api/verify-email
// Body: { userId, code }
// Response: { success: true, token } | { success: false, error }

// POST /api/resend-email-code
// Body: { userId }
// Response: { message: "Nuevo código enviado" }

// POST /api/send-phone-code
// Body: { userId, phone, platform: "whatsapp" | "telegram" }
// Response: { message: "Código enviado" }

// POST /api/verify-phone
// Body: { userId, code }
// Response: { success: true, plusDays: 30 } | { success: false, error }
```

---

## ⏱️ DECISIONES PENDIENTES

### 1. Duración del código de verificación

**Opciones discutidas:**
- ⏰ **30 segundos** - Muy corto, puede frustrar
- ⏰ **60 segundos (1 minuto)** - Corto pero razonable
- ⏰ **5 minutos** - Estándar en la industria ✅ **RECOMENDADO**
- ⏰ **10 minutos** - Demasiado largo

**Recomendación:** **5 minutos** es el estándar.

### 2. ¿Modal se puede cerrar?

**Decisión:** ❌ **NO se puede cerrar**
- No tiene botón X
- No se cierra haciendo clic fuera
- Solo opciones: "Verificar" o "Reenviar código"

### 3. ¿Cuántos intentos antes de bloquear?

**Recomendación:** **3 intentos fallidos** → bloqueo temporal de 5 minutos

### 4. ¿Qué pasa si el usuario cierra el navegador?

**Opciones:**
- Al reabrir → detectar que hay usuario sin email verificado → mostrar modal
- Al reabrir → permitir login pero bloquear funciones hasta verificar

**Recomendación:** Mostrar modal inmediatamente al reabrir.

---

## 📝 NOTAS IMPORTANTES

1. **Email y contraseña SE ESCRIBEN DOS VECES** ✅
   - Campo `emailConfirm` existe (línea 110)
   - Campo `passwordConfirm` existe (línea 112)

2. **"8 puntos" es ERROR → debe ser "8 caracteres"** ✅

3. **NO existe "inicio de sesión por primera vez"** ✅
   - Al verificar email → acceso directo a dashboard (ya logeado)

4. **Foto se sube DURANTE el registro** ✅ (no después)

5. **Verificación de teléfono viene DESPUÉS de email** ✅

---

## 🚀 PRÓXIMOS PASOS

### Para implementar el flujo completo:

1. ✅ **Leer esta spec** antes de cualquier cambio
2. ⏳ Crear `EmailVerificationModal.tsx`
3. ⏳ Crear `PhoneVerificationModal.tsx`
4. ⏳ Crear API routes de verificación
5. ⏳ Integrar modales en `/create-profile/page.tsx`
6. ⏳ Implementar backend de envío de emails
7. ⏳ Implementar backend de envío de SMS/WhatsApp/Telegram
8. ⏳ Testing completo del flujo
9. ⏳ Actualizar tutoriales basándose en esta spec

---

**Fecha de creación:** 2026-01-06  
**Última actualización:** 2026-01-06  
**Estado:** 📋 Especificación completa - Pendiente de implementación
