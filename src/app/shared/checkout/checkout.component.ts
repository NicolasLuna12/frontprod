import { CommonModule } from '@angular/common';
import { Component, OnInit, OnChanges, DoCheck } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../model/pedido.model';

declare var MercadoPago: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, OnChanges, DoCheck {
  paymentMethod: string = '';
  cardholderName: string = '';
  cardNumber: string = '';
  expiryMonth: string = '';
  expiryYear: string = '';
  cvv: string = '';
  preferenceId: string = '';
  mpRendered: boolean = false;
  mpLoading: boolean = false;
  mpError: string = '';

  pedido: Pedido = new Pedido(0, 0, "", "", "", []);
  constructor(private router: Router, private pedidoService: PedidosService) { }

  ngOnInit(): void {
    this.pedido = this.pedidoService.getPedido();
  }

  ngOnChanges() {
    if (this.paymentMethod === 'mercadopago') {
      this.initMercadoPagoFlow();
    }
  }

  ngDoCheck() {
    // Renderiza MercadoPago solo si se selecciona y no está renderizado
    if (this.paymentMethod === 'mercadopago' && !this.mpRendered) {
      this.initMercadoPagoFlow();
      this.mpRendered = true;
    }
    // Si cambia a otro método, limpia el renderizado
    if (this.paymentMethod !== 'mercadopago' && this.mpRendered) {
      const mpDiv = document.getElementById('mp-checkout');
      if (mpDiv) mpDiv.innerHTML = '';
      this.mpRendered = false;
    }
  }

  async initMercadoPagoFlow() {
    this.mpLoading = true;
    this.mpError = '';
    const items = this.pedido.carrito?.map((item: any) => ({
      title: item.producto ? String(item.producto) : 'Producto de ejemplo',
      quantity: item.cantidad ? Number(item.cantidad) : 1,
      currency_id: 'ARS',
      unit_price: item.precio ? Number(item.precio) : 1
    })) || [];
    const body = items.length > 0 ? { items } : {
      items: [{ title: 'Producto de ejemplo', quantity: 1, currency_id: 'ARS', unit_price: 100 }]
    };
    try {
      const res = await fetch('https://backmobile1.onrender.com/api/producto/mercadopago/preference/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)      });
      const data = await res.json();
      console.log('Respuesta backend MercadoPago:', data); // <-- LOG AGREGADO
      this.preferenceId = data.preferenceId || data.preference_id;
      console.log('ID de preferencia:', this.preferenceId);
      if (!this.preferenceId) throw new Error('No se pudo obtener la preferencia de MercadoPago');
      if (!(window as any).MercadoPago) {
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.onload = () => this.initMercadoPago();
        document.body.appendChild(script);
      } else {
        this.initMercadoPago();
      }
    } catch (err: any) {
      this.mpError = 'Error al inicializar MercadoPago: ' + (err.message || err);
      const mpDiv = document.getElementById('mp-checkout');
      if (mpDiv) mpDiv.innerHTML = '';    } finally {
      this.mpLoading = false;
    }
  }

  initMercadoPago() {
    // Asegúrate de que esta Public Key esté en modo Sandbox
    const mp = new MercadoPago('TEST-c09738c0-d908-4be3-a4b2-553792940e79', { locale: 'es-AR' });
    
    mp.checkout({
      preference: { id: this.preferenceId },
      render: { 
        container: '#mp-checkout', 
        label: 'Pagar con MercadoPago',
        customization: {
          visual: {
            buttonBackground: '#009ee3',
            borderRadius: '6px',
          },
          texts: {
            action: 'pay',
            valueProp: 'security_details',
          }
        }
      },
      autoOpen: false, // Evita abrir automáticamente
      onSubmit: () => {}, // No usado
      onReady: () => {}, // No usado
      onError: (error: any) => {
        this.mpError = 'Error en el widget de MercadoPago: ' + (error?.message || error);
      },
      onReturn: (data: any) => {
        // Callback de éxito/cancelación
        if (data?.status === 'approved' || data?.collection_status === 'approved') {
          this.pedidoService.confirmarPedido().subscribe({
            next: () => {},
            error: (error) => { console.error(error); },
          });
          this.router.navigate(['/exito']);
        } else if (data?.status === 'rejected' || data?.collection_status === 'rejected') {
          this.mpError = 'El pago fue rechazado por MercadoPago. Intenta nuevamente o elige otro método.';
        } else if (data?.status === 'null' || data?.collection_status === 'null' || data == null) {
          this.mpError = 'El pago fue cancelado o no se completó.';
        }
      }
    });
  }

  onSubmit() {
    if (this.paymentMethod === 'mercadopago') {
      if (this.mpLoading) return; // Evita submit mientras carga
      if (this.mpError) return; // Evita submit si hay error
      const mpButton = document.querySelector('#mp-checkout button, #mp-checkout iframe');
      if (mpButton) {
        (mpButton as HTMLElement).click();
        return; // No navegar a éxito ni confirmar pedido aquí
      }
    }
    if (this.paymentMethod === 'paypal') {
      console.log('Procesando pago con PayPal');
      setTimeout(() => {
        console.log('Pago con PayPal exitoso');
        this.pedidoService.confirmarPedido().subscribe({
          next: () => {},
          error: (error) => {
            console.error(error);
          },
        });
        this.router.navigate(['/exito']);
      }, 2000);
    } else if (this.paymentMethod === 'card') {
      console.log('Procesando pago con tarjeta de crédito');
      setTimeout(() => {
        console.log('Pago con tarjeta de crédito exitoso');
        this.pedidoService.confirmarPedido().subscribe({
          next: () => {},
          error: (error) => {
            console.error(error);
          },
        });
        this.router.navigate(['/exito']);
      }, 2000);
    } else {
      console.log('Selecciona un método de pago');
    }
  }

}


