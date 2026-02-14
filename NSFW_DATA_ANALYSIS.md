# 🔬 Análisis de Datos Reales - NSFW.js

## 📊 Datos del Usuario (26 fotos)

### Problema Identificado
**Neutral NO es confiable** para distinguir contenido inapropiado cuando hay cuerpos humanos.

---

## 📈 Distribución de Puntuaciones

### Fotos con Neutral BAJO (mayoría)
```
Foto 1:  Porn: 74.6%, Sexy: 18.2%, Neutral: 0.6%
Foto 3:  Hentai: 66.4%, Porn: 21.4%, Neutral: 0.1%
Foto 5:  Porn: 68.3%, Sexy: 27.0%, Neutral: 3.4%
Foto 7:  Sexy: 97.4%, Porn: 1.7%, Neutral: 0.8%
Foto 9:  Sexy: 99.7%, Porn: 0.09%, Neutral: 0.2%
Foto 11: Sexy: 96.7%, Porn: 1.9%, Neutral: 1.3%
Foto 23: Sexy: 99.9%, Porn: 0.09%, Neutral: 0.05%
```

### Foto con Neutral ALTO (única)
```
Foto 4:  Neutral: 76.5%, Sexy: 21.8%, Porn: 1.5% ✅
```

---

## 🎯 Conclusiones Clave

### 1. **Neutral NO funciona como filtro**
- En fotos con cuerpos humanos, Neutral tiende a 0%
- Incluso fotos normales de ropa pueden dar Neutral: 0.6%
- NO podemos usar `Neutral > NSFW` como regla

### 2. **Rangos Observados**

| Categoría | Rango | Observaciones |
|-----------|-------|---------------|
| **Porn** | 0.7% - 74.6% | Alto incluso en ropa normal |
| **Sexy** | 5% - 99.9% | Rango MUY amplio |
| **Hentai** | 0% - 66.4% | Alto en dibujos |
| **Neutral** | 0.05% - 76.5% | Muy variable, NO confiable |
| **Drawing** | 0% - 67.2% | Indicador de ilustraciones |

### 3. **Patrones Detectados**

#### Ropa Normal (debería pasar)
```
Porn: 40-75%
Sexy: 20-45%
Neutral: 1-35%
→ Porn+Sexy: 60-95% (NO rechazar)
```

#### Contenido Límite (dudoso)
```
Sexy: 85-95%
Porn: 5-20%
Neutral: 1-10%
→ Porn+Sexy: 90-98% (evaluar)
```

#### Contenido Muy Sexual (rechazar)
```
Sexy: 97-99.9%
Porn: 0-10%
Neutral: <1%
→ Sexy solo > 97.5% (rechazar)
```

#### Hentai en Dibujos
```
Drawing: 60-70%
Hentai: 25-66%
→ Drawing > 65% AND Hentai > 25% (rechazar)
```

---

## ⚙️ Umbrales Ajustados V3

### Umbrales Individuales (MUY ALTOS)
```javascript
Porn: 0.90    // >90% = obviamente pornográfico
Sexy: 0.975   // >97.5% = casi seguro inapropiado
Hentai: 0.90  // >90% = obviamente hentai
```

**Razón:** Evitar falsos positivos en ropa normal (Porn: 40-75%)

### Umbrales Combinados
```javascript
PornPlusSexy: 0.95   // Porn + Sexy > 95%
TotalNSFW: 1.50      // Porn + Sexy + Hentai > 150%
```

**Razón:** Detectar contenido mixto (ej: Porn:70% + Sexy:30% = 100%)

### Casos Especiales
```javascript
Drawing: 0.65            // >65% dibujo
HentaiInDrawing: 0.25    // Y Hentai >25%
```

**Razón:** Hentai suele ser ilustraciones, no fotos

---

## 🧮 Simulación con Datos Reales

### Foto 1: Porn:74.6%, Sexy:18.2%
```
Porn: 74.6% < 90% → NO rechazar
Sexy: 18.2% < 97.5% → NO rechazar
Porn+Sexy: 92.8% < 95% → NO rechazar
→ ✅ APROBAR
```

### Foto 7: Sexy:97.4%, Porn:1.7%
```
Sexy: 97.4% < 97.5% → NO rechazar
Porn+Sexy: 99.1% > 95% → RECHAZAR ❌
→ ❌ RECHAZADO (combinado)
```

### Foto 9: Sexy:99.7%, Porn:0.09%
```
Sexy: 99.7% > 97.5% → RECHAZAR ❌
→ ❌ RECHAZADO (sexy absoluto)
```

### Foto 23: Sexy:99.9%, Porn:0.09%
```
Sexy: 99.9% > 97.5% → RECHAZAR ❌
→ ❌ RECHAZADO (sexy absoluto)
```

### Foto 3: Drawing:67.2%, Hentai:32.2%
```
Drawing: 67.2% > 65% → evaluar
Hentai: 32.2% > 25% → RECHAZAR ❌
→ ❌ RECHAZADO (hentai en dibujo)
```

### Foto 4: Neutral:76.5%, Sexy:21.8%
```
Todas las reglas → NO rechazar
→ ✅ APROBAR
```

---

## 📊 Resultados Esperados

De las 26 fotos analizadas:

| Rango | Count | Acción | Razón |
|-------|-------|--------|-------|
| Sexy > 97.5% | 3 fotos | ❌ Rechazar | Umbral absoluto |
| Porn+Sexy > 95% | ~4 fotos | ❌ Rechazar | Combinado |
| Hentai en dibujo | 1 foto | ❌ Rechazar | Caso especial |
| Resto | ~18 fotos | ✅ Aprobar | Bajo umbrales |

**Total estimado:**
- ✅ Aprobadas: ~18 (69%)
- ❌ Rechazadas: ~8 (31%)

---

## 🎯 Filosofía del Filtro

### Principio
**"Mejor falso negativo que falso positivo"**

- **Falso positivo:** Rechazar foto normal → Usuario frustrado ❌
- **Falso negativo:** Aprobar foto inapropiada → Sistema de denuncias actúa ✅

### Estrategia Doble Capa
1. **NSFW.js (automático):** Rechaza solo lo OBVIO (umbrales altos)
2. **Denuncias (manual):** Usuarios reportan lo que pasa el filtro

---

## ⚠️ Limitaciones de NSFW.js

### 1. **Sesgo de Entrenamiento**
- Entrenado principalmente con contenido occidental
- Más sensible a ciertos tipos de cuerpo
- Contexto cultural no considerado

### 2. **Sin Contexto**
- No distingue playa vs dormitorio
- No distingue arte vs pornografía
- No distingue ropa ajustada vs desnudez

### 3. **Neutral No Confiable**
- Con cuerpos humanos, Neutral tiende a 0%
- NO se puede usar como indicador principal

---

## 🔧 Ajustes Futuros

### Si Rechaza Demasiado (Falsos Positivos)
```javascript
// Aumentar umbrales
Porn: 0.95,
Sexy: 0.98,
PornPlusSexy: 0.98
```

### Si Aprueba Contenido Malo (Falsos Negativos)
```javascript
// Reducir umbrales
Porn: 0.85,
Sexy: 0.95,
PornPlusSexy: 0.90
```

### Monitoreo Recomendado
1. Registrar todas las decisiones
2. Revisar denuncias de usuarios
3. Ajustar umbrales mensualmente

---

## 🧪 Casos de Prueba

### Debe APROBAR ✅
- Ropa de calle (Porn:40-60%, Sexy:20-40%)
- Ropa deportiva (Sexy:30-50%)
- Vestidos normales (Porn:50-70%, Sexy:20-30%)
- Trajes de baño en playa (contexto)

### Debe RECHAZAR ❌
- Sexy > 97.5% (casi seguro inapropiado)
- Porn+Sexy > 95% (contenido mixto)
- Hentai en dibujos (Drawing>65%, Hentai>25%)
- Porn > 90% (obviamente explícito)

### Zona Gris (Denuncias)
- Porn: 70-85%, Sexy: 20-40%
- Sexy: 85-95% solo
- Ropa muy ajustada
- Ángulos sugestivos

---

## 📞 Próximos Pasos

1. **Deploy con umbrales V3**
2. **Probar con 26 fotos reales**
3. **Verificar rechazos:**
   - Foto 7 (Sexy:97.4%) → ¿rechazada?
   - Foto 9 (Sexy:99.7%) → ¿rechazada?
   - Foto 23 (Sexy:99.9%) → ¿rechazada?
4. **Ajustar si es necesario**

---

**Última actualización:** 2026-02-14  
**Versión:** V3 - Basada en datos reales  
**Commit pendiente:** feat: Ajustar umbrales NSFW según datos reales
