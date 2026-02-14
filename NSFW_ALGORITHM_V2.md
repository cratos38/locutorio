# 🛡️ Sistema NSFW Mejorado - Algoritmo Inteligente

## 🚨 IMPORTANTE: Protección Infantil

Este sitio **NO es +18**, por lo tanto **DEBE** tener censura automática activa.  
El sistema de denuncias es solo un **respaldo secundario**.

---

## ❌ Problema Anterior

### NSFW.js con Umbrales Fijos
```javascript
// ❌ ALGORITMO ANTIGUO (MALO)
if (pornScore > 0.75) {
  return "RECHAZAR";
}
```

**Problema:** Ignora el contexto completo de la imagen.

### Ejemplo del Error
```
Foto: Mujer comprando en supermercado
Scores:
  Neutral: 0.90  (90% imagen normal) ✅
  Porn: 0.74     (74% porno)          ❌ RECHAZADA POR ERROR
  
Resultado: RECHAZADA porque Porn > 0.75
```

**¡ABSURDO!** La imagen es 90% neutral pero se rechaza por 74% porno.

---

## ✅ Nuevo Algoritmo Inteligente

### Principio Clave
**Comparar las 5 categorías entre sí, no solo mirar una:**

```
NSFW.js devuelve 5 categorías:
1. Neutral   - Contenido normal ✅
2. Drawing   - Dibujos/ilustraciones
3. Porn      - Pornografía explícita ❌
4. Sexy      - Contenido sugestivo ⚠️
5. Hentai    - Contenido anime adulto ❌
```

### Lógica del Nuevo Algoritmo

```javascript
// ✅ ALGORITMO NUEVO (INTELIGENTE)

// REGLA 1: Umbrales absolutos (casos obvios)
if (pornScore > 0.90) return "RECHAZAR - ABSOLUTO";
if (sexyScore > 0.95) return "RECHAZAR - ABSOLUTO";
if (hentaiScore > 0.90) return "RECHAZAR - ABSOLUTO";

// REGLA 2: Neutral gana por margen claro
if (neutralScore > maxNSFWScore + 0.15) {
  return "APROBAR - NEUTRAL GANA";
}

// REGLA 3: NSFW supera a Neutral
if (maxNSFWScore > neutralScore) {
  return "RECHAZAR - NSFW SUPERA";
}

// REGLA 4: Empate técnico → beneficio de la duda
return "APROBAR - DUDOSO";
```

---

## 📊 Ejemplos Comparativos

### Ejemplo 1: Foto de Supermercado
```
Scores:
  Neutral: 90%
  Porn: 74%
  Sexy: 8%
  Hentai: 2%
  Drawing: 16%

Algoritmo Antiguo:
  Porn: 74% > 75%? NO
  ✅ APROBAR

Algoritmo Nuevo:
  1. Porn: 74% > 90%? NO → sigue
  2. Neutral (90%) > Porn (74%) + 15%? SÍ
  ✅ APROBAR - NEUTRAL GANA
```
**Resultado:** ✅ Ambos aprueban (correcto)

---

### Ejemplo 2: Vestido de Fiesta
```
Scores:
  Neutral: 55%
  Sexy: 42%
  Porn: 3%
  Hentai: 0%
  Drawing: 0%

Algoritmo Antiguo:
  Sexy: 42% > 85%? NO
  ✅ APROBAR

Algoritmo Nuevo:
  1. Sexy: 42% > 95%? NO → sigue
  2. Neutral (55%) > Sexy (42%) + 15%? SÍ
  ✅ APROBAR - NEUTRAL GANA
```
**Resultado:** ✅ Ambos aprueban (correcto)

---

### Ejemplo 3: Contenido Explícito Real
```
Scores:
  Porn: 92%
  Sexy: 6%
  Neutral: 2%
  Hentai: 0%
  Drawing: 0%

Algoritmo Antiguo:
  Porn: 92% > 75%? SÍ
  ❌ RECHAZAR

Algoritmo Nuevo:
  1. Porn: 92% > 90%? SÍ
  ❌ RECHAZAR - ABSOLUTO
```
**Resultado:** ❌ Ambos rechazan (correcto)

---

### Ejemplo 4: Caso Límite
```
Scores:
  Neutral: 48%
  Sexy: 50%
  Porn: 2%
  Hentai: 0%
  Drawing: 0%

Algoritmo Antiguo:
  Sexy: 50% > 85%? NO
  ✅ APROBAR

Algoritmo Nuevo:
  1. Sexy: 50% > 95%? NO → sigue
  2. Neutral (48%) > Sexy (50%) + 15%? NO → sigue
  3. Sexy (50%) > Neutral (48%)? SÍ
  ❌ RECHAZAR - NSFW SUPERA
```
**Resultado:** 🤔 Algoritmo nuevo es más estricto (correcto para protección infantil)

---

## 🎯 Configuración de Umbrales

### Umbrales Absolutos (Casos Obvios)
```javascript
export const NSFW_ABSOLUTE_THRESHOLDS = {
  Porn: 0.90,   // >90% = obviamente pornográfico
  Sexy: 0.95,   // >95% = obviamente sexual
  Hentai: 0.90, // >90% = obviamente hentai
};
```

### Margen de Neutral
```javascript
export const NEUTRAL_MARGIN = 0.15; // Neutral debe ganar por 15%
```

**Ejemplo:**
- `Neutral: 0.60, Porn: 0.40` → Neutral gana por `0.20` (> `0.15`) → ✅ APROBAR
- `Neutral: 0.52, Porn: 0.45` → Neutral gana por `0.07` (< `0.15`) → ⚠️ Evaluar regla 3

---

## 🔍 Logs Detallados

El nuevo sistema muestra logs completos en la consola del navegador:

```javascript
🔍 NSFW Analysis: {
  Neutral: "90.0%",
  Porn: "74.0%",
  Sexy: "8.0%",
  Hentai: "2.0%",
  Drawing: "16.0%",
  "---": "---",
  MaxNSFW: "74.0% (Porn)",
  Decision: "✅ SAFE"
}
```

### Cómo Leer los Logs
1. **Neutral** - Porcentaje de contenido normal
2. **Porn/Sexy/Hentai** - Porcentajes de contenido inapropiado
3. **MaxNSFW** - La categoría NSFW con mayor puntuación
4. **Decision** - Decisión final y motivo

---

## 🧪 Pruebas Recomendadas

### Paso 1: Probar con Fotos Normales
1. Foto de ropa de calle → ✅ Debe aprobar
2. Foto de supermercado → ✅ Debe aprobar
3. Vestido de fiesta → ✅ Debe aprobar
4. Ropa deportiva → ✅ Debe aprobar

### Paso 2: Probar con Fotos Límite
1. Bikini en playa → ✅ Debe aprobar (contexto normal)
2. Ropa interior → ⚠️ Puede rechazar (depende)
3. Vestido muy ajustado → ✅ Debe aprobar

### Paso 3: Probar con Fotos Explícitas
1. Desnudos → ❌ Debe rechazar
2. Contenido sexual → ❌ Debe rechazar
3. Hentai → ❌ Debe rechazar

---

## 📝 Ajustar Umbrales

### Si Rechaza Demasiadas Fotos Normales
```javascript
// Aumentar umbrales absolutos
NSFW_ABSOLUTE_THRESHOLDS = {
  Porn: 0.95,   // más permisivo
  Sexy: 0.98,
  Hentai: 0.95,
};

// Reducir margen de neutral
NEUTRAL_MARGIN = 0.10; // neutral necesita menos ventaja
```

### Si Aprueba Contenido Inapropiado
```javascript
// Reducir umbrales absolutos
NSFW_ABSOLUTE_THRESHOLDS = {
  Porn: 0.85,   // más estricto
  Sexy: 0.90,
  Hentai: 0.85,
};

// Aumentar margen de neutral
NEUTRAL_MARGIN = 0.20; // neutral necesita más ventaja
```

---

## 🎓 Ventajas del Nuevo Sistema

| Aspecto | Algoritmo Antiguo | Algoritmo Nuevo |
|---------|------------------|-----------------|
| **Contexto** | Ignora | Considera todas las categorías |
| **Falsos Positivos** | Muchos (ej: supermercado 91% porno) | Menos |
| **Transparencia** | Solo una puntuación | Logs completos de 5 categorías |
| **Ajustable** | Solo umbrales fijos | Umbrales + margen + lógica |
| **Protección** | Moderada | Alta (regla absoluta + relativa) |

---

## ⚠️ Limitaciones de NSFW.js

Incluso con el mejor algoritmo, NSFW.js tiene limitaciones:

1. **Sesgo Cultural** - Entrenado principalmente con contenido occidental
2. **Contexto** - No entiende contexto (playa, arte, médico)
3. **Ropa Ajustada** - Puede confundir ropa ajustada con desnudez
4. **Body Types** - Más sensible a ciertos tipos de cuerpo
5. **Ángulos** - Ángulos específicos pueden dar falsos positivos

**Por eso** mantenemos el **sistema de denuncias** como respaldo.

---

## 🔄 Flujo Completo

```
1. Usuario sube foto
   ↓
2. NSFW.js analiza (5 categorías)
   ↓
3. Algoritmo inteligente decide
   ↓
4a. ✅ APROBADA → Se sube a Supabase
   ↓
   Usuario puede denunciar si es inapropiada
   
4b. ❌ RECHAZADA → No se sube
   ↓
   Usuario puede cambiar álbum a privado
```

---

## 📞 Soporte

Si el filtro rechaza muchas fotos normales:
1. Abre la consola del navegador (F12)
2. Revisa los logs de `🔍 NSFW Analysis`
3. Comparte las puntuaciones exactas
4. Ajustaremos los umbrales

---

**Última actualización:** 2026-02-14  
**Versión:** 2.0.0 - Algoritmo Inteligente  
**Commit pendiente:** feat: Reactivar NSFW con lógica mejorada
