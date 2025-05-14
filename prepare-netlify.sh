#!/bin/bash

# Script para preparar la estructura de directorios para Netlify

# 1. Verificar si la compilación Angular se ha completado
if [ ! -d "dist/app" ]; then
  echo "Error: La carpeta dist/app no existe. Ejecute primero 'npm run build'."
  exit 1
fi

# 2. Crear la estructura de directorios necesaria
echo "Creando estructura de directorios para Netlify..."
mkdir -p dist/app/browser

# 3. Copiar todos los archivos de dist/app a dist/app/browser
echo "Copiando archivos a la estructura requerida..."
cp -r dist/app/* dist/app/browser/

# 4. Copiar archivos de configuración de Netlify
echo "Copiando archivos de configuración de Netlify..."
cp src/_redirects dist/app/browser/
cp netlify.toml dist/app/browser/

echo "¡Preparación completada! La estructura está lista para ser desplegada en Netlify."
