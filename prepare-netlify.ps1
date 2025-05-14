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
