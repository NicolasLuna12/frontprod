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
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    // Agregar token de autorización si existe
    if (token) {
      return headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  setup2fa(email: string): Observable<any> {
    // Enviando solicitud setup2fa
    const headers = this.getHeaders();
    const url = this.apiUrl + 'setup/';
    console.log('TwofaService: Enviando petición a:', url);
    return this.http.post(url, { email }, { headers }).pipe(
      catchError(err => {
        console.error('Error en setup2fa:', err);
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
