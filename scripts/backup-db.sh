#!/bin/bash
# scripts/backup-db.sh
# Performs a pg_dump of the DevRamp Postgres Database
set -e

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-devramp}
BACKUP_DIR=${BACKUP_DIR:-./backups}
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/devramp_backup_$DATE.sql"

echo "Starting database backup for $DB_NAME..."
export PGPASSWORD=$DB_PASSWORD

pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F c -f "$BACKUP_FILE"

echo "Backup completed successfully: $BACKUP_FILE"
