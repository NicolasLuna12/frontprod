# Configuración para Despliegue en Netlify

Este documento describe la configuración necesaria para desplegar correctamente la aplicación Angular en Netlify, solucionando los problemas de enrutamiento y la estructura de directorios requerida por el plugin `@netlify/angular-runtime`.

## Problemas identificados

### 1. Error 404 al acceder directamente a rutas como /exito

Cuando los usuarios acceden directamente a una ruta específica (por ejemplo, `/exito`), Netlify devuelve un error 404 porque no encuentra el archivo correspondiente. Esto ocurre porque nuestra aplicación es una SPA (Single Page Application) y el enrutamiento se maneja en el lado del cliente.

### 2. Error del plugin @netlify/angular-runtime

El plugin `@netlify/angular-runtime` requiere que el directorio de publicación sea `dist/app/browser`, pero la configuración predeterminada de Angular utiliza `dist/app`.

## Solución implementada

### 1. Archivos de configuración

#### netlify.toml

Este archivo le indica a Netlify cómo debe manejar las redirecciones y qué directorio debe publicar:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false

[build]
  publish = "dist/app/browser"
  command = "npm run netlify-build"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "no-referrer"
    X-Content-Type-Options = "nosniff"
```

#### _redirects

Este archivo se coloca en el directorio `src/` y proporciona reglas de redirección más específicas:

```
# Redirecciones para API de Mercado Pago
/payment/success/*  https://backmp.onrender.com/payment/success/:splat  200
/payment/webhook/*  https://backmp.onrender.com/payment/webhook/:splat  200
/payment/health/*   https://backmp.onrender.com/payment/health/:splat   200

# Rutas específicas para dar prioridad a algunas páginas
/exito              /index.html                                         200
/checkout           /index.html                                         200
/login              /index.html                                         200
/cart               /index.html                                         200
/home               /index.html                                         200

# Redirigir todas las demás rutas a index.html
/*                  /index.html                                         200
```

### 2. Configuración para rutas específicas

Para la ruta `/exito`, se ha implementado un manejo especial:

1. Se creó un archivo HTML estático en `src/exito/index.html` que redirige a la raíz del sitio:
   ```html
   <!DOCTYPE html>
   <html lang="es">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Redirigiendo...</title>
       <script>
           window.location.replace('/');
       </script>
   </head>
   <body>
       <p>Redirigiendo al sitio principal...</p>
   </body>
   </html>
   ```

2. El componente `ExitoComponent` ha sido modificado para manejar el acceso directo mostrando un mensaje apropiado y redirigiendo al usuario cuando se detecta un acceso directo a la página sin un pedido válido.

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
4. Comprueba que la configuración de Angular esté correcta en `angular.json`

## Referencias útiles

- [Documentación oficial de Netlify para SPAs](https://docs.netlify.com/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps)
- [Documentación de Angular para despliegue](https://angular.io/guide/deployment)
- [Plugin @netlify/angular-runtime](https://github.com/netlify/netlify-plugin-angular-universal)
