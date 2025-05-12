import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../model/pedido.model';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  paymentMethod: string = '';
  cardholderName: string = '';
  cardNumber: string = '';
  expiryMonth: string = '';
  expiryYear: string = '';
  cvv: string = '';
  isProcessing: boolean = false;

  pedido: Pedido = new Pedido(0, 0, "", "", "", []);
  
  constructor(
    private router: Router, 
    private pedidoService: PedidosService,
    private toastr: ToastrService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.pedido = this.pedidoService.getPedido();
  }

  onSubmit() {
    this.isProcessing = true;

    if (this.paymentMethod === 'paypal') {
      console.log('Procesando pago con PayPal');

      setTimeout(() => {
        console.log('Pago con PayPal exitoso');
        this.finalizarProcesoDePago();
      }, 2000);
    } else if (this.paymentMethod === 'card') {
      console.log('Procesando pago con tarjeta de crédito');

      setTimeout(() => {
        console.log('Pago con tarjeta de crédito exitoso');
        this.finalizarProcesoDePago();
      }, 2000);
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
        console.error('Error al confirmar pedido:', error);
        this.toastr.error('Error al confirmar pedido. Intente nuevamente.');
        this.isProcessing = false;
      }
    });
  }
}


