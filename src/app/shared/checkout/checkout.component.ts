import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { ContactoService } from '../../services/contacto.service';
import { MercadoPagoService } from '../../services/mercado-pago.service';
import { CarritoService } from '../../services/carrito.service';
import { Pedido } from '../../model/pedido.model';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { TwofaService } from '../../services/twofa.service';
import { ValidationService } from '../../services/validation.service';
import { environment } from '../../../environments/environment';

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
  
  // Propiedades mejoradas para 2FA
  show2FAModal: boolean = false;
  twofaQR: string = '';
  twofaMotivo: string[] = [];
  twofaEnabled: boolean = false;
  twofaCode: string = '';
  verifying2FA: boolean = false;
  qrLoaded: boolean = false;
  
  emailUser: string = '';
  nameUser: string = '';

  constructor(
    private router: Router,
    private pedidoService: PedidosService,
    private toastr: ToastrService,
    private http: HttpClient,
    private mercadoPagoService: MercadoPagoService,
    public contactoService: ContactoService,
    private twofaService: TwofaService,
    private validationService: ValidationService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    console.log('=== CHECKOUT COMPONENT INIT ===');
    this.pedido = this.pedidoService.getPedido();
    console.log('Pedido obtenido:', this.pedido);
    console.log('Total del pedido:', this.pedido?.total);
    
    this.emailUser = localStorage.getItem('emailUser') || '';
    this.nameUser = localStorage.getItem('nameUser') || '';
    console.log('Email usuario:', this.emailUser);
    console.log('Nombre usuario:', this.nameUser);
    
    // Si el pedido está vacío, obtener datos del carrito
    if (!this.pedido.total || this.pedido.total === 0) {
      console.log('Pedido vacío, obteniendo datos del carrito...');
      this.carritoService.obtenerCarrito().subscribe({
        next: (carritoData: any) => {
          console.log('Datos del carrito obtenidos:', carritoData);
          if (carritoData && carritoData.length > 0) {
            // Calcular total del carrito
            const total = carritoData.reduce((sum: number, item: any) => {
              return sum + (item.precio * item.cantidad);
            }, 0);
            
            // Actualizar el pedido con los datos del carrito
            this.pedido.total = total;
            this.pedido.carrito = carritoData;
            this.pedido.nombreCliente = this.nameUser;
            this.pedido.email = this.emailUser;
            
            console.log('Pedido actualizado con carrito:', this.pedido);
            console.log('Total calculado:', total);
            
            // Ahora verificar 2FA con el total correcto
            this.verificar2FA();
          }
        },
        error: (error: any) => {
          console.error('Error al obtener carrito:', error);
        }
      });
    } else {
      // Información del usuario y pedido cargada
      console.log('Llamando a verificar2FA...');
      this.verificar2FA();
    }
    
    // Inicialización del SDK de Mercado Pago usando el modelo oficial y evitando error de TypeScript
    if ((window as any).MercadoPago) {
      const mp = new (window as any).MercadoPago(environment.mercadoPagoPublicKey, { locale: 'es-AR' });
      // Si necesitas usar mp luego, guárdalo en una propiedad de la clase
    }
  }

  verificar2FA() {
    console.log('=== VERIFICAR 2FA INICIADO ===');
    console.log('Pedido:', this.pedido);
    console.log('Email User:', this.emailUser);
    console.log('Name User:', this.nameUser);
    
    // Verificar que el pedido esté cargado correctamente
    if (!this.pedido || !this.pedido.total) {
      console.log('Pedido no cargado correctamente, reintentando...');
      setTimeout(() => this.verificar2FA(), 500);
      return;
    }
    
    // Si ya está activo en sesión, no volver a pedir
    if (sessionStorage.getItem('2fa_active') === 'true') {
      console.log('2FA ya activo en sesión, saltando...');
      return;
    }
    
    const monto = this.pedido.total;
    console.log('Monto del pedido:', monto);
    console.log('¿Monto >= 50000?', monto >= 50000);
    
    // Verificando si monto requiere 2FA
    // Cambio: >= en lugar de > para incluir exactamente 50000
    if (monto >= 50000) {
      console.log('Monto requiere 2FA, iniciando proceso...');
      // Llamar directamente a setup para generar el QR
      this.twofaService.setup2fa(this.emailUser).subscribe({
        next: (qrResp) => {
          console.log('QR generado exitosamente');
          // QR code recibido para configuración
          this.twofaQR = qrResp.qr;
          this.twofaMotivo = ['monto']; // Motivo: monto elevado
          this.twofaEnabled = false;
          this.show2FAModal = true;
        },
        error: (err) => {
          console.error('Error al obtener QR:', err);
          this.toastr.error('Error al configurar 2FA. Por favor, intenta de nuevo.');
          
          // Fallback: intentar con authorizePurchase
          console.log('Intentando con authorizePurchase como fallback...');
          this.twofaService.authorizePurchase(this.emailUser, monto, this.nameUser).subscribe({
            next: (resp) => {
              console.log('Respuesta de authorize:', resp);
              if (resp.requiere_2fa) {
                this.twofaMotivo = resp.motivo;
                this.twofaEnabled = false;
                // Intentar setup nuevamente
                this.twofaService.setup2fa(this.emailUser).subscribe({
                  next: (qrResp2) => {
                    this.twofaQR = qrResp2.qr;
                    this.show2FAModal = true;
                  },
                  error: (err2) => {
                    console.error('Error en segundo intento de QR:', err2);
                    this.toastr.error('No se pudo configurar 2FA. Contacta soporte.');
                  }
                });
              }
            },
            error: (err2) => {
              console.error('Error en fallback authorize:', err2);
              this.toastr.error('Servicio 2FA no disponible. Contacta soporte.');
            }
          });
        }
      });
    }
  }
  confirmar2FA() {
    // Validación robusta del código 2FA
    if (!this.isValidTwoFACode(this.twofaCode)) {
      this.toastr.warning('Por favor, introduce un código numérico de 6 dígitos');
      return;
    }
    
    // Enviando código 2FA para verificación
    this.verifying2FA = true; // Iniciar animación de verificación
    
    this.twofaService.verify2fa(this.emailUser, this.twofaCode).subscribe({
      next: (resp) => {
        // Procesando respuesta de verificación 2FA
        if (resp.verified) {
          this.toastr.success('Verificación completada con éxito', '2FA Correcto');
          sessionStorage.setItem('2fa_active', 'true');
          
          // Cerramos el modal con una pequeña demora para mejor experiencia UX
          setTimeout(() => {
            this.show2FAModal = false;
            this.verifying2FA = false;
            // Si hay un pago pendiente, continuar con él
            if (this.paymentMethod === 'mercadopago') {
              this.procesarPagoMercadoPago();
            }
          }, 1000);
        } else {
          this.verifying2FA = false; // Detener animación de verificación
          this.toastr.error('El código introducido no es válido. Inténtalo de nuevo.');
        }
      },
      error: (err) => {
        this.verifying2FA = false; // Detener animación de verificación en caso de error
        console.error('Error en confirmar2FA:', err);
        this.toastr.error('No pudimos verificar tu código. Por favor, inténtalo de nuevo.');
      }
    });
  }

  // Método para validar código 2FA
  private isValidTwoFACode(code: string): boolean {
    if (!code) return false;
    
    // Solo acepta exactamente 6 dígitos numéricos
    const regex = /^[0-9]{6}$/;
    return regex.test(code.trim());
  }

  // Nueva función para manejar el cierre/cancelación del modal 2FA
  cancelar2FA() {
    this.show2FAModal = false;
    this.toastr.info('Debes completar la autenticación 2FA para continuar con el pago.');
  }

  onSubmit(): void {
    if (!this.paymentMethod) {
      this.toastr.warning('Selecciona un método de pago');
      return;
    }
    this.isProcessing = true;
    sessionStorage.setItem('paymentMethod', this.paymentMethod);

    // Si es MercadoPago y el monto supera o iguala 50000, forzar 2FA antes de procesar el pago
    if (this.paymentMethod === 'mercadopago') {
      if (this.pedido.total >= 50000 && sessionStorage.getItem('2fa_active') !== 'true') {
        this.show2FAModal = true;
        this.isProcessing = false;
        return;
      } else {
        this.procesarPagoMercadoPago();
        return;
      }
    }
    // Si es otro método y requiere 2FA, también bloquear
    if (this.pedido.total >= 50000 && sessionStorage.getItem('2fa_active') !== 'true') {
      this.show2FAModal = true;
      this.isProcessing = false;
      return;
    }
    if (this.paymentMethod === 'paypal') {
      setTimeout(() => {
        this.confirmarPedido();
      }, 2000);
    } else if (this.paymentMethod === 'card') {
      setTimeout(() => {
        this.confirmarPedido();
      }, 2000);
    } else {
      this.toastr.warning('Selecciona un método de pago válido');
      this.isProcessing = false;
    }
  }

  // Método para procesar el pago con Mercado Pago
  procesarPagoMercadoPago(): void {
    this.isProcessing = true;
    // Procesando pago con MercadoPago...
    
    this.mercadoPagoService.crearPreferencia().subscribe({
      next: (response: any) => {
        // Procesando respuesta de MercadoPago
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
          // PaymentRequest detectado - consultando estado
          this.mercadoPagoService.consultarEstadoPaymentRequest(response.payment_request_id).subscribe({
            next: (estado: any) => {
              // Procesando estado de PaymentRequest
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
    // Validar la URL antes de usarla
    if (!this.isValidMercadoPagoUrl(url)) {
      this.toastr.error('URL de pago inválida');
      this.isProcessing = false;
      return;
    }

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

    // Crear elementos de forma segura sin innerHTML
    const modalContent = document.createElement('div');
    modalContent.style.background = '#fff';
    modalContent.style.borderRadius = '16px';
    modalContent.style.width = '1200px';
    modalContent.style.maxWidth = '99vw';
    modalContent.style.height = '80vh';
    modalContent.style.position = 'relative';
    modalContent.style.display = 'flex';
    modalContent.style.flexDirection = 'column';
    modalContent.style.boxShadow = '0 0 32px #0008';

    const closeButton = document.createElement('button');
    closeButton.id = 'mp-modal-close';
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '18px';
    closeButton.style.right = '24px';
    closeButton.style.zIndex = '2';
    closeButton.style.fontSize = '2.5rem';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.cursor = 'pointer';
    closeButton.style.lineHeight = '1';

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.flex = '1';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '16px';

    modalContent.appendChild(closeButton);
    modalContent.appendChild(iframe);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);
    
    closeButton.addEventListener('click', () => {
      modal.remove();
      this.isProcessing = false;
    });
  }

  // Método para validar URLs de Mercado Pago
  private isValidMercadoPagoUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const validDomains = [
        'mercadopago.com',
        'mercadopago.com.ar',
        'mercadolibre.com',
        'mercadolibre.com.ar',
        'mpago.la',
        'mercadopago.cl',
        'mercadopago.com.mx',
        'mercadopago.com.br',
        'mercadopago.com.co',
        'mercadopago.com.pe',
        'mercadopago.com.uy'
      ];
      
      return urlObj.protocol === 'https:' && 
             validDomains.some(domain => urlObj.hostname.endsWith(domain));
    } catch {
      return false;
    }
  }
  // Método para confirmar el pedido (para métodos de pago diferentes a Mercado Pago)
  confirmarPedido(): void {
    this.pedidoService.confirmarPedido().subscribe({
      next: () => {
        // Añadir el método de pago como parámetro a la redirección
        this.router.navigate(['/exito'], {
          queryParams: {
            payment_method: this.paymentMethod
          }
        });
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
    // Método de pago actualizado
  }

  // Método para manejar la carga del QR
  onQRLoad() {
    this.qrLoaded = true;
  }

  get requiere2FA(): boolean {
    return this.pedido.total >= 50000 && sessionStorage.getItem('2fa_active') !== 'true';
  }
}
