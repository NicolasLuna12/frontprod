import { CommonModule } from '@angular/common';
import { Component, OnInit, OnChanges } from '@angular/core';
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
export class CheckoutComponent implements OnInit, OnChanges {
  paymentMethod: string = '';
  cardholderName: string = '';
  cardNumber: string = '';
  expiryMonth: string = '';
  expiryYear: string = '';
  cvv: string = '';
  preferenceId: string = '';

  pedido: Pedido = new Pedido(0, 0, "", "", "", []);
  constructor(private router: Router, private pedidoService: PedidosService) { }

  ngOnInit(): void {
    this.pedido = this.pedidoService.getPedido();
    if (this.paymentMethod === 'mercadopago') {
      this.initMercadoPagoFlow();
    }
  }

  ngOnChanges() {
    if (this.paymentMethod === 'mercadopago') {
      this.initMercadoPagoFlow();
    }
  }

  initMercadoPagoFlow() {
    fetch('http://localhost:3000/api/crear-preferencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: this.pedido.carrito?.map((item: any) => ({
          title: item.producto,
          quantity: item.cantidad,
          unit_price: item.precio
        })) || []
      })
    })
      .then(res => res.json())
      .then(data => {
        this.preferenceId = data.preferenceId;
        if (!(window as any).MercadoPago) {
          const script = document.createElement('script');
          script.src = 'https://sdk.mercadopago.com/js/v2';
          script.onload = () => this.initMercadoPago();
          document.body.appendChild(script);
        } else {
          this.initMercadoPago();
        }
      });
  }

  initMercadoPago() {
    const mp = new MercadoPago('TEST-05849f07-bb39-4db6-8f18-cfb98bd99a98', { locale: 'es-AR' });
    mp.checkout({
      preference: { id: this.preferenceId },
      render: { container: '#mp-checkout', label: 'Pagar con MercadoPago' }
    });
  }

  onSubmit() {
    if (this.paymentMethod === 'paypal') {
      console.log('Procesando pago con PayPal');

      setTimeout(() => {
        console.log('Pago con PayPal exitoso');

      }, 2000);
    } else if (this.paymentMethod === 'card') {
      console.log('Procesando pago con tarjeta de crédito');

      setTimeout(() => {
        console.log('Pago con tarjeta de crédito exitoso');

      }, 2000);
    } else {
      console.log('Selecciona un método de pago');
    }
    this.pedidoService.confirmarPedido().subscribe({
      next: () => {},
      error: (error) => {
        console.error(error);
      },
    });
    this.router.navigate(['/exito']);
  }

}


