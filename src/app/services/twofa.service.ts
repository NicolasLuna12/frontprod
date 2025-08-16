import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TwofaService {
  private apiUrl = environment.twoFAApiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    console.log('Token encontrado:', token ? 'SÍ' : 'NO');
    console.log('Token (primeros 20 chars):', token ? token.substring(0, 20) + '...' : 'null');
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    // Agregar token de autorización si existe
    if (token) {
      const headersWithAuth = headers.set('Authorization', `Bearer ${token}`);
      console.log('Headers con Authorization:', headersWithAuth.get('Authorization') ? 'SÍ' : 'NO');
      return headersWithAuth;
    }
    
    console.log('Headers sin Authorization (no hay token)');
    return headers;
  }

  setup2fa(email: string): Observable<any> {
    // Enviando solicitud setup2fa
    const headers = this.getHeaders();
    const url = this.apiUrl + 'setup/';
    console.log('TwofaService: Enviando petición a:', url);
    console.log('TwofaService: Con email:', email);
    console.log('TwofaService: Headers:', headers);
    
    return this.http.post(url, { email }, { headers }).pipe(
      catchError(err => {
        console.error('Error en setup2fa:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        throw err;
      })
    );
  }

  verify2fa(email: string, code: string): Observable<any> {
    // Enviando solicitud verify2fa
    const headers = this.getHeaders();
    return this.http.post(this.apiUrl + 'verify/', { email, code }, { headers }).pipe(
      catchError(err => {
        console.error('Error en verify2fa:', err);
        throw err;
      })
    );
  }

  authorizePurchase(email: string, monto: number, titular: string): Observable<any> {
    // Enviando solicitud authorizePurchase
    const headers = this.getHeaders();
    const url = this.apiUrl + 'authorize/';
    console.log('TwofaService: Enviando petición authorize a:', url);
    return this.http.post(url, { email, monto, titular }, { headers }).pipe(
      catchError(err => {
        console.error('Error en authorizePurchase:', err);
        throw err;
      })
    );
  }
}
