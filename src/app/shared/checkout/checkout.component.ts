import { CommonModule } from '@angular/common';
import { Component, OnInit, OnChanges, DoCheck, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../model/pedido.model';

declare var MercadoPago: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, OnChanges, DoCheck, AfterViewInit {
  @ViewChild('paymentBrick') paymentBrick!: ElementRef;
  
  paymentMethod: string = '';
  cardholderName: string = '';
  cardNumber: string = '';
  expiryMonth: string = '';
  expiryYear: string = '';
  cvv: string = '';
  mpRendered: boolean = false;
  mpLoading: boolean = false;
  mpError: string = '';
  
  // Mercado Pago Variables
  brickLoaded: boolean = false;
  brickError: string = '';
  renderBrick: any = null;
  settings: any = null;
  preferenceId: string = '';

  pedido: Pedido = new Pedido(0, 0, "", "", "", []);
  constructor(private router: Router, private pedidoService: PedidosService) { }

  ngOnInit(): void {
    this.pedido = this.pedidoService.getPedido();
  }

  ngAfterViewInit(): void {
    // Inicializar Mercado Pago si se selecciona como método de pago
    if (this.paymentMethod === 'mercadopago') {
      this.loadMercadoPagoSDK();
    }
  }

  ngOnChanges() {
    if (this.paymentMethod === 'mercadopago') {
      this.loadMercadoPagoSDK();
    }
  }
  ngDoCheck() {
    // Renderiza MercadoPago solo si se selecciona y no está renderizado
    if (this.paymentMethod === 'mercadopago' && !this.mpRendered) {
      this.loadMercadoPagoSDK();
      this.mpRendered = true;
    }
    // Si cambia a otro método, limpia el renderizado
    if (this.paymentMethod !== 'mercadopago' && this.mpRendered) {
      const mpDiv = document.getElementById('mp-checkout');
      if (mpDiv) mpDiv.innerHTML = '';
      this.mpRendered = false;
      this.brickLoaded = false;
      this.mpError = '';
      this.brickError = '';
    }
  }

  // Cargar el SDK de Mercado Pago
  loadMercadoPagoSDK() {
    this.mpLoading = true;
    this.mpError = '';
    
    if (!(window as any).MercadoPago) {
      // Cargar el SDK si no está disponible
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => this.initPaymentBrick();
      document.body.appendChild(script);
    } else {
      // Si ya está cargado, inicializar directamente
      this.initPaymentBrick();
    }
  }
  // Inicializar el Payment Brick de Mercado Pago
  async initPaymentBrick() {
    try {
      // Primero, obtener una preferencia de pago del backend
      await this.createPaymentPreference();
      
      // Luego inicializar el SDK con tu clave pública
      const mp = new MercadoPago('TEST-c09738c0-d908-4be3-a4b2-553792940e79', {
        locale: 'es-AR'
      });

      // Renderizar el brick de pago
      const brickBuilder = mp.bricks();
      
      // Configuración del Payment Brick
      this.renderBrick = async () => {
        const settings = {
          initialization: {
            amount: this.pedido.total,
            preferenceId: this.preferenceId,
            payer: {
              email: localStorage.getItem('emailUser') || 'test_user@example.com',
            }
          },
          callbacks: {
            onReady: () => {
              console.log('Brick listo para usar');
              this.brickLoaded = true;
              this.mpLoading = false;
            },
            onSubmit: (formData: any) => {
              // Callback llamado al hacer clic en el botón de pago
              return new Promise<void>((resolve, reject) => {
                // Aquí sólo manejamos la UI, el pago real se procesa en el backend
                console.log('Procesando pago con Mercado Pago...', formData);
                
                fetch('https://backmobile1.onrender.com/api/producto/mercadopago/process-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({                    formData: formData,
                    preferenceId: this.preferenceId,
                    userId: localStorage.getItem('userId') || '',
                    pedidoId: this.pedido.idPedido || 0
                  })
                })
                .then(response => response.json())
                .then(result => {
                  if (result.status === 'approved' || result.collection_status === 'approved') {
                    this.pedidoService.confirmarPedido().subscribe({
                      next: () => {
                        resolve();
                        this.router.navigate(['/exito']);
                      },
                      error: (error: any) => {
                        console.error(error);
                        reject();
                      }
                    });
                  } else if (result.status === 'rejected') {
                    this.mpError = 'El pago fue rechazado. Por favor, intenta con otro método de pago.';
                    reject();
                  } else {
                    resolve();
                  }
                })
                .catch(error => {
                  this.mpError = 'Error al procesar el pago: ' + error.message;
                  reject();
                });
              });
            },
            onError: (error: any) => {
              // Callback llamado para todos los casos de error del brick
              this.brickError = 'Error: ' + (error.message || JSON.stringify(error));
              this.mpLoading = false;
            }
          },
          customization: {
            visual: {
              buttonBackground: '#009ee3',
              borderRadius: '6px',
            },
            paymentMethods: {
              // Configura los métodos de pago a mostrar
              maxInstallments: 12,
              excludedPaymentTypes: [] // Permite todos los tipos de pago
            }
          }
        };
        
        // Crear y renderizar el Brick
        brickBuilder.create('payment', 'mp-checkout', settings);
      };
      
      // Renderizar
      this.renderBrick();
      
    } catch (error: any) {
      this.mpError = 'Error al inicializar Mercado Pago: ' + (error.message || error);
      this.mpLoading = false;
      console.error('Error MercadoPago:', error);
    }
  }

  // Crear la preferencia de pago
  async createPaymentPreference() {
    try {
      const items = this.pedido.carrito?.map((item: any) => ({
        title: item.producto ? String(item.producto) : 'Producto de ejemplo',
        quantity: item.cantidad ? Number(item.cantidad) : 1,
        currency_id: 'ARS',
        unit_price: item.precio ? Number(item.precio) : 1
      })) || [];
      
      const body = items.length > 0 ? { items } : {
        items: [{ title: 'Producto de ejemplo', quantity: 1, currency_id: 'ARS', unit_price: 100 }]
      };
      
      const response = await fetch('https://backmobile1.onrender.com/api/producto/mercadopago/preference/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      console.log('Respuesta backend MercadoPago:', data);
      
      this.preferenceId = data.preferenceId || data.preference_id;
      
      if (!this.preferenceId) {
        throw new Error('No se pudo obtener la preferencia de MercadoPago');
      }
      
      return this.preferenceId;
    } catch (error: any) {
      this.mpError = 'Error al crear la preferencia de pago: ' + (error.message || error);
      throw error;
    }
  }
  onSubmit() {
    if (this.paymentMethod === 'mercadopago') {
      if (this.mpLoading) return; // Evita submit mientras carga
      if (this.mpError || this.brickError) return; // Evita submit si hay error
      // El pago ya está manejado por el Payment Brick
      // No hacer nada aquí, ya que el botón en el brick maneja el pago
      return;
    }
    
    if (this.paymentMethod === 'paypal') {
      console.log('Procesando pago con PayPal');
      setTimeout(() => {
        console.log('Pago con PayPal exitoso');
        this.pedidoService.confirmarPedido().subscribe({
          next: () => {},
          error: (error: any) => {
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
          error: (error: any) => {
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


