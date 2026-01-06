# 🗂️ DECISIONES Y FLUJOS COMPLETOS - LoCuToRiO

**Fecha:** 2026-01-06  
**Fuente:** Conversación completa de desarrollo  
**Estado:** En construcción - Leyendo conversación de ayer

---

## 📋 ÍNDICE DE TEMAS DISCUTIDOS

### ✅ Ya documentado en código:
- [x] Flujo de registro (create-profile)
- [x] Verificación de email con código de 6 dígitos
- [x] Modal de verificación que bloquea app
- [x] Requisitos de contraseña (8 caracteres)

### ⏳ Pendiente de documentar:
- [ ] Verificación de teléfono (WhatsApp/Telegram)
- [ ] Verificación de perfil con ID
- [ ] Sistema PLUS (beneficios, restricciones)
- [ ] Álbumes de fotos (reglas, privacidad)
- [ ] Sistema de comentarios en fotos (públicos/privados)
- [ ] Sistema de visitas a fotos/perfiles
- [ ] Creación de salas de chat (TEMPORAL vs PERMANENTE)
- [ ] Restricciones si NO hay verificación de teléfono
- [ ] Sistema de verificación de apodo único en tiempo real ✅ (ya implementado parcialmente)
- [ ] Links que requieren estar logeado vs públicos
- [ ] Inicio de sesión: ¿logeado en landing o no?
- [ ] [MÁS TEMAS A DESCUBRIR AL LEER]

---

## 🔍 LEYENDO CONVERSACIÓN - EXTRAYENDO INFORMACIÓN...

[Comenzando lectura de conversación de ayer...]

---

## 1. SISTEMA DE VERIFICACIÓN DE APODO ÚNICO

### Estado actual:
- ✅ Ya implementado parcialmente en `create-profile/page.tsx` (líneas 562-577)
- Verifica en tiempo real después de 500ms de dejar de escribir
- Muestra: ✓ disponible | ! ya en uso | spinner verificando

### Pendiente:
- [ ] Crear API endpoint: `GET /api/check-username?username=XXX`
- [ ] Respuesta: `{ available: true/false, suggestions?: string[] }`

---

## 2. VERIFICACIÓN DE TELÉFONO

[Pendiente de extraer de conversación...]

---

## 3. VERIFICACIÓN DE PERFIL CON ID

[Pendiente de extraer de conversación...]

---

## 4. SISTEMA PLUS

[Pendiente de extraer de conversación...]

---

## 5. ÁLBUMES Y FOTOS

[Pendiente de extraer de conversación...]

---

## 6. SISTEMA DE COMENTARIOS

[Pendiente de extraer de conversación...]

---

## 7. SISTEMA DE VISITAS

[Pendiente de extraer de conversación...]

---

## 8. SALAS DE CHAT

[Pendiente de extraer de conversación...]

---

## 9. RESTRICCIONES POR FALTA DE VERIFICACIÓN

[Pendiente de extraer de conversación...]

---

## 10. LINKS PÚBLICOS VS LOGEADOS

[Pendiente de extraer de conversación...]

---

[CONTINUARÁ DESPUÉS DE LEER TODA LA CONVERSACIÓN...]
