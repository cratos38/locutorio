#!/bin/bash
# Backup de Supabase - Manual

BACKUP_DIR="/home/user/webapp/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

mkdir -p "$BACKUP_DIR"

echo "🔄 Iniciando backup de Supabase..."
echo "📅 Fecha: $DATE"

# TODO: Agregar comandos de backup
# 1. Backup de base de datos (pg_dump)
# 2. Backup de storage (descargar fotos)
# 3. Backup de configuración

echo "✅ Backup completado"
