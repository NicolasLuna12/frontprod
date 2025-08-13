
# FrontProd

FrontProd es una aplicación web desarrollada con Angular, diseñada para ofrecer una experiencia moderna, rápida y responsiva. El proyecto incluye funcionalidades avanzadas como autenticación, carrito de compras, integración con Mercado Pago, traducción automática, panel de administración y mucho más.

## 🔧 Configuración de Variables de Entorno

### **DESARROLLO LOCAL:**

1. **Crear archivo de configuración local:**
   ```bash
   cp src/environments/environment.local.ts.example src/environments/environment.local.ts
   ```

2. **Editar `src/environments/environment.local.ts` con tus valores reales:**
   ```typescript
   export const environment = {
     production: false,
     apiBaseUrl: 'https://tu-backend.com/',
     mercadoPagoPublicKey: 'APP_USR-TU-CLAVE-REAL',
     twoFAApiUrl: 'https://tu-backend.com/2fa/',
   };
   ```

### **PRODUCCIÓN (Netlify/Vercel):**

1. **Configurar variables de entorno en tu plataforma:**
   ```bash
   NG_APP_API_BASE_URL=https://tu-backend.com/
   NG_APP_MERCADO_PAGO_PUBLIC_KEY=APP_USR-TU-NUEVA-CLAVE
   NG_APP_TWOFA_API_URL=https://tu-backend.com/2fa/
   ```

2. **El script automáticamente generará el environment de producción**

### ⚠️ **SEGURIDAD IMPORTANTE:**
- `environment.local.ts` está en `.gitignore` y NO se sube al repositorio
- Genera una nueva clave de MercadoPago (la anterior fue expuesta)
- Los archivos base (`environment.ts`, `environment.prod.ts`) son seguros para commitear

## Características principales

- **Framework:** Angular
- **Gestión de usuarios:** Registro, login, perfil, autenticación 2FA
- **Carrito de compras:** Añadir, eliminar y modificar productos
- **Panel de administración:** Gestión de productos y pedidos
- **Integración de pagos:** Mercado Pago
- **Traducción automática:** Google Translate y traducción directa
- **Sistema de comentarios y contacto**
- **Dashboard de usuario**
- **Página de éxito y error personalizada**
- **Soporte multilenguaje:** Español, Inglés, Portugués
- **Diseño responsivo y moderno**
- **Chatbot integrado**
- **Rutas protegidas y guards**
- **Carga y gestión de imágenes**
- **Documentación y configuración modular**

## Estructura del proyecto

```
src/
  app/
	 pages/                # Páginas principales (home, carta, carrito, perfil, admin, etc.)
	 services/             # Servicios (auth, productos, pedidos, pagos, traducción, etc.)
	 model/                # Modelos de datos
	 shared/               # Componentes compartidos (header, footer, nav, checkout, chatbot, etc.)
	 interceptors/         # Interceptores HTTP (auth)
	 docs/                 # Documentación y configuración extra
	 assets/               # Imágenes, íconos, datos, estilos, etc.
```

## Instalación

1. Clona el repositorio:
	```bash
	git clone https://github.com/NicolasLuna12/frontprod.git
	cd frontprod
	```

2. Instala las dependencias:
	```bash
	npm install
	```

3. Inicia el servidor de desarrollo:
	```bash
	npm start
	```

4. Accede a la aplicación en [http://localhost:4200](http://localhost:4200)

## Scripts útiles

- `npm start` - Inicia la aplicación en modo desarrollo
- `npm test` - Ejecuta los tests unitarios
- `npm run build` - Compila la aplicación para producción

## Configuración adicional

- **Base de datos simulada:** El archivo `db.json` permite simular una API REST con [json-server](https://github.com/typicode/json-server).
- **Netlify:** Configuración para despliegue automático en Netlify (`netlify.toml`).
- **Redirecciones:** Archivo `_redirects` para manejo de rutas en producción.

## Contribuir

¡Las contribuciones son bienvenidas! Por favor, abre un issue o envía un pull request con tus mejoras o sugerencias.

## Créditos

Desarrollado por el equipo de FrontProd. Imágenes y recursos por [NicolasLuna12](https://github.com/NicolasLuna12) y colaboradores.

## Licencia

Este proyecto está bajo la licencia MIT.
