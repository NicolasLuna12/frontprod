# Solución para desplegar en Netlify

Hemos simplificado la configuración para solucionar los problemas de despliegue en Netlify. Aquí están los cambios realizados:

## 1. Configuración de Netlify (netlify.toml)

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build]
  publish = "dist/app/browser"
  command = "npm run build && npm run postbuild"
```

## 2. Scripts en package.json

```json
"scripts": {
  "ng": "ng",
  "start": "ng serve",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "ng test",
  "postbuild": "mkdir -p dist/app/browser && cp -r dist/app/* dist/app/browser/ && cp src/_redirects dist/app/browser/"
}
```

## 3. Archivo _redirects simplificado

```
# Redirecciones para API de Mercado Pago
/payment/success/*  https://backmp.onrender.com/payment/success/:splat  200
/payment/webhook/*  https://backmp.onrender.com/payment/webhook/:splat  200
/payment/health/*   https://backmp.onrender.com/payment/health/:splat   200

# Redireccionar todas las rutas a index.html (SPA)
/*  /index.html  200
```

## 4. Configuración de angular.json

Hemos agregado `src/netlify.toml` a los assets para que se incluya en la compilación.

## Cómo desplegar

1. Sube estos cambios a tu repositorio
2. En Netlify:
   - Conecta tu repositorio
   - El directorio de publicación debe ser: `dist/app/browser`
   - El comando de build debe ser: `npm run build && npm run postbuild`

Esta configuración simplifica el proceso usando los comandos básicos de bash que están disponibles en el entorno de Netlify, evitando problemas con PowerShell y scripts personalizados.

## Solución de problemas

Si sigues teniendo problemas, puedes intentar:

1. En Netlify, ir a **Site settings** > **Build & deploy** > **Environment**
2. Añadir una variable de entorno: `NPM_FLAGS = "--legacy-peer-deps"`
3. Reintentar el despliegue
