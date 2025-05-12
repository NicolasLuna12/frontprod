// MercadoPagoService para crear preferencia y obtener init_point
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MercadoPagoService {
  private endpoint = 'api/producto/mercadopago/preference/';

  constructor(private http: HttpClient) {}

  crearPreferencia(pedido: any): Observable<any> {
    // Solo reenvía el pedido tal cual, sin lógica de Mercado Pago
    return this.http.post<any>(this.endpoint, pedido);
  }
}
