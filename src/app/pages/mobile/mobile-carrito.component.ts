import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-mobile-carrito',
  templateUrl: './mobile-carrito.component.html',
  styleUrls: ['./mobile-carrito.component.css']
})
export class MobileCarritoComponent implements OnInit {
  carrito: any[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private carritoService: CarritoService) {}

  ngOnInit() {
    this.cargarCarrito();
    this.carritoService.actualizarCarrito$.subscribe(() => this.cargarCarrito());
  }

  cargarCarrito() {
    this.loading = true;
    this.carritoService.obtenerCarrito().subscribe({
      next: (data) => {
        this.carrito = data.items || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar el carrito';
        this.loading = false;
      }
    });
  }

  eliminarItem(idCarrito: string) {
    this.carritoService.eliminarItemYActualizar(idCarrito);
  }

  modificarCantidad(idCarrito: string, cantidad: number) {
    if (cantidad > 0) {
      this.carritoService.modificarCantidadYActualizar(idCarrito, cantidad);
    }
  }
}
