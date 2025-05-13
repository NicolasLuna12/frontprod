import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { PedidosService } from './pedidos.service';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {  private apiUrl = 'appCART/';
  private mercadoPagoUrl = 'http://127.0.0.1:8000/';

  constructor(
    private http: HttpClient,
    private pedidoService: PedidosService
  ) { }/**
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
      // Obtener el pedido del servicio
    const pedido = this.pedidoService.getPedido();
    
    if (!pedido || !pedido.carrito || pedido.carrito.length === 0) {
      console.error('No hay items en el carrito');
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
    });    // Preparar payload para la solicitud
    const email = pedido.email || localStorage.getItem('emailUser') || 'usuario@ejemplo.com';
    
    const payload = {
      user_token: cleanToken,
      email: email,
      items: items,
      payer: {
        name: pedido.nombreCliente.split(' ')[0] || 'Cliente',
        surname: pedido.nombreCliente.split(' ')[1] || 'Anónimo',
        email: email,
        address: {
          street_name: pedido.direccion || 'Dirección no especificada'
        }
      },
      back_urls: {
        success: window.location.origin + '/exito',
        failure: window.location.origin + '/checkout',
        pending: window.location.origin + '/exito'
      },
      auto_return: 'approved',
      external_reference: pedido.idPedido.toString() || Date.now().toString()
    };
    
    console.log('Enviando solicitud a MercadoPago:', payload);
    
    // Configurar headers para la solicitud
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${cleanToken}`);
      // Llamar al endpoint para crear preferencia de pago
    console.log('URL del endpoint:', `${this.mercadoPagoUrl}payment/create-preference/`);
    console.log('Headers enviados:', headers);
      return this.http.post<any>(`${this.mercadoPagoUrl}payment/create-preference/`, payload, { 
      headers: headers
    }).pipe(
      catchError((error: any) => {
        console.error('Error completo de MercadoPago:', error);
        if (error.error && error.error.detail) {
          console.error('Detalle del error:', error.error.detail);
        }
        throw error;
      })
    );
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
      });    }
      const cleanToken = token.replace(/"/g, '');
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${cleanToken}`);
    
    return this.http.get<any>(`${this.mercadoPagoUrl}payment/status/${paymentId}/`, { 
      headers: headers
    });
  }

  /**
   * Recibe notificaciones de MercadoPago vía webhook
   * @param data Datos de la notificación
   * @returns Observable con la respuesta del servidor
   */
  recibirWebhook(data: any): Observable<any> {    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    
    return this.http.post<any>(`${this.mercadoPagoUrl}payment/webhook/`, data, { 
      headers: headers
    });
  }
}
