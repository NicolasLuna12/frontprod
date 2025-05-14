#!/bin/bash

# Asegúrate de que exista el directorio de destino
mkdir -p dist/app/browser

# Copia todos los archivos
cp -r dist/app/* dist/app/browser/

# Copia el archivo _redirects
cp src/_redirects dist/app/browser/

# Opcional: copia también netlify.toml
# cp netlify.toml dist/app/browser/

echo "Estructura de directorios preparada para Netlify"
