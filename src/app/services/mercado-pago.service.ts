import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { PedidosService } from './pedidos.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  private apiUrl = environment.apiBaseUrl + 'appCART/';
  private mercadoPagoUrl = environment.mercadoPagoApiUrl;

  constructor(
    private http: HttpClient,
    private pedidoService: PedidosService
  ) { }

  /**
   * Crea una preferencia de pago en MercadoPago
   * @returns Observable con la URL de pago (init_point)
   */
  crearPreferencia(): Observable<any> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return new Observable(observer => {
        observer.error({ message: 'No se encontró el token de autenticación' });
        observer.complete();
      });
    }
    
    // Eliminar comillas si las hay
    const cleanToken = token.replace(/"/g, '');
    
    // Obtener el pedido del servicio
    const pedido = this.pedidoService.getPedido();
    
    if (!pedido || !pedido.carrito || pedido.carrito.length === 0) {
      return new Observable(observer => {
        observer.error({ message: 'No hay items en el carrito' });
        observer.complete();
      });
    }
    
    // Preparar items para MercadoPago
    const items = pedido.carrito.map(item => {
      return {
        title: item.producto,
        quantity: item.cantidad,
        unit_price: item.precio,
        currency_id: 'ARS',
        id: item.id.toString()
      };
    });
    
    // Preparar payload según lo que espera el backend
    const email = pedido.email || localStorage.getItem('emailUser') || undefined;
    const payload: any = {
      user_token: cleanToken
    };
    if (email) {
      payload.email = email;
    }
    
    // Configurar headers para la solicitud
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${cleanToken}`);
    
    // Llamar al endpoint para crear preferencia de pago
  return this.http.post<any>(`${this.mercadoPagoUrl}payment/create-preference/`, payload, { 
      headers: headers
    }).pipe(
      map((response: any) => {
        // Procesar respuesta de MercadoPago
        if (!response.init_point) {
          // Verificar diferentes estructuras de respuesta
          if (response.body && response.body.init_point) {
            response.init_point = response.body.init_point;
          } else if (response.data && response.data.init_point) {
            response.init_point = response.data.init_point;
          } else if (response.response && response.response.init_point) {
            response.init_point = response.response.init_point;
          } else if (response.sandbox_init_point) {
            response.init_point = response.sandbox_init_point;
          } else if (response.payment_request_id) {
            // Construir URL usando payment_request_id
            if (response.payment_request_id.includes('-')) {
              response.init_point = `https://www.mercadopago.com.ar/checkout/v1/redirect?payment-id=${response.payment_request_id}`;
            } else {
              response.init_point = `https://www.mercadopago.com.ar/checkout/v1/redirect?preference-id=${response.payment_request_id}`;
            }
          }
        }
        
        // Extraer ID si no existe
        if (!response.id) {
          if (response.body && response.body.id) {
            response.id = response.body.id;
          } else if (response.data && response.data.id) {
            response.id = response.data.id;
          } else if (response.preference_id) {
            response.id = response.preference_id;
          } else if (response.payment_request_id) {
            response.id = response.payment_request_id;
          }
        }
        
        return response;
      }),
      catchError((error: any) => {
        if (!environment.production) {
          console.error('Error completo de MercadoPago:', error);
          if (error.error && error.error.detail) {
            console.error('Detalle del error:', error.error.detail);
          }
        }
        throw error;
      })
    );
  }
  
  /**
   * Verifica el estado del servicio de MercadoPago
   */
  verificarServicio(): Observable<any> {
    return this.http.get<any>(`${this.mercadoPagoUrl}payment/health/`);
  }

  /**
   * Verifica el estado de un pago de MercadoPago
   */
  verificarPago(paymentId: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
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
      headers: headers
    });
  }

  /**
   * Verifica pago usando payment request ID
   */
  verificarPagoConRequestId(paymentRequestId: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return new Observable(observer => {
        observer.error({ message: 'No se encontró el token de autenticación' });
        observer.complete();
      });
    }
    
    const cleanToken = token.replace(/"/g, '');
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${cleanToken}`);
    
    return this.http.get<any>(`${this.mercadoPagoUrl}payment/request/${paymentRequestId}/`, { 
      headers: headers
    }).pipe(
      map((response: any) => {
        // Solo log en desarrollo
        if (!environment.production) {
          console.log('Respuesta de verificación con payment_request_id:', response);
        }
        
        if (response && response.payment_url) {
          response.redirectUrl = response.payment_url;
        } else if (response && response.init_point) {
          response.redirectUrl = response.init_point;
        }
        
        return response;
      })
    );
  }

  /**
   * Recibe notificaciones de MercadoPago vía webhook
   */
  recibirWebhook(data: any): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    
    return this.http.post<any>(`${this.mercadoPagoUrl}payment/webhook/`, data, { 
      headers: headers
    });
  }

  /**
   * Consulta estado de PaymentRequest por UUID
   */
  consultarEstadoPaymentRequest(paymentRequestId: string) {
    const url = `${this.mercadoPagoUrl}${paymentRequestId}/`;
    return this.http.get<any>(url);
  }
}
