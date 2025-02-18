#!/bin/sh
set -e

# Esperar a que MySQL esté listo
echo "Waiting for MySQL to be ready..."
while ! nc -z mysql 3306; do
  sleep 1
done
echo "MySQL is ready!"

# Ejecutar migraciones y seed
echo "Running migrations and seed..."
npx prisma migrate reset --force

# Ejecutar el comando proporcionado (npm run dev)
exec "$@" 