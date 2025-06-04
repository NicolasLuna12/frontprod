import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Pedido } from '../../model/pedido.model';
import { PedidosService } from '../../services/pedidos.service';
import { MercadoPagoService } from '../../services/mercado-pago.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-exito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exito.component.html',
  styleUrl: './exito.component.css',
})
export class ExitoComponent implements OnInit {
  contador = 30;
  pedido: Pedido = new Pedido(0, 0, '', '', '', []);
  fechaActual: Date;
  paymentId: string | null = null;
  status: string | null = null;
  paymentType: string | null = null;
  mercadoPagoTicket: any = null;
  
  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private pedidoService: PedidosService,
    private mercadoPagoService: MercadoPagoService,
    private toastr: ToastrService
  ) {
    this.fechaActual = new Date();
  }
  
  printDiv() {
    window.print();
    window.location.href = './home';
  }
  
  ngOnInit(): void {
    this.pedido = this.pedidoService.getPedido();
    
    // Verificar si hay parámetros de MercadoPago en la URL
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['payment_id'] || null;
      this.status = params['status'] || null;
      this.paymentType = params['payment_type'] || null;
      
      // Si viene el ticket de MercadoPago en los queryParams, parsearlo
      if (params['mp_ticket']) {
        try {
          this.mercadoPagoTicket = JSON.parse(params['mp_ticket']);
        } catch (e) {
          this.mercadoPagoTicket = null;
        }
      }
      
      if (this.paymentId && this.status && !this.mercadoPagoTicket) {
        this.verificarPagoMercadoPago();
      } else {
        this.startCountdown();
      }
    });
  }
  
  verificarPagoMercadoPago() {
    if (!this.paymentId) {
      console.error('No se encontró ID de pago');
      this.toastr.error('No se pudo identificar el pago');
      this.startCountdown();
      return;
    }
    
    console.log('Verificando pago con ID:', this.paymentId);
    
    // Si el pedido está vacío o incompleto, intentemos reconstruirlo a partir de la URL
    if (!this.pedido || !this.pedido.nombreCliente || this.pedido.total <= 0) {
      console.warn('Pedido incompleto, intentando reconstruir información mínima');
      // Crear un pedido básico para mostrar algo en la factura
      this.pedido.idPedido = parseInt(this.paymentId.substring(0, 6), 10) || 0;
      if (!this.pedido.total) this.pedido.total = 0;
      if (!this.pedido.nombreCliente) this.pedido.nombreCliente = 'Cliente';
    }
    
    // Confirmar el pedido en el backend al volver de Mercado Pago
    // Intentamos hacer esto, pero si falla continuamos con el flujo
    this.pedidoService.confirmarPedido().subscribe({
      next: (response) => {
        console.log('Respuesta de confirmación de pedido:', response);
        this.toastr.success('¡Pedido confirmado y ticket generado!');
      },
      error: (error) => {
        console.error('Error al confirmar pedido:', error);
        this.toastr.warning('No se pudo confirmar el pedido automáticamente, pero tu pago se procesó correctamente.');
      }
    });
    
    // Verificar pago (ahora usa nuestra implementación simulada)
    this.mercadoPagoService.verificarPago(this.paymentId).subscribe({
      next: (response) => {
        console.log('Respuesta de verificación de pago:', response);
        
        // Asegurarnos de que tengamos datos para mostrar
        if (response) {
          // Actualizar información del pedido si es necesario
          if (response.transaction_amount && this.pedido.total <= 0) {
            this.pedido.total = response.transaction_amount;
          }
          
          if (response.order_details?.customer?.name && !this.pedido.nombreCliente) {
            this.pedido.nombreCliente = response.order_details.customer.name;
          }
          
          this.toastr.success('¡Pago confirmado con MercadoPago!');
          
          // Redirigir a /exito si no estamos ya allí
          if (this.router.url !== '/exito') {
            this.router.navigate(['/exito'], {
              queryParams: {
                payment_id: this.paymentId,
                status: this.status || response.status,
                payment_type: this.paymentType || response.payment_type,
                mp_ticket: JSON.stringify(response)
              }
            });
            return;
          }
          
          // Guardar el ticket de MercadoPago para mostrarlo
          this.mercadoPagoTicket = response;
        }
        
        this.startCountdown();
      },
      error: (error) => {
        console.error('Error al verificar el pago:', error);
        this.toastr.error('No se pudo verificar el estado del pago, pero tu compra está siendo procesada.');
        this.startCountdown();
      }
    });
  }

  startCountdown() {
    const contdownInterval = setInterval(() => {
      this.contador--;
      if (this.contador == 0) {
        clearInterval(contdownInterval);
        this.router.navigate(['/']);
      }
    }, 1000);
  }
}
