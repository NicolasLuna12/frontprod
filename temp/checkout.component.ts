import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { ContactoService } from '../../services/contacto.service';
import { MercadoPagoService } from '../../services/mercado-pago.service';
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
export class CheckoutComponent implements OnInit {
  paymentMethod: string = '';
  cardholderName: string = '';
  cardNumber: string = '';
  expiryMonth: string = '';
  expiryYear: string = '';
  cvv: string = '';
  isProcessing: boolean = false;
  pedido: Pedido = new Pedido(0, 0, '', '', '', []);
  mercadoPagoIcon: string = 'https://contactopuro.com/files/mercadopago-81090.png';
  
  constructor(
    private router: Router,
    private pedidoService: PedidosService,
    private toastr: ToastrService,
    private http: HttpClient,
    private mercadoPagoService: MercadoPagoService,
    public contactoService: ContactoService
  ) {}

  ngOnInit(): void {
    this.pedido = this.pedidoService.getPedido();
  }

  onSubmit(): void {
    if (!this.paymentMethod) {
      this.toastr.warning('Selecciona un método de pago');
      return;
    }
    
    this.isProcessing = true;
    
    if (this.paymentMethod === 'paypal') {
      setTimeout(() => {
        this.confirmarPedido();
      }, 2000);
    } else if (this.paymentMethod === 'card') {
      setTimeout(() => {
        this.confirmarPedido();
      }, 2000);
    } else if (this.paymentMethod === 'mercadopago') {
      this.procesarPagoMercadoPago();
    } else {
      this.toastr.warning('Selecciona un método de pago válido');
      this.isProcessing = false;
    }
  }

  // Método para procesar el pago con Mercado Pago
  procesarPagoMercadoPago(): void {
    this.isProcessing = true;
    console.log('Procesando pago con MercadoPago...');
    
    this.mercadoPagoService.crearPreferencia().subscribe({
      next: (response) => {
        console.log('Respuesta completa de MercadoPago:', response);
        
        // Buscar el init_point o alguna URL de redirección en toda la respuesta
        let redirectUrl = null;
        
        if (response && response.init_point) {
          redirectUrl = response.init_point;
        } else if (response && response.sandbox_init_point) {
          redirectUrl = response.sandbox_init_point;
        } else {
          // Intentar buscar en otros lugares de la respuesta
          const searchInObj = (obj: any, searchProp: string): string | null => {
            if (!obj || typeof obj !== 'object') return null;
            
            if (obj[searchProp]) return obj[searchProp];
            
            for (const key in obj) {
              if (typeof obj[key] === 'object') {
                const found = searchInObj(obj[key], searchProp);
                if (found) return found;
              }
            }
            
            return null;
          };
          
          redirectUrl = searchInObj(response, 'init_point') || 
                        searchInObj(response, 'sandbox_init_point') ||
                        searchInObj(response, 'url');
        }
        
        if (redirectUrl) {
          console.log('URL de redirección encontrada:', redirectUrl);
          // Forzar el uso del modal original de Mercado Pago
          if ((window as any).MercadoPago) {
            const mp = new (window as any).MercadoPago('APP_USR-15dcbbb0-ed10-4a65-a8ec-4279e83029a4', { locale: 'es-AR' });
            mp.checkout({
              url: redirectUrl,
              autoOpen: true,
              autoClose: false,
              // Forzar tamaño grande
              renderMode: 'modal',
              theme: {
                elements: {
                  modal: {
                    width: '100vw',
                    height: '100vh',
                    borderRadius: '0px'
                  }
                }
              }
            });
          } else {
            // Fallback: abrir en modal propio si el SDK no está disponible
            this.abrirModalMercadoPago(redirectUrl);
          }
        } else {
          console.error('Respuesta incompleta de MercadoPago:', response);
          this.toastr.error('Error al crear preferencia de pago. No se encontró URL de redirección.');
          this.isProcessing = false;
        }
      },
      error: (error: any) => {
        console.error('Error al procesar pago con MercadoPago:', error);
        let errorMsg = 'Error al procesar pago. Intente nuevamente.';
        
        if (error.error && error.error.detail) {
          errorMsg += ' Detalle: ' + error.error.detail;
          console.error('Detalle del error:', error.error.detail);
        }
        
        this.toastr.error(errorMsg);
        this.isProcessing = false;
      }
    });
  }

  abrirModalMercadoPago(url: string): void {
    // Modal Bootstrap grande y control de habilitación del botón
    let modal = document.getElementById('mp-modal-bootstrap');
    if (modal) modal.remove(); // Elimina si ya existe
    modal = document.createElement('div');
    modal.id = 'mp-modal-bootstrap';
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.style.background = 'rgba(0,0,0,0.85)';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.zIndex = '9999';
    modal.innerHTML = `
      <div class="modal-dialog modal-xl modal-dialog-centered" style="max-width:95vw;width:95vw;height:95vh;">
        <div class="modal-content" style="height:95vh;display:flex;flex-direction:column;">
          <div class="modal-header" style="border-bottom:1px solid #eee;">
            <img src='${this.mercadoPagoIcon}' alt='Mercado Pago' style='height:48px;width:auto;object-fit:contain;margin-right:12px;' />
            <h5 class="modal-title">Mercado Pago</h5>
            <button type="button" class="btn-close" id="mp-modal-bootstrap-close" aria-label="Cerrar" style="font-size:2rem;margin-left:auto;"></button>
          </div>
          <div class="modal-body p-0" style="flex:1;overflow:hidden;">
            <iframe src="${url}" style="width:100%;height:100%;border:none;"></iframe>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    // Cierre del modal y habilitación del botón
    document.getElementById('mp-modal-bootstrap-close')?.addEventListener('click', () => {
      if (modal) modal.remove();
      this.isProcessing = false;
    });
    // Permite cerrar el modal haciendo click fuera del contenido
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        this.isProcessing = false;
      }
    });
  }

  // Método para confirmar el pedido (para métodos de pago diferentes a Mercado Pago)
  confirmarPedido(): void {
    this.pedidoService.confirmarPedido().subscribe({
      next: () => {
        this.router.navigate(['/exito']);
      },
      error: (error: any) => {
        this.toastr.error('Error al confirmar pedido. Intente nuevamente.');
        this.isProcessing = false;
      }
    });
  }

  // Este método se llama cuando el usuario cambia el método de pago
  onPaymentMethodChange(): void {
    // Resetear el estado si cambia el método de pago
    this.isProcessing = false;
    console.log('Método de pago cambiado a:', this.paymentMethod);
  }
}
