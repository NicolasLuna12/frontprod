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
import { TwofaService } from '../../services/twofa.service';

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
  show2FAModal: boolean = false;
  twofaQR: string = '';
  twofaMotivo: string[] = [];
  twofaEnabled: boolean = false;
  twofaCode: string = '';
  emailUser: string = '';
  nameUser: string = '';

  constructor(
    private router: Router,
    private pedidoService: PedidosService,
    private toastr: ToastrService,
    private http: HttpClient,
    private mercadoPagoService: MercadoPagoService,
    public contactoService: ContactoService,
    private twofaService: TwofaService
  ) {}

  ngOnInit(): void {
    this.pedido = this.pedidoService.getPedido();
    this.emailUser = localStorage.getItem('emailUser') || '';
    this.nameUser = localStorage.getItem('nameUser') || '';
    this.verificar2FA();
    // Inicialización del SDK de Mercado Pago usando el modelo oficial y evitando error de TypeScript
    if ((window as any).MercadoPago) {
      const mp = new (window as any).MercadoPago('APP_USR-15dcbbb0-ed10-4a65-a8ec-4279e83029a4', { locale: 'es-AR' });
      // Si necesitas usar mp luego, guárdalo en una propiedad de la clase
    }
  }

  verificar2FA() {
    // Si ya está activo en sesión, no volver a pedir
    if (sessionStorage.getItem('2fa_active') === 'true') return;
    const monto = this.pedido.total;
    const titular = this.cardholderName || this.nameUser;
    // Si el monto es mayor a 50000 o el titular es distinto al usuario
    if (monto > 50000 || (this.cardholderName && this.cardholderName.trim().toLowerCase() !== this.nameUser.trim().toLowerCase())) {
      this.twofaService.authorizePurchase(this.emailUser, monto, titular).subscribe({
        next: (resp) => {
          if (resp.requiere_2fa) {
            this.twofaMotivo = resp.motivo;
            this.twofaEnabled = false;
            this.twofaService.setup2fa(this.emailUser).subscribe({
              next: (qrResp) => {
                this.twofaQR = qrResp.qr;
                this.show2FAModal = true;
              }
            });
          } else {
            this.twofaEnabled = true;
            sessionStorage.setItem('2fa_active', 'true');
          }
        },
        error: () => {
          this.toastr.error('Error al verificar 2FA');
        }
      });
    }
  }

  confirmar2FA() {
    this.twofaService.verify2fa(this.emailUser, this.twofaCode).subscribe({
      next: (resp) => {
        if (resp.verified) {
          this.toastr.success('2FA verificado correctamente');
          this.show2FAModal = false;
          sessionStorage.setItem('2fa_active', 'true');
        } else {
          this.toastr.error('Código incorrecto');
        }
      },
      error: () => {
        this.toastr.error('Código incorrecto');
      }
    });
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
      next: (response: any) => {
        console.log('Respuesta completa de MercadoPago:', response);
        let redirectUrl: string | null = null;
        if (response && response.init_point) {
          redirectUrl = response.init_point;
        } else if (response && response.sandbox_init_point) {
          redirectUrl = response.sandbox_init_point;
        } else {
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
        if (!redirectUrl && response.payment_request_id) {
          console.log('Consultando estado de PaymentRequest:', response.payment_request_id);
          this.mercadoPagoService.consultarEstadoPaymentRequest(response.payment_request_id).subscribe({
            next: (estado: any) => {
              console.log('Respuesta de estado de PaymentRequest:', estado);
              const url = estado.init_point || estado.sandbox_init_point || estado.url;
              if (url) {
                this.abrirModalMercadoPago(url);
              } else {
                this.toastr.error('No se pudo obtener la URL de pago de Mercado Pago.');
                this.isProcessing = false;
              }
            },
            error: (err) => {
              this.toastr.error('No se pudo consultar el estado del pago.');
              this.isProcessing = false;
            }
          });
          return;
        }
        if (redirectUrl) {
          this.abrirModalMercadoPago(redirectUrl);
        } else {
          this.toastr.error('Error al crear preferencia de pago. No se encontró URL de redirección.');
          this.isProcessing = false;
        }
      },
      error: (error: any) => {
        this.toastr.error('Error al procesar pago. Intente nuevamente.');
        this.isProcessing = false;
      }
    });
  }

  abrirModalMercadoPago(url: string): void {
    // Crea un modal simple con un iframe que carga la URL de Mercado Pago
    const modal = document.createElement('div');
    modal.id = 'mp-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.7)';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.innerHTML = `
      <div style="background:#fff; border-radius:16px; width:1200px; max-width:99vw; height:80vh; position:relative; display:flex; flex-direction:column; box-shadow:0 0 32px #0008;">
        <button id="mp-modal-close" style="position:absolute;top:18px;right:24px;z-index:2;font-size:2.5rem;background:none;border:none;cursor:pointer;line-height:1;">&times;</button>
        <iframe src="${url}" style="flex:1;width:100%;height:100%;border:none;border-radius:16px;"></iframe>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('mp-modal-close')?.addEventListener('click', () => {
      modal.remove();
      this.isProcessing = false;
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
