import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../model/pedido.model';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, AfterViewChecked {
  paymentMethod: string = '';
  cardholderName: string = '';
  cardNumber: string = '';
  expiryMonth: string = '';
  expiryYear: string = '';
  cvv: string = '';
  isProcessing: boolean = false;
  pedido: Pedido = new Pedido(0, 0, '', '', '', []);
  mercadoPago: any;
  mpButtonRendered = false;
  preferenceId: string | null = null;

  constructor(
    private router: Router,
    private pedidoService: PedidosService,
    private toastr: ToastrService,
    private http: HttpClient
  ) {}

  async ngOnInit(): Promise<void> {
    this.pedido = this.pedidoService.getPedido();
    // Inicializar Mercado Pago SDK
    if ((window as any).MercadoPago) {
      this.mercadoPago = new (window as any).MercadoPago('APP_USR-15dcbbb0-ed10-4a65-a8ec-4279e83029a4', {
        locale: 'es-AR'
      });
    }
  }

  ngAfterViewChecked(): void {
    // Renderizar el botón solo si corresponde y no está ya renderizado
    if (this.paymentMethod === 'mercadopago' && this.mercadoPago && !this.mpButtonRendered && this.preferenceId) {
      this.renderMercadoPagoButton();
    }
  }

  async onPaymentMethodChange(): Promise<void> {
    if (this.paymentMethod === 'mercadopago') {
      // Llamar al backend para obtener el preferenceId
      try {
        const response: any = await this.http.post('producto/mercadopago/preference/', {
          items: this.pedido.carrito.map(item => ({
            title: item.producto,
            quantity: item.cantidad,
            unit_price: item.precio
          })),
          total: this.pedido.total
        }).toPromise();
        this.preferenceId = response.preferenceId;
        this.mpButtonRendered = false;
      } catch (error) {
        this.toastr.error('No se pudo inicializar Mercado Pago');
      }
    }
  }

  renderMercadoPagoButton() {
    const mpButtonContainer = document.getElementById('mp-button-container');
    if (mpButtonContainer && this.mercadoPago && this.preferenceId) {
      mpButtonContainer.innerHTML = '';
      this.mercadoPago.bricks().create('wallet', 'mp-button-container', {
        initialization: {
          preferenceId: this.preferenceId,
        },
        callbacks: {
          onReady: () => {},
          onError: (error: any) => { console.error(error); },
          onSubmit: () => {},
        }
      });
      this.mpButtonRendered = true;
    }
  }

  onSubmit() {
    this.isProcessing = true;
    if (this.paymentMethod === 'paypal') {
      setTimeout(() => {
        this.finalizarProcesoDePago();
      }, 2000);
    } else if (this.paymentMethod === 'card') {
      setTimeout(() => {
        this.finalizarProcesoDePago();
      }, 2000);
    } else if (this.paymentMethod === 'mercadopago') {
      // El flujo lo maneja el botón nativo de MP
      this.isProcessing = false;
    } else {
      this.toastr.warning('Selecciona un método de pago');
      this.isProcessing = false;
    }
  }

  finalizarProcesoDePago() {
    this.pedidoService.confirmarPedido().subscribe({
      next: () => {
        this.router.navigate(['/exito']);
      },
      error: (error) => {
        this.toastr.error('Error al confirmar pedido. Intente nuevamente.');
        this.isProcessing = false;
      }
    });
  }
}


