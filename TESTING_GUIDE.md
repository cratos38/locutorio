# 🧪 Guía Rápida de Pruebas - Sistema Híbrido NSFW

## ✅ Sistema Desplegado (Commit e690a1b)

El sistema híbrido de 4 capas está ahora activo en producción.

---

## 🎯 Cómo Probar el Sistema

### **Paso 1: Abrir Consola del Navegador**
1. Ve a tu sitio: https://locutorio.com.ve/albums
2. Presiona `F12` para abrir Developer Tools
3. Ve a la pestaña **Console**

### **Paso 2: Crear Álbum Público de Prueba**
1. Clic en **"Crear Álbum"**
2. **Título**: "Prueba NSFW Híbrido"
3. **Privacidad**: **Público** (obligatorio para activar análisis)
4. **Seleccionar fotos**: Elige varias fotos de tus 26 imágenes
5. Clic en **"Crear Álbum"**

### **Paso 3: Observar Logs en Consola**

Verás logs como este para cada foto:

```
🚀 Iniciando análisis híbrido de 3 imágenes...

📷 Analizando imagen 1/3: foto1.jpg
🔬 === ANÁLISIS HÍBRIDO NSFW ===
📊 Capa 1 - Detección de Piel: {
  skinPercentage: "45.3%",
  suspiciousScore: 0.566,
  weight: 0.25,
  contribution: 0.142
}
🤖 Capa 2 - NSFW.js: {
  scores: {
    Porn: "12.4%",
    Sexy: "38.7%",
    Hentai: "5.2%",
    Neutral: "42.1%",
    Drawing: "1.6%"
  },
  decision: "SAFE",
  reason: "Neutral domina (42.1% vs 38.7%)",
  suspiciousScore: 0.387,
  weight: 0.4,
  contribution: 0.155
}
🔍 Capa 3 - Detección de Formas: {
  suspiciousShapes: "34.5%",
  suspiciousScore: 0.575,
  weight: 0.2,
  contribution: 0.115
}
🎯 Capa 4 - Contexto: {
  isDrawing: false,
  reason: "Foto real sin contenido sospechoso",
  contextScore: 0.1,
  weight: 0.15,
  contribution: 0.015
}
⚖️ RESULTADO FINAL: {
  finalScore: 0.427,
  threshold: 0.65,
  decision: "✅ APROBADO"
}
```

---

## 📊 Qué Observar

### ✅ **Fotos que DEBEN APROBAR** (finalScore < 0.65)
- Fotos normales con ropa
- Selfies, fotos de grupo
- Ilustraciones románticas vestidas
- Fotos de supermercado, tiendas
- **EJEMPLO**: La foto del supermercado que antes daba 91% porn

### ❌ **Fotos que DEBEN RECHAZAR** (finalScore >= 0.65)
- Desnudos explícitos
- Contenido pornográfico
- Hentai

### ⚠️ **Casos Límite** (ajustar según tu criterio)
- Fotos de playa (bikini)
- Ropa deportiva (gym, yoga)
- Vestidos de noche con escote
- Ilustraciones con poses sugestivas

---

## 🔧 Ajustar Umbrales

Si ves **MUCHOS FALSOS POSITIVOS** (fotos normales rechazadas):

1. Edita `src/lib/nsfw-hybrid.ts`
2. Cambia el umbral final:

```typescript
export const HYBRID_CONFIG = {
  // ... otras configuraciones
  finalRejectThreshold: 0.75  // Aumentar de 0.65 a 0.75
};
```

Si ves **MUCHOS FALSOS NEGATIVOS** (contenido inapropiado aprobado):

```typescript
export const HYBRID_CONFIG = {
  // ... otras configuraciones
  finalRejectThreshold: 0.55  // Reducir de 0.65 a 0.55
};
```

---

## 📝 Registro de Resultados

Crea una tabla para documentar tus pruebas:

| # | Tipo de Foto | Skin % | Porn % | Sexy % | Neutral % | Drawing % | FinalScore | Decisión | Correcto? |
|---|-------------|--------|--------|--------|-----------|-----------|------------|----------|-----------|
| 1 | Supermercado | 12% | 8% | 15% | 75% | 0% | 0.28 | ✅ APROBAR | ✅ SÍ |
| 2 | Playa (bikini) | 55% | 12% | 38% | 45% | 1% | 0.52 | ✅ APROBAR | ❓ Depende |
| 3 | Desnudo | 78% | 82% | 15% | 1% | 0% | 0.95 | ❌ RECHAZAR | ✅ SÍ |
| 4 | Ilustración vestida | 12% | 5% | 82% | 2% | 67% | 0.39 | ✅ APROBAR | ✅ SÍ |

---

## 🚨 Si Encuentras Problemas

### **Problema: Ilustraciones vestidas rechazadas**
**Solución**: Reducir peso de Capa 4 (Contexto)

```typescript
contextual: {
  enabled: true,
  weight: 0.10  // Reducir de 0.15 a 0.10
}
```

### **Problema: Fotos de piel (playa, gym) rechazadas**
**Solución**: Reducir peso de Capa 1 (Piel)

```typescript
skinDetection: {
  enabled: true,
  thresholdPercentage: 50,  // Aumentar de 40% a 50%
  weight: 0.15  // Reducir de 0.25 a 0.15
}
```

### **Problema: NSFW.js domina demasiado**
**Solución**: Reducir peso de Capa 2

```typescript
nsfwjs: {
  enabled: true,
  neutralMargin: 0.25,  // Aumentar de 0.20 a 0.25
  weight: 0.30  // Reducir de 0.40 a 0.30
}
```

---

## 🎯 Objetivo de las Pruebas

**Meta**: Lograr **>90% precisión** en tus fotos reales

- **Falsos Positivos**: <5% (fotos normales rechazadas)
- **Falsos Negativos**: <5% (contenido inapropiado aprobado)
- **Casos Límite**: Decidir según tu política de contenido

---

## 📞 Siguiente Paso

Después de probar con tus 26 fotos:
1. Anota cuántas fueron aprobadas/rechazadas correctamente
2. Identifica patrones en errores (ej. todas las ilustraciones rechazan)
3. Ajusta umbrales según los problemas encontrados
4. Repite prueba

**Objetivo final**: Sistema que bloquee contenido inapropiado sin frustrar usuarios con fotos normales.

---

## 🔄 Proceso Iterativo

```
Probar fotos → Revisar logs → Identificar errores → 
Ajustar umbrales → Commit cambios → Volver a probar
```

**Tiempo estimado**: 30-60 minutos para ajuste inicial

---

**Versión**: 1.0  
**Fecha**: 2026-02-14  
**Commit**: e690a1b
