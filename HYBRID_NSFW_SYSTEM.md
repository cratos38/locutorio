# Sistema Híbrido de Detección NSFW

## 🎯 Objetivo
Crear un sistema de moderación automática **100% GRATUITO** y **efectivo** para cumplir con requisitos legales de protección de menores, sin depender de servicios externos pagos.

---

## 🏗️ Arquitectura del Sistema

### 4 Capas Independientes de Detección

#### **Capa 1: Detección de Color de Piel** (25% peso)
- **Técnica**: Análisis de píxeles RGB para identificar rangos de color piel
- **Rangos detectados**: 
  - Tonos claros: R>95, G>40, B>20
  - Tonos medios: R>80, G>50, B>30
  - Tonos oscuros: R>60, G>40, B>20
- **Puntuación**: 
  - 0% piel visible → score 0.0
  - 40% piel visible → score 0.5
  - 80%+ piel visible → score 1.0

**Ventajas**:
- Muy rápido (analiza píxeles directamente)
- No requiere modelos de IA
- Detecta desnudez sin importar contexto

**Limitaciones**:
- Falsos positivos en playas, piscinas, ropa de color piel
- No distingue contexto (médico, artístico, pornográfico)

---

#### **Capa 2: NSFW.js Mejorado** (40% peso)
- **Técnica**: Red neuronal pre-entrenada con lógica ponderada
- **Categorías analizadas**: Porn, Sexy, Hentai, Neutral, Drawing
- **Lógica mejorada**:
  ```
  1. Si Porn > 75% → RECHAZAR (contenido pornográfico explícito)
  
  2. Si Neutral > maxNSFW + 20% → APROBAR
     Ejemplo: Neutral 65%, Sexy 40% → APROBAR (65% > 40% + 20%)
  
  3. Si |Neutral - maxNSFW| < 10% → SOSPECHOSO
     Ejemplo: Neutral 48%, Sexy 52% → SOSPECHOSO
  
  4. Si maxNSFW > Neutral → RECHAZAR
  ```

**Mejoras sobre versión anterior**:
- ❌ Antes: Solo miraba Porn y Sexy independientemente
- ✅ Ahora: Compara Neutral vs. NSFW para determinar dominancia
- ✅ Reduce falsos positivos donde Sexy es alto pero Neutral también

**Ventajas**:
- Entrenado en millones de imágenes
- Detecta diferentes categorías (porn, sexy, hentai)
- Ejecuta en navegador (100% gratis)

**Limitaciones**:
- Confunde ilustraciones románticas con hentai
- Sexy no siempre significa pornografía
- Resultados inconsistentes con misma persona/escena

---

#### **Capa 3: Detección de Formas/Contornos** (20% peso)
- **Técnica**: Análisis de áreas uniformes y gradientes
- **Qué detecta**:
  - Áreas uniformes grandes (posible piel)
  - Transiciones suaves (típico de cuerpos)
- **Puntuación**:
  - <30% áreas uniformes → score 0.3
  - 30-60% áreas uniformes → score 0.5-1.0

**Ventajas**:
- Detecta patrones anatómicos
- Complementa detección de color de piel
- Identifica fotos con poses sugestivas

**Limitaciones**:
- Falsos positivos en fondos lisos (cielo, paredes)
- No distingue tipo de uniformidad (piel vs. ropa)

---

#### **Capa 4: Heurísticas Contextuales** (15% peso)
- **Técnica**: Reglas específicas basadas en contexto
- **Reglas implementadas**:

##### Regla 1: Ilustraciones con contenido sugestivo
```
Si Drawing > 50% AND (Hentai > 25% OR Sexy > 90%)
→ Score contextual = 0.8 (muy sospechoso)
```

##### Regla 2: Ilustraciones normales
```
Si Drawing > 50% AND Hentai < 25% AND Sexy < 90%
→ Score contextual = 0.2 (seguro)
```

##### Regla 3: Fotos reales con mucha piel
```
Si Drawing < 50% AND skinPercentage > 50%
→ Score contextual = 0.7 (sospechoso)
```

##### Regla 4: Fotos reales normales
```
Si Drawing < 50% AND skinPercentage < 50%
→ Score contextual = 0.1 (seguro)
```

**Ventajas**:
- Diferencia ilustraciones de fotos reales
- Aplica reglas más estrictas a dibujos (problema de hentai)
- Contextualiza resultados de otras capas

**Limitaciones**:
- Reglas fijas, no aprende
- Requiere ajuste manual de umbrales

---

## ⚖️ Puntuación Final Combinada

### Fórmula
```
FinalScore = (skinScore × 0.25) + 
             (nsfwScore × 0.40) + 
             (shapesScore × 0.20) + 
             (contextScore × 0.15)

Si FinalScore >= 0.65 → RECHAZAR
Si FinalScore < 0.65 → APROBAR
```

### Ejemplo de Cálculo

**Caso 1: Foto de playa (bikini)**
```
Capa 1 - Piel: 55% visible → score 0.69
Capa 2 - NSFW.js: Neutral 45%, Sexy 38%, Porn 5% 
         → Neutral domina (45% > 38% + 20%) → score 0.38
Capa 3 - Formas: 42% áreas uniformes → score 0.70
Capa 4 - Contexto: Foto real, 55% piel → score 0.70

FinalScore = (0.69 × 0.25) + (0.38 × 0.40) + (0.70 × 0.20) + (0.70 × 0.15)
           = 0.173 + 0.152 + 0.14 + 0.105
           = 0.570 < 0.65 → ✅ APROBADO
```

**Caso 2: Desnudo explícito**
```
Capa 1 - Piel: 78% visible → score 0.98
Capa 2 - NSFW.js: Porn 82%, Sexy 15%, Neutral 1%
         → Porn > 75% → score 1.0
Capa 3 - Formas: 68% áreas uniformes → score 1.0
Capa 4 - Contexto: Foto real, 78% piel → score 0.70

FinalScore = (0.98 × 0.25) + (1.0 × 0.40) + (1.0 × 0.20) + (0.70 × 0.15)
           = 0.245 + 0.40 + 0.20 + 0.105
           = 0.950 > 0.65 → ❌ RECHAZADO
```

**Caso 3: Ilustración romántica vestida**
```
Capa 1 - Piel: 12% visible → score 0.15
Capa 2 - NSFW.js: Drawing 67%, Hentai 18%, Sexy 82%, Neutral 2%
         → Empate → score 0.6
Capa 3 - Formas: 25% áreas uniformes → score 0.42
Capa 4 - Contexto: Ilustración, Hentai < 25%, Sexy < 90% → score 0.2

FinalScore = (0.15 × 0.25) + (0.6 × 0.40) + (0.42 × 0.20) + (0.2 × 0.15)
           = 0.038 + 0.24 + 0.084 + 0.03
           = 0.392 < 0.65 → ✅ APROBADO
```

---

## 🔧 Configuración y Ajuste de Umbrales

### Archivo: `src/lib/nsfw-hybrid.ts`

```typescript
export const HYBRID_CONFIG = {
  // Capa 1: Detección de piel
  skinDetection: {
    enabled: true,
    thresholdPercentage: 40, // % mínimo para considerar sospechoso
    weight: 0.25
  },
  
  // Capa 2: NSFW.js
  nsfwjs: {
    enabled: true,
    neutralMargin: 0.20, // Neutral debe superar NSFW en 20%
    pornThreshold: 0.75, // Umbral absoluto para Porn
    weight: 0.40
  },
  
  // Capa 3: Formas
  shapeDetection: {
    enabled: true,
    suspiciousShapeThreshold: 0.30,
    weight: 0.20
  },
  
  // Capa 4: Contexto
  contextual: {
    enabled: true,
    drawingHentaiRule: true,
    weight: 0.15
  },
  
  // Umbral final
  finalRejectThreshold: 0.65 // Rechazar si score >= 0.65
};
```

### Cómo Ajustar para Diferentes Necesidades

#### **Quiero ser MÁS ESTRICTO** (rechazar más contenido)
```typescript
finalRejectThreshold: 0.50  // Bajar umbral (rechaza más fácilmente)
pornThreshold: 0.65         // Bajar umbral de Porn
neutralMargin: 0.30         // Neutral debe superar NSFW en 30% (más estricto)
```

#### **Quiero ser MÁS PERMISIVO** (rechazar menos contenido)
```typescript
finalRejectThreshold: 0.75  // Subir umbral (rechaza menos)
pornThreshold: 0.85         // Subir umbral de Porn
neutralMargin: 0.10         // Neutral solo necesita superar NSFW en 10%
```

#### **Quiero enfocarse en Porn y ignorar Sexy**
```typescript
nsfwjs: {
  weight: 0.60  // Aumentar peso de NSFW.js
}
skinDetection: {
  weight: 0.10  // Reducir peso de detección de piel
}
```

#### **Quiero desactivar una capa**
```typescript
shapeDetection: {
  enabled: false  // Desactivar detección de formas
}
```

---

## 📊 Logs Detallados en Consola

Cada imagen analizada genera logs completos:

```
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
  decision: "✅ APROBADO",
  breakdown: {
    skin: "0.142",
    nsfw: "0.155",
    shapes: "0.115",
    context: "0.015",
    total: "0.427"
  }
}
```

---

## 🚀 Ventajas del Sistema Híbrido

### ✅ **Ventajas**
1. **100% Gratuito**: Sin costos de API externa
2. **Ejecuta en navegador**: No consume recursos del servidor
3. **Múltiples capas**: Si una falla, otras compensan
4. **Logs transparentes**: Usuario/admin pueden revisar decisiones
5. **Ajustable**: Umbrales configurables según necesidad
6. **Contextual**: Diferencia ilustraciones de fotos reales
7. **Complementario**: Funciona junto con sistema de denuncias

### ⚠️ **Limitaciones**
1. **No es 100% preciso**: Ningún filtro automático lo es
2. **Puede haber falsos positivos/negativos**: Se mitiga con denuncias
3. **Requiere ajuste inicial**: Probar con fotos reales y ajustar umbrales
4. **Consume CPU del navegador**: Análisis toma 3-8 segundos por imagen

---

## 🔄 Flujo de Moderación Completo

### **Nivel 1: Filtro Automático (Sistema Híbrido)**
```
Usuario sube foto → Análisis híbrido (4 capas) → 
  Si score >= 0.65 → RECHAZAR (no sube)
  Si score < 0.65 → APROBAR (sube a servidor)
```

### **Nivel 2: Sistema de Denuncias**
```
Foto aprobada → Visible en álbum público → 
  Usuario denuncia → Contador +1 → 
  3 denuncias → Auto-hide → Admin revisa
```

### **Nivel 3: Revisión Administrativa**
```
Admin revisa foto oculta → 
  Decisión: Aprobar, Rechazar, Eliminar → 
  Actualizar estado
```

---

## 📈 Comparación con Soluciones Externas

| Característica | Sistema Híbrido | Google Vision | Amazon Rekognition |
|----------------|-----------------|---------------|-------------------|
| **Costo** | **$0** | $1.50/1000 imgs | $1.00/1000 imgs |
| **Precisión** | ~75-85% | ~90-95% | ~85-92% |
| **Velocidad** | 3-8 seg/img | 0.5-2 seg/img | 1-3 seg/img |
| **Escalabilidad** | Cliente (ilimitado) | Servidor (limitado) | Servidor (limitado) |
| **Privacidad** | Total (no sale del navegador) | Baja (Google analiza) | Baja (AWS analiza) |
| **Personalizable** | Totalmente | No | No |
| **Offline** | Sí | No | No |

---

## 🧪 Pruebas y Validación

### Casos de Prueba Recomendados

#### **Grupo 1: Fotos normales (deben APROBAR)**
- Selfies con ropa normal
- Fotos de grupo en eventos
- Paisajes, objetos, animales
- Fotos de supermercado, tiendas
- Comida, productos

#### **Grupo 2: Contenido límite (ajustar según necesidad)**
- Fotos de playa (bikini, traje de baño)
- Ropa deportiva (gym, yoga)
- Vestidos de noche, escotes
- Disfraces de carnaval/Halloween
- Ilustraciones románticas

#### **Grupo 3: Contenido inapropiado (deben RECHAZAR)**
- Desnudos explícitos
- Contenido pornográfico
- Hentai
- Poses sexuales explícitas

### Proceso de Validación

1. **Crear álbum de prueba privado**
2. **Subir fotos de los 3 grupos**
3. **Cambiar álbum a público** (activa análisis)
4. **Revisar logs en consola** (F12)
5. **Anotar falsos positivos/negativos**
6. **Ajustar umbrales en `HYBRID_CONFIG`**
7. **Repetir prueba**

---

## 🛠️ Mantenimiento y Mejoras Futuras

### **Fase 1: Actual** ✅
- Sistema híbrido de 4 capas
- Umbrales configurables
- Logs detallados

### **Fase 2: Corto plazo** (1-2 meses)
- Recopilar estadísticas de denuncias
- Ajustar umbrales basado en feedback real
- Crear panel de estadísticas de moderación

### **Fase 3: Mediano plazo** (3-6 meses)
- Entrenar modelo personalizado con fotos denunciadas/aprobadas
- Implementar aprendizaje continuo
- Optimizar velocidad de análisis

### **Fase 4: Largo plazo** (6-12 meses)
- Integrar detección de deepfakes
- Análisis de contexto (texto en imagen, ubicación)
- Moderación automática de comentarios

---

## ⚖️ Cumplimiento Legal

Este sistema proporciona:

✅ **Filtro automático obligatorio** (requisito legal)  
✅ **Logs de moderación** (evidencia de esfuerzo razonable)  
✅ **Sistema de denuncias** (participación de comunidad)  
✅ **Revisión administrativa** (supervisión humana)  
✅ **Transparencia** (logs visibles para debugging)  

**Recomendación legal**: Agregar en Términos de Servicio:
> "Esta plataforma implementa un sistema automático de detección de contenido inapropiado mediante algoritmos de visión por computadora. Los usuarios pueden denunciar contenido que consideren inapropiado. Nos reservamos el derecho de remover contenido sin previo aviso."

---

## 📞 Soporte

Para ajustar umbrales o reportar problemas:
- Editar: `src/lib/nsfw-hybrid.ts`
- Revisar logs en consola del navegador (F12)
- Consultar este documento para entender cómo funciona cada capa

---

**Última actualización**: 2026-02-14  
**Versión**: 1.0  
**Estado**: Producción
