import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_DATA_KEY = 'userData';
  
  // Tiempo de expiración por defecto (8 horas)
  private readonly DEFAULT_EXPIRATION_TIME = 8 * 60 * 60 * 1000;

  private authStatusSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  authStatus$ = this.authStatusSubject.asObservable();

  constructor() {
    // Verificar expiración de tokens al inicializar
    this.checkTokenExpiration();
    
    // Verificar expiración cada minuto
    setInterval(() => {
      this.checkTokenExpiration();
    }, 60000);
  }

  /**
   * Almacena el token de forma segura con timestamp de expiración
   */
  setToken(token: string, expirationTime?: number): void {
    const expiration = expirationTime || Date.now() + this.DEFAULT_EXPIRATION_TIME;
    const tokenData = {
      token: this.sanitizeToken(token),
      expiration: expiration,
      created: Date.now()
    };
    
    try {
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
      this.authStatusSubject.next(true);
    } catch (error) {
      console.error('Error al almacenar token:', error);
    }
  }

  /**
   * Obtiene el token si es válido y no ha expirado
   */
  getToken(): string | null {
    try {
      const tokenDataStr = localStorage.getItem(this.TOKEN_KEY);
      if (!tokenDataStr) return null;

      const tokenData = JSON.parse(tokenDataStr);
      
      // Verificar si el token ha expirado
      if (Date.now() > tokenData.expiration) {
        this.removeToken();
        return null;
      }

      return tokenData.token;
    } catch (error) {
      console.error('Error al obtener token:', error);
      this.removeToken();
      return null;
    }
  }

  /**
   * Verifica si hay un token válido
   */
  hasValidToken(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Almacena datos de usuario de forma segura
   */
  setUserData(userData: any): void {
    try {
      // Filtrar datos sensibles
      const safeUserData = this.sanitizeUserData(userData);
      localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(safeUserData));
    } catch (error) {
      console.error('Error al almacenar datos de usuario:', error);
    }
  }

  /**
   * Obtiene datos de usuario almacenados
   */
  getUserData(): any {
    try {
      const userDataStr = localStorage.getItem(this.USER_DATA_KEY);
      return userDataStr ? JSON.parse(userDataStr) : null;
    } catch (error) {
      console.error('Error al obtener datos de usuario:', error);
      return null;
    }
  }

  /**
   * Elimina el token y datos relacionados
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.authStatusSubject.next(false);
  }

  /**
   * Limpia todos los datos de autenticación
   */
  clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    localStorage.removeItem('nameUser');
    localStorage.removeItem('emailUser');
    localStorage.removeItem('idUser');
    localStorage.removeItem('direccion');
    localStorage.removeItem('telefono');
    localStorage.removeItem('imagenPerfil');
    
    // Limpiar datos de sesión 2FA
    sessionStorage.removeItem('2fa_active');
    sessionStorage.removeItem('paymentMethod');
    
    this.authStatusSubject.next(false);
  }

  /**
   * Verifica la expiración del token
   */
  private checkTokenExpiration(): void {
    if (!this.hasValidToken()) {
      this.authStatusSubject.next(false);
    }
  }

  /**
   * Sanitiza el token removiendo caracteres peligrosos
   */
  private sanitizeToken(token: string): string {
    // Remover comillas y espacios
    return token.replace(/['"]/g, '').trim();
  }

  /**
   * Sanitiza datos de usuario removiendo información sensible
   */
  private sanitizeUserData(userData: any): any {
    const { password, token, access_token, ...safeData } = userData;
    return safeData;
  }

  /**
   * Valida el formato del token JWT
   */
  isValidTokenFormat(token: string): boolean {
    if (!token) return false;
    
    // Un JWT válido debe tener 3 partes separadas por puntos
    const parts = token.split('.');
    return parts.length === 3;
  }

  /**
   * Obtiene información del payload del JWT (sin validar firma)
   */
  getTokenPayload(token?: string): any {
    try {
      const tokenToUse = token || this.getToken();
      if (!tokenToUse || !this.isValidTokenFormat(tokenToUse)) return null;

      const payload = tokenToUse.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error al decodificar payload del token:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const payload = this.getTokenPayload();
    return payload && payload.roles && payload.roles.includes(role);
  }
}
