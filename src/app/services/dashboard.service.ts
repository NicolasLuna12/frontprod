import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
Observable
HttpClient

export interface IProducto {
nombre_producto: string;
}

export interface IDetalle {
  cantidad_productos: number;
  precio_producto: number;
  subtotal: number;
  producto: IProducto;
}

export interface IPedido {
  id_pedidos: number;
  fecha_pedido: string;
  direccion_entrega: string;
  estado: string;
  detalles: IDetalle[];
}

export interface IPedidosData {
  
    pendientes: IPedido[];
    aprobados: IPedido[];
    entregados: IPedido[];
  

}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Eliminar la baseUrl y usar una ruta relativa que el interceptor completará
  private apiUrl = 'appCART/ver_dashboard/'; // URL relativa que el interceptor completará

  constructor(private http: HttpClient) { }

  obtenerPedidos(): Observable<IPedidosData> {
    return this.http.get<IPedidosData>(this.apiUrl);
  }

  agregarPedido(pedido: IPedido): Observable<IPedido> {
    return this.http.post<IPedido>(this.apiUrl, pedido);
  }

  cancelarPedido(idPedido: number) {
    // Ajusta la URL según tu backend
    return this.http.post(this.apiUrl + 'cancelar/', { id_pedidos: idPedido });
  }

  marcarComoEntregado(idPedido: number) {
    // El interceptor agregará el token automáticamente
    return this.http.put(this.apiUrl + 'entregar/',
      { id_pedidos: idPedido }
    );
  }
}
