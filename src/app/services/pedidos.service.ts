import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { DetallePedido } from '../model/detallePedido.model';
import { Carrito } from '../model/Carrito.model';
import { CarritoComponent } from '../pages/carrito/carrito.component';
import { Pedido } from '../model/pedido.model';


@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  url:string="appCART/";
  private pedido: Pedido = new Pedido(0,0,"","","",[]);


  constructor(private http:HttpClient) { }


  setPedido(pedido: Pedido) {
    this.pedido = pedido;
  }

  getPedido() {
    return this.pedido;
  }

  getPedidos() {
    return this.http.get(this.url + 'pedidos');
  }

  getDetallePedido():Observable <Carrito[]> {

    return this.http.get<Carrito[]>(this.url + 'ver');
  }

  confirmarPedido():Observable<any>{
    const hola={};

    return this.http.post(this.url + 'confirmar/',hola);
  }

  deleteDetallePedido(detalle:Carrito):Observable<void>{


    return this.http.delete<void>(this.url + 'eliminar/'+detalle.id)

  }

  public agregarProducto(product:DetallePedido):Observable<any> {



    return this.http.post(this.url + 'agregar/'+ product.id_producto+'/',product  );
  }
  /**
   * Genera una preferencia de pago en Mercado Pago
   * @param pedido El pedido para el que se generará la preferencia
   * @returns Un observable con la respuesta que incluye init_point (URL de pago)
   */  
  generarPreferenciaMercadoPago(pedido: Pedido): Observable<any> {
    // URL completa del endpoint de creación de preferencia
    const endpoint = 'https://backmobile1.onrender.com/api/producto/mercadopago/preference/';
    
    // Datos para el backend
    const preferenceData = {
      pedidoId: pedido.idPedido,
      descripcion: `Pedido #${pedido.idPedido}`,
      precio: pedido.total,
      cantidad: 1,
      nombreCliente: pedido.nombreCliente,
      email: localStorage.getItem('emailUser') || '',
      redirectUrl: window.location.origin + '/exito'
    };
    
    return this.http.post<any>(endpoint, preferenceData);
  }
    
  // Método alternativo con la URL alternativa para procesar pagos
  generarPreferenciaMercadoPagoAlternativo(pedido: Pedido): Observable<any> {
    // URL alternativa para procesamiento de pagos
    const endpoint = 'https://backmobile1.onrender.com/api/producto/mercadopago/payment/';
    
    // Los mismos datos que el método principal
    const preferenceData = {
      pedidoId: pedido.idPedido,
      descripcion: `Pedido #${pedido.idPedido}`,
      precio: pedido.total,
      cantidad: 1,
      nombreCliente: pedido.nombreCliente,
      email: localStorage.getItem('emailUser') || '',
      redirectUrl: window.location.origin + '/exito'
    };
    
    return this.http.post<any>(endpoint, preferenceData);
  }
}
