"use client";

// ====================================================================
// MENSAJES PRIVADOS (MP) - DOCUMENTACIÓN COMPLETA DE REGLAS
// ====================================================================
//
// Este componente maneja los MENSAJES PRIVADOS entre usuarios.
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👥 GRUPOS DE USUARIOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// GRUPO A: Usuarios SIN verificación de teléfono
// GRUPO B: Usuarios CON teléfono verificado (con o sin PLUS)
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📨 REGLAS DE MENSAJES PRIVADOS (MP)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// ⚠️ IMPORTANTE: "NUEVO USUARIO" = Usuario con el que NUNCA has hablado antes
//    NO es un usuario que acaba de registrarse, sino alguien con quien inicias
//    conversación por PRIMERA VEZ.
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚫 GRUPO A: SIN VERIFICACIÓN DE TELÉFONO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Restricciones:
//   ❌ NO puede iniciar conversaciones nuevas (enviar primer MP)
//   ✅ SÍ puede responder si alguien le escribe primero
//   ✅ Conversaciones existentes: ILIMITADAS
//
// Ejemplo:
//   - Juan (Grupo A) busca usuarios
//   - Encuentra a María y quiere escribirle
//   - Sistema le muestra: "Verifica tu teléfono para enviar mensajes"
//   - Juan NO puede enviar el primer mensaje a María
//   
//   Pero:
//   - Si María (Grupo B) le escribe a Juan primero
//   - Juan puede responder sin límite
//   - La conversación es ILIMITADA
//
// Motivación: Evitar spam y cuentas falsas
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ GRUPO B: CON VERIFICACIÓN DE TELÉFONO (con o sin PLUS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Permisos:
//   ✅ Puede iniciar conversaciones nuevas
//   ⚠️ Máximo 10 NUEVAS CONVERSACIONES/DÍA
//   ✅ Conversaciones existentes: ILIMITADAS
//   ⚠️ REGLA ANTI-SPAM: Si envías MP y no aceptan → NO puedes enviar otro
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚨 SISTEMA DE APROBACIÓN DE NUEVAS CONVERSACIONES (ANTI-SPAM)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Cuando recibes un PRIMER MENSAJE de alguien nuevo, debes tomar una decisión:
//
// OPCIONES AL RECIBIR NUEVA CONVERSACIÓN:
// ---------------------------------------
// 1. ✅ "Aceptar" → Conversación se activa, puedes responder
// 2. ❌ "Rechazar" → Conversación bloqueada, sender NO puede enviar más
// 3. 💾 "Guardar para luego" → Conversación pendiente, sender NO puede enviar más
//
// ⚠️ IMPORTANTE: Si eliges "Rechazar" o "Guardar para luego":
//    - El sender NO puede enviar otro mensaje
//    - El sender ve: "Tu mensaje está pendiente de respuesta"
//    - El sender debe esperar tu decisión
//
// ⚠️ CRÍTICO: "Aceptar" NO significa que debes responder:
//    - Puedes aceptar y NO responder
//    - Puedes aceptar y después BLOQUEAR al usuario (cualquiera de los dos)
//    - Puedes aceptar y después DENUNCIAR por mensajes inapropiados (cualquiera de los dos)
//    - Bloquear y denunciar son derechos bilaterales (ambos pueden hacerlo)
//
// Ejemplo de flujo:
//   1. Juan envía primer MP a María
//   2. María recibe notificación: "Juan te envió un mensaje"
//   3. María ve el mensaje y tres botones:
//      - [Aceptar] [Rechazar] [Guardar para luego]
//   4. Si María elige "Guardar para luego":
//      - Conversación queda en carpeta "Pendientes"
//      - Juan NO puede enviar más mensajes
//      - Juan ve: "Tu mensaje está pendiente"
//   5. Si María elige "Rechazar":
//      - Conversación bloqueada
//      - Juan NO puede enviar más mensajes
//      - Juan ve: "Esta persona no aceptó tu invitación"
//   6. Si María elige "Aceptar":
//      - Conversación activa
//      - Ambos pueden escribir libremente
//      - AMBOS pueden después bloquear o denunciar si es necesario (derecho bilateral)
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📸 RESTRICCIÓN DE FOTOS EN NUEVAS CONVERSACIONES (ANTI-SPAM)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// REGLA: NO se puede enviar fotos hasta intercambiar 5 mensajes por cada lado
//
// Definición:
//   - "5 mensajes por cada lado" = 5 de Juan + 5 de María = 10 mensajes totales
//   - Ejemplo:
//     * Juan envía 1 mensaje → María responde 1 → Juan envía 2 → María responde 2
//     * Juan envía 3 → María responde 3 → Juan envía 4 → María responde 4
//     * Juan envía 5 → María responde 5
//     * ✅ AHORA ambos pueden enviar fotos
//
// Implementación técnica:
//   - Contador por conversación: messages_count_sender, messages_count_receiver
//   - Botón de "📷 Enviar foto" deshabilitado si:
//     * messages_count_sender < 5 O messages_count_receiver < 5
//   - Tooltip al pasar mouse sobre botón deshabilitado:
//     * "Envía 5 mensajes más para desbloquear fotos"
//     * "Espera a que tu contacto responda 5 mensajes para desbloquear fotos"
//
// Motivación: Evitar spam de fotos inapropiadas en primeros mensajes
//
// ⚠️ IMPORTANTE: Esta restricción aplica solo a NUEVAS conversaciones
//    - Si ya tenías conversación activa antes → NO aplica restricción
//    - Si es primera vez con este usuario → SÍ aplica restricción
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚫 SISTEMA DE BLOQUEO EN MENSAJES PRIVADOS (MP)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// ⚠️ IMPORTANTE: MP es un espacio PRIVADO. Nadie tiene obligación de hablar contigo.
//    Si alguien te bloquea, es su derecho a la privacidad.
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BLOQUEAR USUARIO EN MP (Derecho bilateral pero asimétrico):
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Disponible para: TODOS (cualquiera puede bloquear a cualquiera)
//
// Ubicación del botón:
//   - En la ventana de MP, lado derecho
//   - Lista de todas las personas con las que has hablado
//   - La persona seleccionada muestra toda la conversación
//   - Botón "🚫 Bloquear" visible en la conversación
//
// Acciones:
//   - Click en "🚫 Bloquear"
//   - Confirmación simple: "¿Confirmar bloqueo?"
//   - [Confirmar] [Cancelar]
//   - ⚠️ NO se necesita explicar por qué bloqueas
//
// Efectos del bloqueo (ASIMÉTRICO):
//
//   1. Usuario bloqueado NO puede:
//      ❌ Enviarte mensajes privados (MP)
//      ✅ VER tu perfil (puede visitar)
//      ✅ VER tus fotos públicas (puede ver)
//      ✅ HABLAR en chat público contigo (puede hablar)
//      ✅ VERTE online/offline (ve tu estado)
//
//   2. Tú (quien bloqueó) SÍ puedes:
//      ✅ Ver su perfil
//      ✅ Ver sus fotos
//      ✅ Hablar en chat público con él
//      ✅ ENVIARLE MP si quieres (bloqueo es de un solo lado)
//
//   3. Si intentan enviarte MP:
//      - Mensaje: "No se puede enviar. El destinatario no desea recibir mensajes de ti"
//      - O: "Usuario te tiene bloqueado"
//
// ⚠️ CRÍTICO: El bloqueo es UNILATERAL
//   - Si Juan bloquea a María → María NO puede escribir a Juan
//   - Pero Juan SÍ puede escribir a María (si quiere)
//   - María SÍ puede ver perfil de Juan, hablar en chat público, etc.
//   - Solo está bloqueada para ENVIAR MP a Juan
//
// Desbloquear:
//   - Ir a Configuración → Usuarios bloqueados
//   - Lista completa de usuarios que TÚ bloqueaste
//   - Botón "Desbloquear" por cada usuario
//   - Al desbloquear: esa persona puede enviarte MP de nuevo
//
// ⚠️ IMPORTANTE: Bloqueo en MP es PERMANENTE (hasta que desbloquees)
//   - NO se puede protestar
//   - NO hay revisión por moderadores
//   - Es un derecho a la privacidad
//   - Si quieres hablar con alguien bloqueado, TÚ puedes desbloquear
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️ SISTEMA DE DENUNCIA EN MENSAJES PRIVADOS (MP)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// ⚠️ MUY IMPORTANTE: Denunciar es SERIO. Es como denunciar en la vida real.
//    Denunciar por motivos falsos se llama INFAMIA y puedes ser baneado TÚ.
//
// ¿Cuándo denunciar?
// -----------------
// ✅ Denunciar SI el usuario:
//   - Envía contenido sexual explícito sin consentimiento
//   - Acosa o amenaza
//   - Suplanta identidad
//   - Solicita dinero / estafa
//   - Envía spam repetitivo
//   - Usa lenguaje discriminatorio (racismo, homofobia, etc.)
//
// ❌ NO denunciar si:
//   - El usuario te dice "eres guapa" o "me gustas" (puedes bloquearlo, no denunciar)
//   - No te gusta la conversación (usa bloquear, no denunciar)
//   - Te bloqueó primero y te ofendiste (esto es INFAMIA, serás baneado TÚ)
//   - Simplemente no quieres hablar (usa bloquear)
//
// Motivos válidos de denuncia:
// ---------------------------
//   1. Spam
//   2. Acoso / Amenazas
//   3. Contenido sexual explícito no solicitado
//   4. Suplantación de identidad
//   5. Lenguaje discriminatorio (racismo, sexismo, homofobia)
//   6. Solicitud de dinero / Estafa
//   7. Otro (con descripción obligatoria)
//
// Proceso de denuncia:
// -------------------
//   1. Botón "⚠️ Denunciar" en la conversación
//   2. Modal con lista de motivos
//   3. Seleccionar motivo (obligatorio)
//   4. Campo de texto: "Describe el problema" (obligatorio)
//   5. Checkbox: "¿Deseas también bloquear a este usuario?" (opcional)
//   6. Advertencia: "Las denuncias falsas pueden resultar en ban de tu cuenta"
//   7. Botones: [Enviar denuncia] [Cancelar]
//
// Efectos de la denuncia:
// ----------------------
//   - Denuncia se envía a moderadores (robot + humanos)
//   - Conversación completa se guarda para revisión
//   - Usuario denunciado RECIBE NOTIFICACIÓN ⚠️ (tiene derecho a saber)
//   - Notificación incluye:
//     * "Has sido denunciado en mensajes privados"
//     * Motivo de la denuncia
//     * Puede responder y defenderse
//   - Si seleccionaste bloquear: bloqueo inmediato
//
// Revisión de denuncias (moderadores):
// -----------------------------------
//   - Robot analiza primero (palabras clave, imágenes)
//   - Si robot detecta violación clara → acción automática
//   - Si no es claro → revisión manual (24-48h)
//   - Moderadores ven:
//     * Conversación completa
//     * Historial del denunciado (denuncias previas)
//     * Historial del denunciante (si denuncia mucho)
//   
//   Decisiones posibles:
//     * Aprobar denuncia → advertir o banear denunciado
//     * Rechazar denuncia → denunciante recibe advertencia por denuncia falsa
//     * Banear denunciante → si es infamia evidente (ej: denunciar porque te bloquearon)
//
// Protección contra denuncias falsas:
// -----------------------------------
//   - Sistema detecta patrones de denuncias falsas
//   - Si denuncias frecuentemente sin motivo:
//     * Recibes advertencia por abuso del sistema
//     * Tus denuncias tienen menos peso (revisión más estricta)
//     * Puedes ser baneado temporalmente
//     * En casos graves: ban permanente
//     * En casos muy graves: denuncia a la policía (por infamia/difamación)
//
// Acumulación de denuncias recibidas:
// -----------------------------------
//   1-2 denuncias: Revisión manual
//   3 denuncias: Advertencia al usuario + revisión
//   5 denuncias: Suspensión temporal (24h) + revisión exhaustiva
//   10+ denuncias: Ban permanente (si se confirman)
//
// Derecho a defensa:
// -----------------
//   - Usuario denunciado SIEMPRE recibe notificación
//   - Puede ver el motivo de la denuncia
//   - Puede responder y explicar su versión
//   - Puede demostrar que es mentira
//   - Moderadores revisan AMBAS versiones
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DIFERENCIA: MP vs CHAT PÚBLICO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// ¿Por qué MP y Chat son tan diferentes?
//
// MENSAJES PRIVADOS (MP):
// ----------------------
// - Es un espacio PRIVADO
// - Nadie tiene obligación de hablar contigo
// - Si envías mensaje sin que te pidan, rompes su privacidad
// - Por eso el mensaje debe ser aceptado
// - Si te bloquean, no puedes protestar (es su derecho)
// - Bloqueo es permanente hasta que la persona desbloquee
// - Razón: Privacidad personal
//
// CHAT PÚBLICO:
// ------------
// - Es un espacio PÚBLICO
// - Si entras, es lógico que todos tienen derecho a hablarte
// - Si no quieres que te hablen, no entres en sala pública
// - NO se puede bloquear individualmente en sala
// - Sistema de denuncia colectivo: 10 denuncias únicas → bloqueo automático
// - Bloqueos temporales: 1h → 10h → 24h (escala)
// - Puedes protestar y explicar al admin
// - Razón: Espacio público compartido
//
// Ejemplo de INFAMIA (denuncia falsa):
// ------------------------------------
// ❌ MAL:
//   1. Juan bloquea a María en MP (su derecho a privacidad)
//   2. María se ofende: "¡Te voy a enseñar, pendejo, a quién vas a bloquear!"
//   3. María denuncia a Juan por "acoso"
//   4. Moderador revisa: Juan solo ejerció su derecho a bloquear
//   5. RESULTADO: María recibe advertencia por infamia
//   6. Si María repite: María es baneada
//
// ✅ BIEN:
//   1. Juan bloquea a María
//   2. María piensa: "Ok, no quiere hablar conmigo"
//   3. María sigue con su vida
//   4. Fin
//
// ⚠️ Frontera legal:
//   - Denunciar falsamente puede ser difamación
//   - En casos graves: la plataforma puede denunciarte a la policía
//   - Cada cosa tiene sus fronteras legales
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📢 SISTEMA DE DENUNCIA EN CHAT PÚBLICO (DIFERENTE A MP)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// ⚠️ NOTA: Esta sección documenta el chat público para comparación.
//    El sistema es COMPLETAMENTE DIFERENTE a MP.
//
// En chat público NO se puede bloquear individualmente:
// ----------------------------------------------------
// - Chat público es espacio compartido
// - Si no cumple reglamento → denuncia colectiva
// - NO puedes bloquear a alguien solo para ti
// - Razón: Si está en sala, todos lo ven o nadie lo ve
//
// Sistema de denuncias colectivas en chat público:
// -----------------------------------------------
//   - Requiere 10 denuncias de USUARIOS ÚNICOS
//   - Es decir: 10 users DIFERENTES denuncian al mismo usuario
//   - Esto activa BLOQUEO AUTOMÁTICO
//
// Efectos del bloqueo en chat público:
// -----------------------------------
//   1. Primera vez (10 denuncias):
//      - Bloqueado por 1 HORA
//      - Puede estar en sala
//      - Puede leer mensajes
//      - NO puede escribir mensajes
//
//   2. Segunda vez (después de 1h, otras 10 denuncias):
//      - Bloqueado por 10 HORAS
//      - Mismo efecto: puede leer, no escribir
//
//   3. Tercera vez (después de 10h, otras 10 denuncias):
//      - Bloqueado por 24 HORAS
//      - Mismo efecto: puede leer, no escribir
//
//   4. Si continúa: revisión manual y posible ban permanente
//
// Derecho a protesta en chat público:
// ----------------------------------
//   ✅ Puedes protestar
//   ✅ Puedes enviar mensaje al admin
//   ✅ Puedes explicar que es mentira
//   ✅ Puedes demostrar que mensajes no eran contra reglas
//   
//   Razón: 10 denuncias son ban automático sin revisión inicial.
//   A veces hay gente maliciosa que hace denuncias falsas en grupo.
//
// Protección contra denuncias maliciosas en chat:
// ----------------------------------------------
//   - Admin revisa el caso cuando protestas
//   - Ve conversación completa
//   - Si denuncias eran falsas:
//     * Usuarios que denunciaron falsamente reciben advertencia
//     * En casos graves: ban a los denunciantes
//   - Si denuncias eran justificadas:
//     * Bloqueo se mantiene o se extiende
//
// ¿Por qué 10 denuncias en chat público?
// -------------------------------------
//   - Para evitar abuso de una sola persona
//   - Requiere consenso de múltiples usuarios
//   - Protege de vendetas personales
//   - Permite respuesta rápida ante problemas reales
//
// RESUMEN: MP vs CHAT PÚBLICO
// ---------------------------
//
// | Aspecto | MP (Privado) | Chat (Público) |
// |---------|--------------|----------------|
// | Bloqueo individual | ✅ Sí | ❌ No |
// | Bloqueo automático | ❌ No | ✅ Sí (10 denuncias) |
// | Derecho a protesta | ❌ No | ✅ Sí |
// | Permanencia bloqueo | Hasta desbloquear | Temporal (1h/10h/24h) |
// | Notificación al denunciado | ✅ Sí | ✅ Sí (pero después) |
// | Revisión humana inicial | ✅ Sí | ❌ No (automático) |
//
// Definiciones:
//   - "NUEVA CONVERSACIÓN": Primer MP a alguien con quien NUNCA hablaste
//   - "CONVERSACIÓN EXISTENTE": Alguien con quien ya intercambiaste mensajes
//
// Ejemplos de NUEVAS CONVERSACIONES (cuentan del límite 10/día):
//   1. Juan escribe a María → Primera vez → Cuenta 1/10
//   2. Juan escribe a Ana → Primera vez → Cuenta 2/10
//   3. Juan escribe a Luis → Primera vez → Cuenta 3/10
//   ... hasta 10 personas diferentes en el día
//
// Ejemplos de CONVERSACIONES EXISTENTES (NO cuentan):
//   - Juan ya habló con María ayer → Hoy le escribe de nuevo → NO cuenta
//   - Juan ya habló con Ana hace 2 días → Hoy le escribe → NO cuenta
//   - María le respondió a Juan → Juan le escribe de nuevo → NO cuenta
//
// REGLA ANTI-SPAM (CRÍTICA):
//   Escenario:
//     1. Juan (Grupo B) envía MP a María (primera vez)
//     2. Sistema crea "invitación de MP" para María
//     3. María ve: "Juan te envió un mensaje"
//     4. María tiene opciones:
//        - Aceptar conversación → Juan puede seguir enviando
//        - Rechazar/Ignorar → Juan NO puede enviar más mensajes
//     5. Si María NO acepta:
//        - Juan ve: "Tu mensaje está pendiente de aceptación"
//        - Juan NO puede enviar otro mensaje a María
//        - Juan debe esperar a que María acepte
//
//   Motivación: Evitar acoso y spam
//
// ⚠️ IMPORTANTE: Esta restricción aplica a TODOS (con y sin PLUS)
//    PLUS NO aumenta el límite de 10 nuevas conversaciones/día
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💎 BENEFICIOS PLUS EN MENSAJES PRIVADOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Usuarios con PLUS tienen:
//   ✅ Doble check (✓✓) en mensajes:
//      - ✓ = Mensaje entregado
//      - ✓✓ = Mensaje leído
//   ✅ Guardar historial completo:
//      - Usuarios normales: historial limitado
//      - PLUS: todo el historial guardado permanentemente
//
// Usuarios sin PLUS:
//   ❌ NO ven estado de entrega/lectura
//   ❌ NO guardan historial completo
//
// ⚠️ IMPORTANTE: PLUS NO aumenta el límite de nuevas conversaciones
//    Sigue siendo 10/día para todos
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 IMPLEMENTACIÓN TÉCNICA (TODO)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// 1. Base de datos:
//    Tabla: conversations
//      - id: uuid
//      - user1_id: uuid
//      - user2_id: uuid
//      - status: 'pending' | 'accepted' | 'rejected'
//      - created_at: timestamp
//      - accepted_at: timestamp | null
//
//    Tabla: messages
//      - id: uuid
//      - conversation_id: uuid (FK)
//      - sender_id: uuid
//      - receiver_id: uuid
//      - content: text
//      - status: 'sent' | 'delivered' | 'read'
//      - created_at: timestamp
//      - read_at: timestamp | null
//
//    Tabla: daily_conversation_limits
//      - id: uuid
//      - user_id: uuid
//      - date: date
//      - new_conversations_count: int (máximo 10)
//
// 2. API Endpoints necesarios:
//    POST /api/messages/send
//      - Validar que sender tiene teléfono verificado (Grupo B)
//      - Si es primera vez con este usuario:
//        * Verificar límite diario (< 10 nuevas conversaciones)
//        * Crear conversación con status: 'pending'
//        * Incrementar daily_conversation_limits.new_conversations_count
//      - Si conversación existe y está 'accepted':
//        * Enviar mensaje directo
//      - Si conversación existe y está 'pending':
//        * Mostrar error: "Tu mensaje está pendiente de aceptación"
//      - Si conversación existe y está 'rejected':
//        * Mostrar error: "Este usuario rechazó tu invitación"
//
//    POST /api/messages/accept-conversation
//      - Actualizar conversations.status = 'accepted'
//      - Actualizar conversations.accepted_at = NOW()
//      - Notificar al sender
//
//    POST /api/messages/reject-conversation
//      - Actualizar conversations.status = 'rejected'
//      - Notificar al sender (opcional)
//
//    GET /api/messages/conversations
//      - Listar todas las conversaciones del usuario
//      - Incluir:
//        * Último mensaje
//        * Contador de no leídos
//        * Estado de la conversación
//
//    GET /api/messages/conversation/:id
//      - Obtener todos los mensajes de una conversación
//      - Marcar como leídos
//      - Si PLUS: incluir status de entrega/lectura
//
// 3. Validaciones del frontend:
//    Antes de abrir modal de "Enviar mensaje":
//      - Verificar si user tiene teléfono verificado
//      - Si NO: Mostrar modal "Verifica tu teléfono para enviar mensajes"
//      - Si SÍ: Continuar
//
//    Al enviar mensaje:
//      - Si es primera vez con este usuario:
//        * Verificar límite diario en el backend
//        * Si alcanzó 10: Mostrar "Has alcanzado el límite de 10 nuevas conversaciones hoy"
//      - Si ya existe conversación 'pending':
//        * Mostrar "Tu mensaje está pendiente de aceptación por [username]"
//      - Si conversación 'rejected':
//        * Mostrar "Este usuario rechazó tu invitación"
//
// 4. UI/UX:
//    Lista de conversaciones:
//      - Separar en pestañas:
//        * "Todas" (todas las conversaciones)
//        * "Pendientes" (esperando aceptación)
//        * "Aceptadas" (conversaciones activas)
//      - Mostrar badge de "Pendiente" en conversaciones sin aceptar
//
//    Vista de conversación:
//      - Si PLUS: Mostrar doble check (✓✓)
//      - Si normal: No mostrar estado
//      - Botón "Aceptar conversación" si es invitación pendiente
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 ESTADÍSTICAS Y ANALÍTICAS (PLUS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Usuarios PLUS pueden ver:
//   - Cuántas conversaciones nuevas iniciaste hoy: X/10
//   - Cuántas invitaciones tienes pendientes
//   - Cuántos mensajes enviados/recibidos esta semana
//   - Tasa de respuesta (% de mensajes que reciben respuesta)
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️ NOTAS IMPORTANTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// 1. PLUS NO aumenta el límite de 10 nuevas conversaciones/día
// 2. La restricción aplica SOLO a NUEVAS conversaciones (primera vez)
// 3. Conversaciones existentes son ILIMITADAS para todos
// 4. Grupo A NO puede iniciar, pero SÍ puede responder ilimitado
// 5. La regla anti-spam es CRÍTICA para evitar acoso
//
// ====================================================================

import { useState } from "react";

export default function PrivateMessagesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mensajes Privados</h1>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-sm text-yellow-700">
          ⚠️ <strong>COMPONENTE EN DESARROLLO</strong><br />
          Lee la documentación completa en los comentarios de este archivo para
          implementar correctamente el sistema de mensajes privados.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Reglas de Mensajes Privados</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Sin verificación de teléfono (Grupo A):
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>❌ No puedes iniciar conversaciones nuevas</li>
              <li>✅ Puedes responder si alguien te escribe</li>
              <li>✅ Conversaciones existentes ilimitadas</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Con teléfono verificado (Grupo B):
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>✅ Puedes iniciar conversaciones nuevas</li>
              <li>⚠️ Máximo 10 nuevas conversaciones por día</li>
              <li>✅ Conversaciones existentes ilimitadas</li>
              <li>⚠️ Si no aceptan tu mensaje, no puedes enviar otro</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Beneficios PLUS:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>✅ Doble check (✓✓ entregado/leído)</li>
              <li>✅ Historial completo guardado</li>
              <li>⚠️ NO aumenta el límite de 10 nuevas conversaciones/día</li>
            </ul>
          </div>
        </div>
      </div>

      {/* TODO: Implementar lista de conversaciones */}
      {/* TODO: Implementar vista de conversación individual */}
      {/* TODO: Implementar modal de aceptar/rechazar invitación */}
      {/* TODO: Implementar contador de nuevas conversaciones del día */}
    </div>
  );
}
