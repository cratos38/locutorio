# 📸 Guía: Requisitos de Fotos de Perfil

## 🎯 Sistema de Validación por Tipo de Foto

### **Foto Principal (obligatoria para verificación)**
Tu foto principal es la que aparece en búsqueda y debe verificar tu identidad.

**Requisitos ESTRICTOS:**
- ✅ **Tu rostro debe ocupar al menos 30% de la imagen** (primer plano)
- ✅ Un solo rostro visible
- ✅ Foto clara y nítida (mínimo 400×400 px)
- ✅ Sin gafas de sol oscuras
- ✅ Sin texto, logos o marcas de agua
- ✅ El sexo detectado coincide con tu perfil
- ✅ La edad aparente es similar a tu edad real (±15 años)

### **Fotos Adicionales (opcionales para tu galería)**
Puedes agregar más fotos a tu galería de perfil con requisitos más flexibles.

**Requisitos RELAJADOS:**
- ✅ **Rostro visible al menos 10%** (puedes mostrar cuerpo completo)
- ✅ Un solo rostro visible
- ✅ Sin contenido explícito (validación NSFW)
- ⚠️ Si rostro < 20%: Revisión manual del admin

---

## ✅ Ejemplos ACEPTADOS

### Foto Principal (verificación):
```
┌─────────────────┐
│                 │
│      👤         │  ← Rostro 30-60% ✅
│    (◕‿◕)        │
│                 │
│                 │
└─────────────────┘
```
**Resultado:** ✅ **AUTO-APROBADA**

### Fotos Adicionales (galería):
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│      👤         │  │       ·         │  │                 │
│    (◕‿◕)        │  │       |         │  │     👤          │
│                 │  │      / \        │  │   (◕‿◕)         │
│                 │  │                 │  │     |           │
└─────────────────┘  └─────────────────┘  └─────────────────┘
   Primer plano         Cuerpo completo      Medio cuerpo
   ✅ Aprobada          ⚠️ Revisión manual    ✅ Aprobada
   Rostro 40%           Rostro 12%           Rostro 25%
```

---

## ❌ Fotos que serán RECHAZADAS automáticamente:

### 1. Foto de cuerpo completo (rostro muy pequeño)
```
┌─────────────────┐
│       ·         │  ← Rostro muy pequeño (solo 5%)
│       |         │
│      / \        │
│                 │
│                 │
└─────────────────┘
```
**Motivo:** "El rostro es muy pequeño (debe ocupar al menos 30%)"

### 2. Fotos grupales (más de 1 persona)
**Motivo:** "Se detectaron 2+ personas (debe haber solo 1)"

### 3. Sin rostro visible
**Motivo:** "No se detectó ningún rostro en la imagen"

### 4. Con gafas de sol oscuras
**Motivo:** "No se puede verificar tu identidad"

### 5. Con texto o logos visibles
**Motivo:** "La foto contiene texto o marcas de agua"

### 6. Baja calidad (borrosa, muy pequeña)
**Motivo:** "Calidad de imagen muy baja"

### 7. Sexo no coincide
**Motivo:** "El sexo detectado no coincide con tu perfil"

### 8. Edad muy diferente
**Motivo:** "Gran diferencia de edad detectada" → Revisión manual

---

## 🟣 Fotos que requieren REVISIÓN MANUAL:

- Confianza baja en detección de sexo (< 70%)
- Diferencia de edad mayor a 15 años
- Foto en límite de calidad

Un administrador revisará y aprobará/rechazará manualmente.

---

## 💡 CONSEJOS PARA UNA BUENA FOTO:

1. **Usa el modo retrato o selfie** de tu cámara
2. **Buena iluminación** (natural es mejor)
3. **Fondo simple** (sin distracciones)
4. **Mira a la cámara** de frente
5. **Expresión natural** (sonríe si quieres)
6. **Sin filtros exagerados** o efectos
7. **Ropa apropiada** (no contenido explícito)

---

## ⏱️ Tiempo de validación:

- La validación automática tarda **2-5 segundos**
- Recibirás notificación del resultado
- Si es rechazada, puedes subir otra foto
- Si requiere revisión manual, espera aprox. **24 horas**

---

## ❓ ¿Por qué estos requisitos?

Para mantener un sitio seguro y auténtico:
- ✅ Verificar que eres una persona real
- ✅ Prevenir perfiles falsos con fotos de celebridades
- ✅ Asegurar que la foto coincida con tu perfil
- ✅ Crear una comunidad confiable

---

## 📝 Ejemplo de comparación:

| Foto | Rostro % | Resultado |
|------|----------|-----------|
| Selfie primer plano | 40-60% | ✅ APROBADA |
| Retrato medio | 30-40% | ✅ APROBADA |
| Foto de medio cuerpo | 20-30% | ⚠️ Límite |
| Foto de cuerpo completo | 5-15% | ❌ RECHAZADA |
| Foto grupal | Variable | ❌ RECHAZADA |

---

**¿Dudas?** Contacta a soporte o revisa tu resultado en el panel de perfil.
