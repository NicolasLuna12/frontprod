// Environment configuration - Development
// Los valores reales se configuran mediante file replacement en angular.json

export const environment = {
  production: false,
  
  // API Configuration - Para desarrollo local
  apiBaseUrl: 'http://localhost:8000/',
  
  // MercadoPago Configuration - PLACEHOLDER (configurar en environment.local.ts)
  mercadoPagoPublicKey: 'TEST-PLACEHOLDER-KEY',
  
  // Two Factor Authentication - Servicio remoto funcionando
  twoFAApiUrl: 'https://back2fa.onrender.com/api/2fa/',
};

// IMPORTANTE: 
// - Para desarrollo local, crear src/environments/environment.local.ts con tus valores reales
// - Para producción, usar file replacement en angular.json
// - Nunca commitear claves reales en este archivo
