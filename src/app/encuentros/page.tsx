"use client";

// ====================================================================
// ENCUENTROS (INVITACIONES "TOMAR CAFÉ") - DOCUMENTACIÓN COMPLETA
// ====================================================================
//
// Este componente maneja el sistema de ENCUENTROS (invitaciones a "tomar café")
// entre usuarios. Es similar a un sistema de "swipe" tipo Tinder, pero con
// restricciones específicas según verificación y PLUS.
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👥 GRUPOS DE USUARIOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// GRUPO A: Usuarios SIN PLUS
//   - Sin verificación de teléfono, O
//   - Con teléfono verificado pero sin PLUS
//
// GRUPO B: Usuarios CON PLUS
//   - Teléfono verificado Y suscripción PLUS activa
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚫 GRUPO A: SIN PLUS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Restricciones:
//   ❌ NO puede ver invitaciones a "tomar café"
//   ❌ NO puede enviar invitaciones
//   ✅ Recibe NOTIFICACIÓN: "5 usuarios te invitan a tomar café"
//   ❌ NO puede ver quiénes son esos usuarios
//   ❌ NO puede responder a las invitaciones
//
// Experiencia del usuario (Grupo A):
//   1. Usuario ve el icono de notificaciones
//   2. Aparece badge: "5" en rojo
//   3. Al hacer clic:
//      - Mensaje: "5 usuarios te invitan a tomar café"
//      - Texto: "Actualiza a PLUS para ver quién te invitó"
//      - Botón: "Ver planes PLUS"
//      - Botón: "Cerrar"
//   4. Usuario NO ve fotos, nombres ni fechas de quienes invitaron
//
// Motivación:
//   - Incentivar la suscripción PLUS
//   - Mantener la privacidad de quien invita
//   - Reducir spam de invitaciones
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ GRUPO B: CON PLUS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Permisos:
//   ✅ Ve quién le invitó (foto, nombre, fecha)
//   ✅ Puede responder a invitaciones
//   ✅ Puede enviar invitaciones ILIMITADAS
//
// Experiencia del usuario (Grupo B):
//   1. Usuario ve el icono de notificaciones
//   2. Aparece badge: "5" en rojo
//   3. Al hacer clic:
//      - Lista completa de invitaciones:
//        * Foto de perfil del usuario
//        * Nombre/nick del usuario
//        * Fecha de la invitación (ej: "Hace 2 horas")
//        * Botón: "Aceptar"
//        * Botón: "Rechazar"
//   4. Si acepta:
//      - Se crea conversación privada
//      - Ambos reciben notificación
//      - Se abre chat directo
//   5. Si rechaza:
//      - Invitación desaparece
//      - Quien invitó NO recibe notificación de rechazo
//
// Enviar invitaciones (SOLO PLUS):
//   ⚠️ IMPORTANTE: Solo usuarios PLUS pueden ENVIAR invitaciones
//   
//   1. Usuario navega por perfiles
//   2. Ve botón "☕ Invitar a tomar café"
//   3. Si NO tiene PLUS:
//      - Botón deshabilitado o con badge "PLUS"
//      - Click → Modal: "Necesitas PLUS para enviar invitaciones"
//   4. Si tiene PLUS:
//      - Click en botón → envía invitación
//      - NO hay límite de invitaciones por día (ILIMITADAS)
//   5. Usuario que recibe:
//      - Si es PLUS: ve la invitación completa (foto, nombre, fecha)
//      - Si NO es PLUS: solo ve notificación con número ("5 usuarios te invitan")
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ❤️ SISTEMA DE LIKES (DIFERENTE A ENCUENTROS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// ⚠️ IMPORTANTE: LIKES ≠ ENCUENTROS
//
// LIKES:
//   - ✅ TOTALMENTE ANÓNIMOS (para TODOS, con y sin PLUS)
//   - ✅ Solo se muestra el número: "❤️ 15"
//   - ✅ Al pulsar el número → se anula y solo ves los de ese día
//   - ✅ En estadísticas completas: número total acumulado
//   - ✅ Notificación: "Obtuviste un like en perfil" o "en foto"
//   - ❌ NUNCA se muestra quién dio el like (ni con PLUS)
//
// ENCUENTROS (invitaciones "tomar café"):
//   - ❌ NO son anónimos (PLUS los ve con foto y nombre)
//   - ✅ Son invitaciones explícitas a iniciar conversación
//   - ✅ Requieren respuesta (aceptar/rechazar)
//   - ✅ Al aceptar, se crea chat privado
//
// Ejemplo:
//   - María le da LIKE a Juan → Juan ve: "Obtuviste un like" (anónimo)
//   - María invita a Juan a tomar café → Juan (si es PLUS) ve: "María te invitó"
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 IMPLEMENTACIÓN TÉCNICA (TODO)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// 1. Base de datos:
//
//    Tabla: encuentros
//      - id: uuid
//      - sender_id: uuid (quien invita)
//      - receiver_id: uuid (quien recibe)
//      - status: 'pending' | 'accepted' | 'rejected'
//      - created_at: timestamp
//      - responded_at: timestamp | null
//
//    Tabla: likes
//      - id: uuid
//      - sender_id: uuid (quien da like)
//      - receiver_id: uuid (quien recibe)
//      - target_type: 'profile' | 'photo'
//      - target_id: uuid | null (photo_id si es foto)
//      - created_at: timestamp
//
// 2. API Endpoints necesarios:
//
//    POST /api/encuentros/send
//      Body: { receiver_id: uuid }
//      - Validar que sender tiene PLUS activo
//      - Si NO tiene PLUS:
//        * Responder: { error: "Necesitas PLUS para enviar invitaciones" }
//      - Si tiene PLUS:
//        * Verificar que no haya invitación duplicada (mismo sender/receiver)
//        * Crear registro en tabla encuentros con status: 'pending'
//        * Si receiver tiene PLUS:
//          → Enviar notificación push: "María te invitó a tomar café"
//        * Si receiver NO tiene PLUS:
//          → Incrementar contador de notificaciones
//        * Responder: { success: true }
//
//    GET /api/encuentros/received
//      - Validar que user tiene PLUS activo
//      - Si NO tiene PLUS:
//        * Contar invitaciones pendientes
//        * Responder: { count: 5, can_view: false }
//      - Si tiene PLUS:
//        * Obtener todas las invitaciones pendientes
//        * Para cada invitación, incluir:
//          - sender.id
//          - sender.nick
//          - sender.profile_photo_url
//          - created_at
//          - status
//        * Responder: { invitations: [...], can_view: true }
//
//    POST /api/encuentros/respond
//      Body: { invitation_id: uuid, action: 'accept' | 'reject' }
//      - Validar que user tiene PLUS activo
//      - Si NO tiene PLUS:
//        * Responder: { error: "Necesitas PLUS para responder invitaciones" }
//      - Si action === 'accept':
//        * Actualizar encuentros.status = 'accepted'
//        * Actualizar encuentros.responded_at = NOW()
//        * Crear conversación privada entre sender y receiver
//        * Notificar a sender: "María aceptó tu invitación"
//        * Responder: { success: true, conversation_id: uuid }
//      - Si action === 'reject':
//        * Actualizar encuentros.status = 'rejected'
//        * Actualizar encuentros.responded_at = NOW()
//        * NO notificar a sender (privacidad)
//        * Responder: { success: true }
//
//    POST /api/likes/send
//      Body: { receiver_id: uuid, target_type: 'profile' | 'photo', target_id: uuid | null }
//      - ✅ TODOS pueden dar likes (con y sin PLUS)
//      - Verificar que no haya like duplicado (mismo sender/receiver/target)
//      - Crear registro en tabla likes
//      - Incrementar contador de likes del target
//      - Notificar a receiver: "Obtuviste un like en [perfil/foto]"
//      - ❌ NO incluir información de quién dio el like
//      - Responder: { success: true }
//
// 3. Validaciones del frontend:
//
//    Botón "Invitar a tomar café":
//      - Verificar si user tiene PLUS activo
//      - Si NO: Mostrar modal "Necesitas PLUS para enviar invitaciones"
//      - Si SÍ: Enviar invitación
//
//    Icono de notificaciones (campana):
//      - Mostrar badge con número de invitaciones pendientes
//      - Al hacer clic:
//        * Si user NO tiene PLUS:
//          → Mostrar: "5 usuarios te invitan a tomar café"
//          → Botón: "Ver planes PLUS"
//        * Si user tiene PLUS:
//          → Mostrar lista completa de invitaciones
//          → Para cada invitación:
//            - Foto, nombre, fecha
//            - Botones: "Aceptar" / "Rechazar"
//
//    Botón de Likes (❤️):
//      - ✅ Disponible para TODOS
//      - Al hacer clic:
//        * Enviar like
//        * Cambiar icono a corazón lleno
//        * Mostrar: "Like enviado"
//        * ❌ NO mostrar a quién diste like
//
// 4. UI/UX:
//
//    Página de Encuentros (/encuentros):
//      - Si NO tiene PLUS:
//        * Mostrar mensaje: "Actualiza a PLUS para usar Encuentros"
//        * Botón: "Ver planes PLUS"
//        * NO mostrar perfiles ni invitaciones
//
//      - Si tiene PLUS:
//        * Pestaña "Invitaciones recibidas":
//          → Lista de usuarios que te invitaron
//          → Para cada uno: foto, nombre, fecha, botones
//        * Pestaña "Invitaciones enviadas":
//          → Lista de usuarios a los que invitaste
//          → Estado: pendiente / aceptada / rechazada (sin mostrar si rechazaron)
//        * Pestaña "Buscar usuarios":
//          → Carrusel de perfiles (tipo Tinder)
//          → Botón "☕ Invitar a tomar café"
//          → Botón "❤️ Me gusta"
//          → Botón "Siguiente"
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 ESTADÍSTICAS Y ANALÍTICAS (PLUS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Usuarios PLUS pueden ver:
//   - Cuántas invitaciones enviaste esta semana
//   - Cuántas invitaciones recibiste
//   - Tasa de aceptación (% de invitaciones aceptadas)
//   - Cuántos likes enviaste
//   - Cuántos likes recibiste (SOLO NÚMERO, sin nombres)
//
// Usuarios sin PLUS:
//   - Solo ven: "X usuarios te invitan" (número)
//   - Solo ven: "❤️ X" en sus fotos/perfil (número)
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️ NOTAS IMPORTANTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// 1. ENCUENTROS y LIKES son dos sistemas DIFERENTES y separados
// 2. LIKES son SIEMPRE ANÓNIMOS (ni con PLUS se ve quién dio like)
// 3. ENCUENTROS son VISIBLES para PLUS (con foto, nombre y fecha)
// 4. Sin PLUS: solo ves NÚMERO de invitaciones, no quiénes son
// 5. Enviar invitaciones a tomar café es ILIMITADO para PLUS
// 6. Dar LIKES es ILIMITADO para TODOS
// 7. NO hay límite diario de invitaciones para PLUS
// 8. Si rechazas invitación, quien invitó NO recibe notificación
//
// ====================================================================

import { useState } from "react";

export default function EncuentrosPage() {
  const [userHasPlus, setUserHasPlus] = useState(false); // TODO: Obtener del contexto de usuario

  if (!userHasPlus) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Encuentros</h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            ☕ Actualiza a PLUS para usar Encuentros
          </h2>
          <p className="text-blue-700 mb-4">
            Con PLUS podrás ver quién te invitó a tomar café, responder invitaciones
            y enviar invitaciones ilimitadas a otros usuarios.
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Ver planes PLUS
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-2">
            Tienes invitaciones pendientes
          </h3>
          <p className="text-gray-600 mb-4">
            <span className="text-2xl font-bold text-gray-900">5</span> usuarios
            te invitan a tomar café
          </p>
          <p className="text-sm text-gray-500">
            Actualiza a PLUS para ver quiénes son y responder a sus invitaciones
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Encuentros</h1>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-sm text-yellow-700">
          ⚠️ <strong>COMPONENTE EN DESARROLLO</strong><br />
          Lee la documentación completa en los comentarios de este archivo para
          implementar correctamente el sistema de encuentros.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Sistema de Encuentros</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Sin PLUS (Grupo A):
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>❌ No puedes ver invitaciones (solo número)</li>
              <li>❌ No puedes enviar invitaciones</li>
              <li>✅ Recibes notificación: "X usuarios te invitan"</li>
              <li>❌ No puedes responder</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Con PLUS (Grupo B):
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>✅ Ves quién te invitó (foto, nombre, fecha)</li>
              <li>✅ Puedes responder (aceptar/rechazar)</li>
              <li>✅ Puedes enviar invitaciones ILIMITADAS</li>
              <li>✅ Al aceptar, se crea chat privado automático</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              Likes (❤️) - Para TODOS:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>✅ TOTALMENTE ANÓNIMOS (con y sin PLUS)</li>
              <li>✅ Solo se muestra el número</li>
              <li>✅ Notificación: "Obtuviste un like"</li>
              <li>❌ NUNCA se muestra quién dio el like</li>
            </ul>
          </div>
        </div>
      </div>

      {/* TODO: Implementar pestañas: Recibidas / Enviadas / Buscar */}
      {/* TODO: Implementar lista de invitaciones recibidas */}
      {/* TODO: Implementar lista de invitaciones enviadas */}
      {/* TODO: Implementar carrusel de perfiles tipo Tinder */}
    </div>
  );
}
