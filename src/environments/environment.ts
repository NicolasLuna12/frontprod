// Environment configuration - Development
// Los valores reales se configuran mediante file replacement en angular.json

// Environment configuration - Development
// Los valores reales se configuran mediante file replacement en angular.json

export const environment = {
  production: false,
  
  // API Configuration - Valores por defecto para desarrollo
  apiBaseUrl: 'https://backmobile1.onrender.com/',
  
  // MercadoPago Configuration
  mercadoPagoApiUrl: 'https://backmp.onrender.com/',
  mercadoPagoPublicKey: 'TEST-PLACEHOLDER-KEY',
  
  // Two Factor Authentication
  twoFAApiUrl: 'https://back2fa.onrender.com/api/2fa/',
};

// IMPORTANTE: 
// - Para desarrollo local, crear src/environments/environment.local.ts con tus valores reales
// - Para producción, usar file replacement en angular.json
// - Nunca commitear claves reales en este archivo
