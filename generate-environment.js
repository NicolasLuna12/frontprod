#!/usr/bin/env node

// Script para generar environment de producción con variables de entorno
// Se ejecuta en el build de Netlify/Vercel

const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando environment de producción...');

// Leer variables de entorno
const apiBaseUrl = process.env.NG_APP_API_BASE_URL || 'https://backmp.onrender.com/';
const mercadoPagoKey = process.env.NG_APP_MERCADO_PAGO_PUBLIC_KEY || '';
const twoFAApiUrl = process.env.NG_APP_TWOFA_API_URL || 'https://backmp.onrender.com/2fa/';

// Validar variables requeridas
if (!mercadoPagoKey || mercadoPagoKey === 'PLACEHOLDER_MERCADO_PAGO_KEY') {
  console.error('❌ ERROR: NG_APP_MERCADO_PAGO_PUBLIC_KEY no está configurada');
  process.exit(1);
}

// Generar contenido del environment
const environmentContent = `// Environment configuration - Production (Generated)
// Este archivo se genera automáticamente en tiempo de build

export const environment = {
  production: true,
  
  // API Configuration
  apiBaseUrl: '${apiBaseUrl}',
  
  // MercadoPago Configuration
  mercadoPagoPublicKey: '${mercadoPagoKey}',
  
  // Two Factor Authentication
  twoFAApiUrl: '${twoFAApiUrl}',
};

// Generado automáticamente el ${new Date().toISOString()}
`;

// Escribir archivo
const environmentPath = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');
fs.writeFileSync(environmentPath, environmentContent);

console.log('✅ Environment de producción generado correctamente');
console.log(`📁 Archivo: ${environmentPath}`);
console.log(`🌐 API Base URL: ${apiBaseUrl}`);
console.log(`🔑 MercadoPago Key: ${mercadoPagoKey.substring(0, 20)}...`);
console.log(`🔐 2FA API URL: ${twoFAApiUrl}`);
