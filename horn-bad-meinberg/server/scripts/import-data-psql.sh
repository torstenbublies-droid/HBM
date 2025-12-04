#!/bin/bash
set -e

echo "[Data-Import-PSQL] Starting data import from backup..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "[Data-Import-PSQL] ERROR: DATABASE_URL is not set"
  exit 1
fi

# Find the SQL backup file
SQL_FILE="complete_database_backup.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "[Data-Import-PSQL] ERROR: SQL backup file not found: $SQL_FILE"
  exit 1
fi

echo "[Data-Import-PSQL] Found backup file: $SQL_FILE"

# Check if data is already imported
TENANT_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM tenants;" 2>/dev/null || echo "0")
TENANT_COUNT=$(echo $TENANT_COUNT | tr -d ' ')

if [ "$TENANT_COUNT" -gt "0" ]; then
  echo "[Data-Import-PSQL] Database already has $TENANT_COUNT tenants, skipping import"
  exit 0
fi

echo "[Data-Import-PSQL] Importing data using psql..."

# Import only data (skip CREATE TABLE, CREATE SEQUENCE, ALTER TABLE)
grep -v "^CREATE TABLE" "$SQL_FILE" | \
grep -v "^CREATE SEQUENCE" | \
grep -v "^ALTER TABLE" | \
grep -v "^ALTER SEQUENCE" | \
grep -v "^CREATE INDEX" | \
grep -v "^DROP TABLE" | \
grep -v "^DROP SEQUENCE" | \
grep -v "^SET default_tablespace" | \
grep -v "^SET default_table_access_method" | \
psql "$DATABASE_URL" 2>&1 | head -100

echo "[Data-Import-PSQL] ✅ Data import completed!"

# Verify import
FINAL_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM tenants;" 2>/dev/null || echo "0")
FINAL_COUNT=$(echo $FINAL_COUNT | tr -d ' ')
echo "[Data-Import-PSQL] Final tenant count: $FINAL_COUNT"

if [ "$FINAL_COUNT" -eq "0" ]; then
  echo "[Data-Import-PSQL] WARNING: No tenants imported!"
  exit 1
fi

echo "[Data-Import-PSQL] SUCCESS!"
