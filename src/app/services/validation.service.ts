import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  /**
   * Valida que una cadena no contenga caracteres peligrosos
   */
  sanitizeString(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+\s*=/gi, '') // Remover event handlers
      .replace(/<[^>]*>/g, '') // Remover HTML tags
      .trim();
  }

  /**
   * Valida formato de email
   */
  isValidEmail(email: string): boolean {
    if (!email) return false;
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  /**
   * Valida código 2FA (6 dígitos numéricos)
   */
  isValidTwoFACode(code: string): boolean {
    if (!code) return false;
    
    const regex = /^[0-9]{6}$/;
    return regex.test(code.trim());
  }

  /**
   * Valida número de teléfono
   */
  isValidPhoneNumber(phone: string): boolean {
    if (!phone) return false;
    
    // Formato internacional básico
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
  }

  /**
   * Valida que una contraseña sea segura
   */
  isValidPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('La contraseña es requerida');
      return { isValid: false, errors };
    }

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe tener al menos una letra mayúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe tener al menos una letra minúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('La contraseña debe tener al menos un número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('La contraseña debe tener al menos un carácter especial');
    }

    // Verificar patrones comunes inseguros
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /admin/i,
      /usuario/i
    ];

    if (commonPatterns.some(pattern => pattern.test(password))) {
      errors.push('La contraseña no debe contener patrones comunes');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida URLs de Mercado Pago
   */
  isValidMercadoPagoUrl(url: string): boolean {
    if (!url) return false;
    
    try {
      const urlObj = new URL(url);
      const validDomains = [
        'mercadopago.com',
        'mercadopago.com.ar',
        'mercadolibre.com',
        'mercadolibre.com.ar',
        'mpago.la',
        'mercadopago.cl',
        'mercadopago.com.mx',
        'mercadopago.com.br',
        'mercadopago.com.co',
        'mercadopago.com.pe',
        'mercadopago.com.uy'
      ];
      
      return urlObj.protocol === 'https:' && 
             validDomains.some(domain => urlObj.hostname.endsWith(domain));
    } catch {
      return false;
    }
  }

  /**
   * Valida formato de nombre/apellido
   */
  isValidName(name: string): boolean {
    if (!name) return false;
    
    // Solo letras, espacios, acentos y guiones
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/;
    return nameRegex.test(name.trim()) && name.trim().length >= 2 && name.trim().length <= 50;
  }

  /**
   * Valida dirección
   */
  isValidAddress(address: string): boolean {
    if (!address) return false;
    
    // Permitir letras, números, espacios y algunos caracteres especiales comunes en direcciones
    const addressRegex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s.,#/-]+$/;
    return addressRegex.test(address.trim()) && address.trim().length >= 5 && address.trim().length <= 200;
  }

  /**
   * Valida que un número sea positivo y dentro de un rango
   */
  isValidAmount(amount: number, min: number = 0, max: number = 1000000): boolean {
    return typeof amount === 'number' && 
           !isNaN(amount) && 
           amount >= min && 
           amount <= max;
  }

  /**
   * Valida ID de usuario (número positivo)
   */
  isValidUserId(userId: string | number): boolean {
    if (!userId) return false;
    
    const id = typeof userId === 'string' ? parseInt(userId) : userId;
    return !isNaN(id) && id > 0;
  }

  /**
   * Escapa caracteres HTML peligrosos
   */
  escapeHtml(text: string): string {
    if (!text) return '';
    
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, (match) => map[match]);
  }

  /**
   * Valida JWT token format (sin verificar firma)
   */
  isValidJWTFormat(token: string): boolean {
    if (!token) return false;
    
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    try {
      // Verificar que cada parte sea base64 válido
      parts.forEach(part => {
        atob(part.replace(/-/g, '+').replace(/_/g, '/'));
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Rate limiting simple en memoria
   */
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  isRateLimited(identifier: string, maxRequests: number = 5, windowMinutes: number = 15): boolean {
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    
    const record = this.rateLimitMap.get(identifier);
    
    if (!record || now > record.resetTime) {
      // Nueva ventana de tiempo o primera solicitud
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return false;
    }
    
    if (record.count >= maxRequests) {
      return true; // Rate limited
    }
    
    record.count++;
    return false;
  }

  /**
   * Limpia el rate limiting para un identificador
   */
  clearRateLimit(identifier: string): void {
    this.rateLimitMap.delete(identifier);
  }
}
