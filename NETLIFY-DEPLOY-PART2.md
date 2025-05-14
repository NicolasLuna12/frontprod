### 3. Scripts para preparar la estructura de directorios

Para resolver el problema con la estructura de directorios requerida por Netlify, se han creado dos scripts:

#### prepare-netlify.sh (para sistemas Unix)
```bash
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
```

#### prepare-netlify.ps1 (para Windows)
```powershell
# Script para preparar la estructura de directorios para Netlify

# 1. Verificar si la compilación Angular se ha completado
if (-not (Test-Path -Path "dist/app")) {
    Write-Error "Error: La carpeta dist/app no existe. Ejecute primero 'npm run build'."
    exit 1
}

# 2. Crear la estructura de directorios necesaria
Write-Host "Creando estructura de directorios para Netlify..."
if (-not (Test-Path -Path "dist/app/browser")) {
    New-Item -ItemType Directory -Path "dist/app/browser" -Force | Out-Null
}

# 3. Copiar todos los archivos de dist/app a dist/app/browser
Write-Host "Copiando archivos a la estructura requerida..."
Get-ChildItem -Path "dist/app" -Exclude "browser" | ForEach-Object {
    if ($_.PSIsContainer) {
        Copy-Item -Path $_.FullName -Destination "dist/app/browser/$($_.Name)" -Recurse -Force
    } else {
        Copy-Item -Path $_.FullName -Destination "dist/app/browser/" -Force
    }
}

# 4. Copiar archivos de configuración de Netlify
Write-Host "Copiando archivos de configuración de Netlify..."
Copy-Item -Path "src/_redirects" -Destination "dist/app/browser/" -Force
Copy-Item -Path "netlify.toml" -Destination "dist/app/browser/" -Force

Write-Host "¡Preparación completada! La estructura está lista para ser desplegada en Netlify."
```

### 4. Actualización de package.json

Se ha agregado un nuevo script en `package.json` para facilitar el proceso de construcción y preparación para Netlify:

```json
"scripts": {
  "ng": "ng",
  "start": "ng serve",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "ng test",
  "netlify-build": "npm run build && powershell -File prepare-netlify.ps1"
}
```

## Pasos para desplegar en Netlify

1. **Preparar la aplicación para producción:**
   ```bash
   npm run netlify-build
   ```
   Este comando:
   - Compila la aplicación con Angular
   - Ejecuta el script de preparación para Netlify que:
     - Crea la estructura de directorios requerida (`dist/app/browser`)
     - Copia todos los archivos necesarios a esa estructura
     - Copia los archivos de configuración (`_redirects` y `netlify.toml`)

2. **Configurar el sitio en Netlify:**
   - Conecta tu repositorio a Netlify
   - En la configuración de despliegue, establece:
     - Directorio de publicación: `dist/app/browser`
     - Comando de construcción: `npm run netlify-build`

3. **Verificar el despliegue:**
   - Asegúrate de que todas las rutas funcionen correctamente, incluyendo la navegación directa a `/exito`, `/login`, etc.
   - Verifica que las redirecciones de API de Mercado Pago funcionen apropiadamente

## Solución de problemas

Si encuentras problemas con el despliegue:

1. Verifica que los archivos `_redirects` y `netlify.toml` estén presentes en la carpeta `dist/app/browser`
2. Asegúrate de que el script `netlify-build` se ejecute correctamente
3. Revisa los logs de despliegue en Netlify para identificar errores específicos
