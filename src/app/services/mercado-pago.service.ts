import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  private apiUrl = 'appCART/';
  private mercadoPagoUrl = 'http://127.0.0.1:8000/';

  constructor(private http: HttpClient) { }

  /**
   * Crea una preferencia de pago en MercadoPago
   * @returns Observable con la URL de pago (init_point)
   */
  crearPreferencia(): Observable<any> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No se encontró el token de autenticación');
      return new Observable(observer => {
        observer.error({ message: 'No se encontró el token de autenticación' });
        observer.complete();
      });
    }
    
    // Eliminar comillas si las hay
    const cleanToken = token.replace(/"/g, '');
    
    // Preparar payload para la solicitud
    const payload = {
      user_token: cleanToken
      // El email se puede obtener del servicio de autenticación o del usuario logueado
      // si no está disponible, el backend lo manejará
    };
    
    // Configurar headers para la solicitud
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${cleanToken}`);
    
    // Llamar al endpoint para crear preferencia de pago
    return this.http.post<any>(`${this.mercadoPagoUrl}payment/create-preference/`, payload, { 
      headers: headers,
      withCredentials: true
    });
  }
  
  /**
   * Verifica el estado del servicio de MercadoPago
   * @returns Observable con el estado del servicio
   */
  verificarServicio(): Observable<any> {
    return this.http.get<any>(`${this.mercadoPagoUrl}health/`);
  }

  /**
   * Verifica el estado de un pago de MercadoPago
   * @param paymentId ID del pago de MercadoPago
   * @returns Observable con el estado del pago
   */
  verificarPago(paymentId: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No se encontró el token de autenticación');
      return new Observable(observer => {
        observer.error({ message: 'No se encontró el token de autenticación' });
        observer.complete();
      });
    }
    
    const cleanToken = token.replace(/"/g, '');
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${cleanToken}`);
    
    return this.http.get<any>(`${this.mercadoPagoUrl}payment/status/${paymentId}/`, { 
      headers: headers,
      withCredentials: true
    });
  }

  /**
   * Recibe notificaciones de MercadoPago vía webhook
   * @param data Datos de la notificación
   * @returns Observable con la respuesta del servidor
   */
  recibirWebhook(data: any): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    
    return this.http.post<any>(`${this.mercadoPagoUrl}payment/webhook/`, data, { 
      headers: headers,
      withCredentials: true
    });
  }
}
