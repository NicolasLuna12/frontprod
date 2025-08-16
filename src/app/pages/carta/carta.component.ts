import { Component, Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../../app/model/producto.model';
import { ProductsService } from '../../services/products.service';
import { FormsModule } from '@angular/forms';
import { PedidosService } from '../../services/pedidos.service';
import { DetallePedido } from '../../model/detallePedido.model';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
declare var bootstrap: any;

@Component({
  selector: 'app-carta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
  ],
  templateUrl: './carta.component.html',
  styleUrl: './carta.component.css',
})
export class CartaComponent implements OnInit {
  @Input() public producto: Producto;
  productos: Producto[] = [];
  cantidadIngresada: number = 1;
  subtotal: number = 0;
  p: number = 1;
  idUser: number = 0;
  filtroCategoria: string = 'todas';
  mostrarCarrito: boolean = true;
  
  // Propiedades para el carrito - PÚBLICO
  public carritoAbierto: boolean = false;
  public cantidadTotalCarrito: number = 0;

  constructor(
    private productService: ProductsService,
    private pedidoService: PedidosService,
    private carritoService: CarritoService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.producto = {
      id_producto: 0,
      nombre_producto: '',
      imageURL: {},
      precio: 0,
      descripcion: '',
      stock: 0,
      id_categoria: 0,
    };
    // Si es admin, ocultar el carrito
    const email = localStorage.getItem('emailUser');
    if (email === 'admin@admin.com') {
      this.mostrarCarrito = false;
    }
  }
  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (productos: Producto[]) => {
        this.productos = productos;
      },
      error: (error) => {
        if (error.status === 0) this.router.navigate(['serverError']);
      },
    });

    // Suscribirse al estado del carrito
    this.carritoService.carritoVisible$.subscribe(visible => {
      this.carritoAbierto = visible;
    });

    // Suscribirse a las actualizaciones del carrito para obtener la cantidad
    this.carritoService.actualizarCarrito$.subscribe(() => {
      this.obtenerCantidadCarrito();
    });

    // Cargar la cantidad inicial del carrito
    this.obtenerCantidadCarrito();
  }

  cargarModal(producto: Producto) {
    if (this.estaLogueado()) {
      this.abrirModal();
      this.producto = producto;
      this.calcularSubtotal();
    } else {
      this.toastr.info('Se requiere el inicio de sesión');
      this.router.navigate(['/login']);
    }
  }

  estaLogueado() {
    return localStorage.getItem('authToken') != null ? true : false;
  }
  calcularSubtotal() {
    this.subtotal = this.producto.precio * this.cantidadIngresada;
  }

  addProducto() {
    if (localStorage.getItem('userId') != null) {
      this.idUser = parseFloat(localStorage.getItem('userId')!);
    }    // Usar la dirección del perfil si está disponible
    let direccionEntrega = '';
    const direccionPerfil = localStorage.getItem('direccion');
    if (direccionPerfil && direccionPerfil.trim() !== '') {
      direccionEntrega = direccionPerfil;
    }
    
    const detallePedido = new DetallePedido(
      this.idUser,
      0,
      this.producto.id_producto,
      this.cantidadIngresada,
      direccionEntrega
    );

    this.pedidoService.agregarProducto(detallePedido).subscribe({
      next: (pedido) => {
        this.carritoService.tiggerActualizarCarrito();
        this.toastr.success(pedido.message);
        this.toggleCarrito();
        this.cerrarModal();
      },
      error: (error) => {
        this.toastr.error('Ocurrió un error inesperado.');

        if (error.status === 0) this.router.navigate(['serverError']);
      },
    });
  }

  toggleCarrito() {
    this.carritoService.tiggerActualizarCarrito();
    this.carritoService.toggleCarrito();
  }

  cerrarModal() {
    const modalElement = document.getElementById('modalCompra');
    if (modalElement) {
      const modalInstance =
        bootstrap.Modal.getInstance(modalElement) ||
        new bootstrap.Modal(modalElement);
      modalInstance.hide();
    }
  }

  abrirModal() {
    const modalElement = document.getElementById('modalCompra');
    if (modalElement) {
      const modalInstance =
        bootstrap.Modal.getInstance(modalElement) ||
        new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  incrementarCantidadModal() {
    this.cantidadIngresada++;
    this.calcularSubtotal();
  }

  decrementarCantidadModal() {
    if (this.cantidadIngresada > 1) {
      this.cantidadIngresada--;
      this.calcularSubtotal();
    }
  }

  cerrarCarrito() {
    // Método para cerrar el carrito si es necesario
    this.carritoService.toggleCarrito();
  }

  obtenerCantidadCarrito(): void {
    if (this.estaLogueado()) {
      this.carritoService.obtenerCarrito().subscribe({
        next: (response) => {
          if (response && response.carrito) {
            this.cantidadTotalCarrito = response.carrito.reduce((total: number, item: any) => {
              return total + (item.cantidad || 0);
            }, 0);
          } else {
            this.cantidadTotalCarrito = 0;
          }
        },
        error: () => {
          this.cantidadTotalCarrito = 0;
        }
      });
    } else {
      this.cantidadTotalCarrito = 0;
    }
  }

  /**
   * Función de seguimiento para optimizar el rendimiento de ngFor
   * @param index Índice del elemento
   * @param product Producto actual
   * @returns ID único del producto
   */
  trackByProductId(index: number, product: Producto): number {
    return product.id_producto;
  }

  get productosFiltrados(): Producto[] {
    if (this.filtroCategoria === 'todas') return this.productos;
    if (this.filtroCategoria === 'empanadas') return this.productos.filter(p => p.id_categoria === 1);
    if (this.filtroCategoria === 'lomos') return this.productos.filter(p => p.id_categoria === 2);
    if (this.filtroCategoria === 'hamburguesas') return this.productos.filter(p => p.id_categoria === 3);
    return this.productos;
  }

  /**
   * Maneja errores de carga de imágenes y muestra una imagen por defecto
   * @param event Evento de error de imagen
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/carta/hamburguesa.webp';
  }
}
