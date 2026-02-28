# MÉTODO ALTERNATIVO: VENTOY (más compatible)

## ¿Qué es Ventoy?
Es una herramienta que hace USB booteables más compatibles.
Funciona mejor con BIOS problemáticos.

---

## PASO 1: Descargar Ventoy

1. Ve a: https://www.ventoy.net/en/download.html
2. Descarga: **ventoy-X.X.XX-windows.zip**
3. Descomprime el archivo

---

## PASO 2: Preparar el USB

1. **Ejecuta:** `Ventoy2Disk.exe`

2. **Configuración:**
   ```
   Device: [Tu USB]
   Partition Style: GPT       ← IMPORTANTE
   Secure Boot: Secure Boot Support   ← IMPORTANTE
   ```

3. **Click en "Install"**
   - Te preguntará si borrar el USB
   - Click "Yes"
   - Espera 1-2 minutos

---

## PASO 3: Copiar el ISO

1. **Abre el USB** (aparecerá como una unidad normal)

2. **Copia el archivo ISO directamente:**
   ```
   Arrastra: ubuntu-22.04.4-live-server-amd64.iso
   Al USB
   ```

3. **Espera** a que termine de copiar (2-5 minutos)

4. **Expulsar USB de forma segura**

---

## PASO 4: Arrancar

1. **Conectar USB al Acer**

2. **Encender y presionar F12** (Boot Menu)

3. **Seleccionar el USB**

4. **Ventoy te mostrará:**
   ```
   ┌─────────────────────────────────┐
   │ Ventoy Boot Menu                │
   ├─────────────────────────────────┤
   │ > ubuntu-22.04.4-live-server... │
   └─────────────────────────────────┘
   ```

5. **Presiona Enter**

6. **Debería arrancar Ubuntu** ✅

---

## VENTAJAS DE VENTOY:

✅ Más compatible con BIOS problemáticos
✅ Funciona con Secure Boot activado
✅ Puedes copiar varios ISOs en el mismo USB
✅ No necesitas formatear cada vez

---

## SI SIGUE SIN FUNCIONAR:

Intenta estas combinaciones en el Boot Menu:

1. UEFI: USB Device
2. UEFI: [Nombre del USB]
3. USB HDD
4. USB FDD
5. Removable Devices

Uno de esos debería funcionar.
