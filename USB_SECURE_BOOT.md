# CREAR USB UBUNTU CON SOPORTE SECURE BOOT

## ⚠️ USAR ESTO SI NO PUEDES DESACTIVAR SECURE BOOT

---

## PASO 1: Borrar el USB anterior

1. Conecta el USB a tu PC principal
2. Formatearlo completamente

---

## PASO 2: Usar Rufus con configuración especial

### Configuración Rufus para Secure Boot:

```
Dispositivo: [Tu USB]

Elección de arranque: [SELECCIONAR]
  → ubuntu-22.04.4-live-server-amd64.iso

Esquema de partición: GPT
Sistema destino: UEFI (non CSM)  ← IMPORTANTE

Sistema de archivos: FAT32        ← IMPORTANTE

Opciones de imagen:
  Modo estándar                    ← NO usar modo DD

EMPEZAR
```

---

## PASO 3: Modificar el arranque

Cuando Rufus pregunte sobre:
```
"ISOHybrid image detected"
```

Elegir: **"Escribir en modo imagen ISO (Recomendado)"**

Cuando pregunte sobre:
```
"Descargar archivos adicionales"
```

Elegir: **"Sí"** (descargará archivos para Secure Boot)

---

## RESULTADO:

El USB ahora tendrá los certificados necesarios para arrancar con Secure Boot activado.

---

## SI SIGUE SIN FUNCIONAR:

Tu única opción es instalar en Legacy mode, PERO con un truco:

### TRUCO: Instalar en Legacy y luego migrar a UEFI

1. Instalar Ubuntu en Legacy mode
2. Después de instalado, convertir a UEFI desde dentro de Ubuntu
3. Comando: `sudo grub-install --target=x86_64-efi --efi-directory=/boot/efi`

Pero esto es más complicado y no lo recomiendo.
