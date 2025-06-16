import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TwofaService {
  private apiUrl = 'https://back2fa.onrender.com/api/2fa/'; // Cambia esto por la URL real de tu MS

  constructor(private http: HttpClient) {}

  setup2fa(email: string): Observable<any> {
    return this.http.post(this.apiUrl + 'setup/', { email });
  }

  verify2fa(email: string, code: string): Observable<any> {
    return this.http.post(this.apiUrl + 'verify/', { email, code });
  }

  authorizePurchase(email: string, monto: number, titular: string, code?: string): Observable<any> {
    return this.http.post(this.apiUrl + 'authorize/', { email, monto, titular, code });
  }
}
