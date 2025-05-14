# Despliegue en Netlify - Guía de Enrutamiento SPA

## Configuración de redirecciones para aplicaciones Angular

Cuando despliega una aplicación Angular en Netlify, es importante configurar correctamente las redirecciones para que todas las rutas funcionen, incluso cuando se accede directamente a una URL.

### Archivos de configuración importantes

1. **_redirects**: Este archivo en la carpeta `src` contiene las reglas de redirección.
2. **netlify.toml**: Configuración principal de Netlify que también puede incluir reglas de redirección.
3. **angular.json**: Asegúrese de que incluye los archivos de configuración en la sección `assets`.

### Problemas comunes y soluciones

#### Error 404 al acceder directamente a rutas

Si obtiene errores 404 al acceder directamente a rutas como `/exito`, asegúrese de que:

- El archivo `_redirects` tiene la regla correcta: `/* /index.html 200`
- El archivo `_redirects` se está copiando a la carpeta de construcción

#### Reglas específicas para ciertas rutas

Para rutas con requisitos especiales, puede agregar reglas específicas antes de la regla general:

```
/exito    /index.html   200
/*        /index.html   200
```

#### Verificación de despliegue

Después de desplegar, pruebe accediendo directamente a rutas como:
- https://su-sitio.netlify.app/exito
- https://su-sitio.netlify.app/checkout
- https://su-sitio.netlify.app/carrito

### Comandos útiles

Para construir el proyecto y copiar los archivos de configuración:
```
npm run build
```

Para probar localmente con el servidor de desarrollo:
```
npm start
```

## Contacto

Si encuentra problemas con el enrutamiento en producción, asegúrese de revisar las configuraciones de despliegue en el panel de control de Netlify.
