#!/bin/bash
# scripts/restore-db.sh
# Restores the DevRamp Postgres Database from a pg_dump backup
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

BACKUP_FILE=$1
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-devramp}

echo "Starting database restore for $DB_NAME from $BACKUP_FILE..."
export PGPASSWORD=$DB_PASSWORD

pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$BACKUP_FILE"

echo "Restore completed successfully."
