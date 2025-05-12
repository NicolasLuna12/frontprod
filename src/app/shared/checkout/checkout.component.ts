import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../model/pedido.model';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

declare var MercadoPago: any;

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
  mercadoPagoPreferenceId: string = '';
  isProcessing: boolean = false;

  pedido:Pedido=new Pedido(0,0,"","","",[]);
  constructor(
    private router: Router, 
    private pedidoService: PedidosService,
    private toastr: ToastrService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.pedido = this.pedidoService.getPedido();
    this.loadMercadoPagoScript();
  }

  loadMercadoPagoScript() {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      this.initMercadoPago();
    };
    document.body.appendChild(script);
  }

  initMercadoPago() {
    // Inicializa Mercado Pago con tu clave pública
    // En un entorno real, esta clave debería venir del backend por seguridad
    try {
      const mp = new MercadoPago('TEST-7ee9b8ce-9be7-49d3-9972-a2ebf1d6d7a9', {
        locale: 'es-AR'
      });
      
      console.log("MercadoPago SDK inicializado correctamente");
    } catch (error) {
      console.error("Error al inicializar MercadoPago SDK:", error);
    }
  }


  onSubmit() {
    this.isProcessing = true;

    if (this.paymentMethod === 'mercadopago') {
      this.procesarPagoMercadoPago();
    } else if (this.paymentMethod === 'paypal') {
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

  procesarPagoMercadoPago() {
    this.isProcessing = true;
    
    // Mostrar mensaje de espera
    this.toastr.info('Preparando el pago con Mercado Pago...', 'Procesando');
    
    console.log('Enviando petición a Mercado Pago con datos:', this.pedido);
    console.log('URL utilizada:', 'https://backmobile1.onrender.com/api/producto/mercadopago/preference/');
    
    this.pedidoService.generarPreferenciaMercadoPago(this.pedido).subscribe({
      next: (response) => {
        console.log('Respuesta de Mercado Pago:', response);
        
        if (response && response.init_point) {
          // Redirigir al usuario a la URL de pago de Mercado Pago
          this.toastr.success('Redirigiendo a Mercado Pago...', 'Éxito');
          
          // Pequeña pausa para permitir que el toast se muestre
          setTimeout(() => {
            window.location.href = response.init_point;
          }, 1000);
        } else {
          console.error('La respuesta no contiene init_point:', response);
          this.toastr.error('La respuesta del servidor no contiene una URL de pago válida', 'Error');
          this.isProcessing = false;
        }
      },
      error: (error) => {
        console.error('Error al generar la preferencia de Mercado Pago:', error);
        
        // Si es un error 404, intentar con la URL alternativa
        if (error.status === 404) {
          this.toastr.info('Intentando con URL alternativa de proceso de pago...', 'Procesando');
          this.intentarConURLAlternativa();
          return;
        }
        
        // Mensaje de error más específico
        let errorMsg = 'Error al procesar el pago. Intente nuevamente.';
        if (error.error && error.error.message) {
          errorMsg = `Error: ${error.error.message}`;
        } else if (error.status === 404) {
          errorMsg = `Error 404: No se pudo contactar al servicio de pagos.`;
        } else if (error.status === 400) {
          errorMsg = 'Datos de pago incorrectos. Verifique la información.';
        }
        
        this.toastr.error(errorMsg, 'Error');
        this.isProcessing = false;
      }
    });
  }
    
  // Método para intentar con la URL alternativa
  intentarConURLAlternativa() {
    console.log('Intentando con URL alternativa para Mercado Pago');
    console.log('URL alternativa: https://backmobile1.onrender.com/api/producto/mercadopago/payment/');
    
    this.pedidoService.generarPreferenciaMercadoPagoAlternativo(this.pedido).subscribe({
      next: (response) => {
        console.log('Respuesta de Mercado Pago (URL alternativa):', response);
        
        if (response && response.init_point) {
          // Redirigir al usuario a la URL de pago de Mercado Pago
          this.toastr.success('Redirigiendo a Mercado Pago...', 'Éxito');
          
          // Pequeña pausa para permitir que el toast se muestre
          setTimeout(() => {
            window.location.href = response.init_point;
          }, 1000);
        } else {
          console.error('La respuesta no contiene init_point (URL alternativa):', response);
          this.toastr.error('La respuesta del servidor no contiene una URL de pago válida', 'Error');
          this.isProcessing = false;
        }
      },
      error: (err) => {
        console.error('Error con URL alternativa:', err);
        
        // Intentar con una tercera URL como último recurso
        if (err.status === 404) {
          this.intentarConTerceraURL();
          return;
        }
        
        this.toastr.error('No se pudo procesar el pago con ninguna de las rutas disponibles. Contacte al soporte.', 'Error');
        this.isProcessing = false;
      }
    });
  }
  
  // Método para intentar con una tercera URL como último recurso
  intentarConTerceraURL() {
    console.log('Intentando con tercera URL para Mercado Pago');
    console.log('Tercera URL: https://backmobile1.onrender.com/api/producto/mercadopago/process-payment/');
    
    // Crear una suscripción manual ya que no tenemos un método en el servicio
    this.http.post('https://backmobile1.onrender.com/api/producto/mercadopago/process-payment/', {
      pedidoId: this.pedido.idPedido,
      descripcion: `Pedido #${this.pedido.idPedido}`,
      precio: this.pedido.total,
      cantidad: 1,
      nombreCliente: this.pedido.nombreCliente,
      email: localStorage.getItem('emailUser') || '',
      redirectUrl: window.location.origin + '/exito'
    }).subscribe({
      next: (response: any) => {
        console.log('Respuesta de Mercado Pago (tercera URL):', response);
        
        if (response && response.init_point) {
          this.toastr.success('Redirigiendo a Mercado Pago...', 'Éxito');
          setTimeout(() => {
            window.location.href = response.init_point;
          }, 1000);
        } else {
          console.error('La respuesta no contiene init_point (tercera URL):', response);
          this.toastr.error('No se pudo generar un enlace de pago válido. Por favor, inténtelo nuevamente más tarde.', 'Error');
          this.isProcessing = false;
        }
      },
      error: (finalErr) => {
        console.error('Error con tercera URL:', finalErr);
        this.toastr.error('Todos los intentos de conexión con el servidor de pagos han fallado. Por favor, contacte al soporte técnico.', 'Error Fatal');
        this.isProcessing = false;
      }
    });
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


