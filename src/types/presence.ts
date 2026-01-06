// ====================================================================
// ESTADOS DE PRESENCIA (Online/Ocupado/Invisible) - DOCUMENTACIÓN
// ====================================================================
//
// Este archivo documenta el sistema de estados de presencia del usuario.
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🟢 ESTADOS DISPONIBLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// 1. 🟢 ONLINE (verde) - Disponible para TODOS
// 2. 🟠 OCUPADO (naranja/amarillo) - Disponible para TODOS
// 3. ⚫ INVISIBLE (gris/sin icono) - Solo PLUS
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🟢 ESTADO: ONLINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Disponible para: TODOS (con y sin PLUS)
//
// Indicador visual:
//   - Punto verde al lado del icono/foto de perfil
//   - En listas de usuarios: "🟢 Online"
//   - En chat: "🟢 Online" debajo del nombre
//
// Comportamiento:
//   - Usuario aparece como conectado en todas partes
//   - Otros usuarios ven que estás disponible
//   - Recibes notificaciones en tiempo real
//   - Tu actividad es visible para otros
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🟠 ESTADO: OCUPADO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Disponible para: TODOS (con y sin PLUS)
//
// Indicador visual:
//   - Punto naranja/amarillo al lado del icono/foto
//   - En listas: "🟠 Ocupado"
//   - En chat: "🟠 Ocupado" debajo del nombre
//
// Comportamiento:
//   - Usuario aparece como ocupado pero conectado
//   - Otros usuarios ven: "Estoy aquí pero no me molesten"
//   - Puedes navegar y escribir normalmente
//   - Te ven como "Ocupado" en todas partes
//   - Recibes notificaciones pero con indicador de ocupado
//
// Significado:
//   - "Estoy conectado pero ocupado con otra cosa"
//   - "Puedo responder pero no inmediatamente"
//   - No es "No molestar" → sigues viendo todo y recibiendo notificaciones
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚫ ESTADO: INVISIBLE (Solo PLUS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Disponible para: Solo usuarios PLUS
//
// Indicador visual:
//   - Símbolo de "no conectado" (punto gris o sin punto)
//   - En listas: "Offline" (aunque estés conectado)
//   - En chat: "Última vez: hace X tiempo" (aunque estés conectado)
//
// Comportamiento:
//   - Usuario aparece como DESCONECTADO para otros
//   - Puedes navegar por todas las páginas sin que te vean
//   - Puedes ver perfiles, álbumes, fotos sin dejar rastro de visita
//   - ⚠️ EXCEPCIÓN 1: Si escribes en CHAT → apareces como "Online"
//   - ⚠️ EXCEPCIÓN 2: Si envías MP → permaneces "Invisible"
//
// Reglas específicas:
//
//   1. Navegación invisible:
//      - Visitas perfiles → NO se registra tu visita
//      - Ves álbumes → NO apareces en lista de visitantes
//      - Ves fotos → NO apareces en estadísticas
//
//   2. En CHAT (salas públicas):
//      - Si escribes un mensaje → ⚠️ apareces como "Online"
//      - Tu estado cambia automáticamente a "🟢 Online"
//      - Otros ven: "[Tu nombre] se conectó"
//      - Razón: No puedes escribir en público y seguir invisible
//
//   3. En MENSAJES PRIVADOS (MP):
//      - Si envías MP → ⚠️ permaneces "Invisible"
//      - El destinatario ve tu mensaje pero tú sigues "Offline"
//      - Puedes tener conversaciones privadas sin aparecer conectado
//      - Razón: Privacidad en conversaciones 1-a-1
//
//   4. Usuarios sin PLUS:
//      - ❌ NO pueden activar modo invisible
//      - Si intentan activarlo → Modal: "Necesitas PLUS"
//      - Botón deshabilitado con tooltip explicativo
//
// Motivación del modo invisible:
//   - Privacidad total al navegar
//   - Ver perfiles sin que sepan que visitaste
//   - Revisar mensajes sin presión de responder
//   - Navegar sin interrupciones
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎮 IMPLEMENTACIÓN TÉCNICA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// 1. UI en "Mi Espacio" (Dashboard):
//
//    Opción A: Tres botones (recomendado)
//    -------------------------------------
//    [🟢 Online] [🟠 Ocupado] [⚫ Invisible]
//
//    - Botones tipo "radio" (solo uno activo)
//    - Click cambia el estado
//    - Indicador visual del estado activo (border o background)
//    - Botón "Invisible" deshabilitado si NO tiene PLUS
//
//    Opción B: Slider/Toggle
//    -----------------------
//    Estado: [Online ▼]
//    Dropdown con opciones:
//      - 🟢 Online
//      - 🟠 Ocupado
//      - ⚫ Invisible (PLUS) [con badge "PLUS"]
//
//    Opción C: Switch con opciones
//    -----------------------------
//    Toggle principal: [ON/OFF]
//    Si ON: [🟢 Online] o [🟠 Ocupado]
//    Si tiene PLUS: Checkbox "Modo invisible"
//
// 2. Base de datos:
//
//    Tabla: users
//      - presence_status: 'online' | 'busy' | 'invisible' | 'offline'
//      - last_seen: timestamp
//      - is_plus: boolean
//
//    Tabla: activity_log
//      - id: uuid
//      - user_id: uuid
//      - action: 'visit_profile' | 'visit_album' | 'view_photo' | 'send_message'
//      - target_user_id: uuid | null
//      - target_id: uuid | null
//      - was_invisible: boolean
//      - created_at: timestamp
//
//    ⚠️ IMPORTANTE: Si was_invisible = true → NO mostrar en listas de visitantes
//
// 3. API Endpoints:
//
//    PATCH /api/user/presence
//    Body: { status: 'online' | 'busy' | 'invisible' }
//    - Validar si status === 'invisible':
//      * Verificar que user tiene PLUS activo
//      * Si NO: Responder { error: "Necesitas PLUS" }
//    - Actualizar users.presence_status
//    - Actualizar users.last_seen = NOW()
//    - Broadcast a otros usuarios conectados (WebSocket)
//    - Responder: { success: true, status: 'invisible' }
//
//    GET /api/user/presence/:userId
//    - Si user está en modo invisible:
//      * Responder: { status: 'offline', last_seen: [hace X tiempo] }
//    - Si user está online/busy:
//      * Responder: { status: 'online' | 'busy', last_seen: NOW() }
//
//    POST /api/chat/send-message
//    Body: { room_id, message }
//    - Si user.presence_status === 'invisible':
//      * Actualizar users.presence_status = 'online'
//      * Broadcast cambio de estado
//      * Razón: Escribir en chat público rompe invisibilidad
//    - Enviar mensaje normalmente
//
//    POST /api/messages/send
//    Body: { receiver_id, message }
//    - Si user.presence_status === 'invisible':
//      * NO cambiar estado (mantener invisible)
//      * Razón: MP son privados, mantener invisibilidad
//    - Enviar mensaje normalmente
//    - Destinatario ve mensaje pero sender aparece "Offline"
//
// 4. WebSocket/Real-time:
//
//    Eventos a emitir:
//      - presence:change
//        { user_id, status: 'online' | 'busy' | 'invisible' | 'offline' }
//
//      - presence:typing
//        { user_id, conversation_id, is_typing: true | false }
//        ⚠️ Si user está invisible en MP → emitir igual (solo al destinatario)
//        ⚠️ Si user está invisible en chat → NO emitir
//
// 5. Frontend - Reglas de visualización:
//
//    Indicador de presencia junto al nombre:
//      - Si status === 'online': 🟢 (verde)
//      - Si status === 'busy': 🟠 (naranja)
//      - Si status === 'invisible' Y no eres tú: ⚫ o sin icono
//      - Si status === 'invisible' Y eres tú: ⚫ con texto "(Tú: Invisible)"
//      - Si status === 'offline': ⚪ o gris
//
//    En lista de usuarios conectados:
//      - Usuarios con 'invisible' NO aparecen en la lista
//      - Solo aparecen 'online' y 'busy'
//
//    En chat de sala:
//      - Si user escribe mensaje estando 'invisible':
//        * Mostrar animación de "se conectó"
//        * Cambiar icono a 🟢
//        * Actualizar lista de conectados
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 CASOS DE USO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Caso 1: Usuario normal navegando
// --------------------------------
// 1. María (sin PLUS) entra a la app
// 2. Ve tres botones: [Online] [Ocupado] [Invisible 🔒]
// 3. Por defecto está en "Online"
// 4. Puede cambiar a "Ocupado" → todos la ven ocupada
// 5. Si intenta "Invisible" → Modal: "Necesitas PLUS"
//
// Caso 2: Usuario PLUS navegando invisible
// ----------------------------------------
// 1. Juan (con PLUS) activa "Invisible"
// 2. Visita perfiles de María, Ana, Luis
// 3. Ninguna de ellas ve que Juan visitó su perfil
// 4. Juan ve todo normalmente
// 5. Juan envía MP a María → María recibe mensaje pero Juan aparece "Offline"
// 6. Juan entra a una sala de chat
// 7. Juan escribe "Hola" → ⚠️ automáticamente cambia a "Online"
// 8. Todos en la sala ven: "Juan se conectó"
//
// Caso 3: Usuario ocupado
// ----------------------
// 1. Ana cambia a "Ocupado"
// 2. Navega normalmente
// 3. Otros usuarios ven: "🟠 Ana (Ocupado)"
// 4. Ana puede escribir en chat → sigue como "Ocupado"
// 5. Ana puede enviar MP → sigue como "Ocupado"
// 6. Estado "Ocupado" no afecta visibilidad
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️ NOTAS IMPORTANTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// 1. Modo Invisible es EXCLUSIVO para PLUS
// 2. Escribir en chat público ROMPE la invisibilidad
// 3. Enviar MP mantiene la invisibilidad
// 4. Modo Ocupado NO oculta tu actividad, solo indica estado
// 5. Usuarios invisibles NO aparecen en listas de conectados
// 6. Visitas en modo invisible NO se registran
// 7. El estado se puede cambiar en cualquier momento desde Mi Espacio
// 8. El estado se sincroniza en tiempo real (WebSocket)
//
// ====================================================================

export type PresenceStatus = 'online' | 'busy' | 'invisible' | 'offline';

export interface PresenceState {
  user_id: string;
  status: PresenceStatus;
  last_seen: Date;
  is_plus: boolean;
}

// TODO: Implementar componente PresenceSelector en Dashboard
// TODO: Implementar API de cambio de estado
// TODO: Implementar WebSocket para sincronización en tiempo real
// TODO: Implementar lógica de cambio automático al escribir en chat
