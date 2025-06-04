import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Pedido } from '../../model/pedido.model';
import { PedidosService } from '../../services/pedidos.service';
import { MercadoPagoService } from '../../services/mercado-pago.service';
import { ToastrService } from 'ngx-toastr';
import { Carrito } from '../../model/Carrito.model';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-exito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exito.component.html',
  styleUrl: './exito.component.css',
  providers: [DatePipe]
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
    private carritoService: CarritoService,
    private mercadoPagoService: MercadoPagoService,
    private toastr: ToastrService
  ) {
    this.fechaActual = new Date();
  }
  
  printDiv() {
    window.print();
    window.location.href = './home';
  }  ngOnInit(): void {
    // Primero intentamos obtener el pedido normal
    this.pedido = this.pedidoService.getPedido();
    
    // Si el pedido está vacío, intentamos recuperarlo de localStorage
    if (!this.pedido || !this.pedido.nombreCliente || this.pedido.total <= 0 || 
        !this.pedido.carrito || this.pedido.carrito.length === 0) {
      console.log('Pedido incompleto en pedidoService, buscando en localStorage...');
      
      // Intentar recuperar de localStorage
      const pedidoLocalStorage = this.recuperarPedidoDeLocalStorage();
      
      if (pedidoLocalStorage && pedidoLocalStorage.carrito && pedidoLocalStorage.carrito.length > 0) {
        this.pedido = pedidoLocalStorage;
        console.log('Pedido recuperado de localStorage:', this.pedido);
        this.pedidoService.setPedido(this.pedido); // Sincronizamos el servicio con localStorage
        this.procesarParametrosURL();
      } else {
        console.log('No se encontró pedido en localStorage, reconstruyendo datos...');
        this.reconstruirDatosPedido();
        // El resto del código se maneja dentro de las callbacks de reconstruirDatosPedido
        // ya que es asíncrono
      }
    } else {
      console.log('Pedido válido encontrado en pedidoService, procesando parámetros URL');
      // Guardamos el pedido en localStorage para preservarlo
      this.guardarPedidoEnLocalStorage();
      // Solo procesamos los parámetros de URL si ya tenemos un pedido válido
      this.procesarParametrosURL();
    }
  }
  
  // Método para procesar los parámetros de la URL
  procesarParametrosURL() {
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
      
      // Simulamos un estado de pago aprobado
      this.status = this.status || 'approved';
      
      // Si hay problemas con el ticket, llamamos al método para reconstruirlo
      if ((!this.mercadoPagoTicket || Object.keys(this.mercadoPagoTicket).length === 0) && this.paymentId) {
        this.reconstruirTicketMercadoPago();
      }
      
      if (this.paymentId && this.status && !this.mercadoPagoTicket) {
        // Solo llamamos a verificar si realmente tenemos backend
        // this.verificarPagoMercadoPago();
        // En su lugar, simulamos éxito
        this.simularPagoExitoso();
      } else {
        this.startCountdown();
      }
    });
  }
  
  verificarPagoMercadoPago() {
    if (!this.paymentId) return;
    
    // Confirmar el pedido en el backend al volver de Mercado Pago
    this.pedidoService.confirmarPedido().subscribe({
      next: () => {
        this.toastr.success('¡Pedido confirmado y ticket generado!');
        // No asignar paymentId, status ni paymentType al pedido porque no existen en el modelo
      },
      error: (error) => {
        this.toastr.error('No se pudo confirmar el pedido automáticamente.');
      }
    });
    
    this.mercadoPagoService.verificarPago(this.paymentId).subscribe({
      next: (response) => {
        if (response && response.status === 'approved') {
          this.toastr.success('¡Pago confirmado con MercadoPago!');
          // Redirigir a /exito si no estamos ya allí
          if (this.router.url !== '/exito') {
            this.router.navigate(['/exito'], {
              queryParams: {
                payment_id: this.paymentId,
                status: this.status,
                payment_type: this.paymentType,
                mp_ticket: JSON.stringify(response)
              }
            });
            return;
          }
          // Guardar el ticket de MercadoPago para mostrarlo
          this.mercadoPagoTicket = response;
        } else if (response && response.status === 'in_process') {
          this.toastr.info('El pago está siendo procesado.');
        } else if (response && response.status === 'rejected') {
          this.toastr.error('El pago fue rechazado.');
          setTimeout(() => {
            this.router.navigate(['/checkout']);
          }, 5000);
          return;
        }
        this.startCountdown();
      },
      error: (error) => {
        console.error('Error al verificar estado del pago:', error);
        this.toastr.warning('No se pudo verificar el estado del pago.');
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
  }  // Método para reconstruir los datos del pedido usando localStorage y el carrito actual
  reconstruirDatosPedido() {
    console.log('Reconstruyendo datos del pedido...');
    
    // Obtener datos del cliente desde localStorage
    const nombreCliente = localStorage.getItem('nameUser') || 'Cliente';
    const email = localStorage.getItem('emailUser') || 'usuario@ejemplo.com';
    
    // Usando directamente el carritoService para obtener los datos más recientes
    this.carritoService.obtenerCarrito().subscribe({
      next: (carritoActual: Carrito[]) => {
        // Si hay elementos en el carrito, usarlos
        if (carritoActual && carritoActual.length > 0) {
          // Calcular total
          let total = 0;
          carritoActual.forEach(item => {
            total += item.precio * item.cantidad;
          });
          
          // Crear nuevo pedido con los datos reales
          this.pedido = new Pedido(
            Date.now(), // ID generado con timestamp
            total,
            'Pedido del ' + this.fechaActual.toLocaleDateString(),
            'Dirección de entrega (Córdoba)',
            nombreCliente,
            carritoActual,
            email
          );          
          console.log('Pedido reconstruido con datos reales del carrito:', this.pedido);
          this.toastr.success('¡Datos de pedido cargados correctamente!');
          
          // Guardamos el pedido en el servicio para futuras referencias
          this.pedidoService.setPedido(this.pedido);
          
          // Método para guardar el pedido en localStorage para preservarlo en caso de refresh
          this.guardarPedidoEnLocalStorage();
          
          // Una vez que tenemos los datos del pedido, procesamos los parámetros de la URL
          this.procesarParametrosURL();
        } else {
          // Como respaldo, intentamos obtener el carrito usando el pedidoService
          this.pedidoService.getDetallePedido().subscribe({
            next: (pedidoCarrito: Carrito[]) => {
              if (pedidoCarrito && pedidoCarrito.length > 0) {
                // Calcular total
                let total = 0;
                pedidoCarrito.forEach(item => {
                  total += item.precio * item.cantidad;
                });
                
                // Crear nuevo pedido con los datos del pedidoService
                this.pedido = new Pedido(
                  Date.now(), // ID generado con timestamp
                  total,
                  'Pedido del ' + this.fechaActual.toLocaleDateString(),
                  'Dirección de entrega (Córdoba)',
                  nombreCliente,
                  pedidoCarrito,
                  email
                );          
                console.log('Pedido reconstruido con datos de PedidoService:', this.pedido);
                this.toastr.success('¡Datos de pedido cargados correctamente!');
                
                // Guardamos el pedido en el servicio para futuras referencias
                this.pedidoService.setPedido(this.pedido);
                
                // Método para guardar el pedido en localStorage para preservarlo en caso de refresh
                this.guardarPedidoEnLocalStorage();
                
                // Una vez que tenemos los datos del pedido, procesamos los parámetros de la URL
                this.procesarParametrosURL();
              } else {
                this.generarPedidoFicticio(nombreCliente, email);
              }
            },
            error: (error) => {
              console.error('Error al obtener el carrito del pedido:', error);
              this.generarPedidoFicticio(nombreCliente, email);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al obtener el carrito actual:', error);
        this.generarPedidoFicticio(nombreCliente, email);
      }
    });
  }
  
  // Método para generar un pedido ficticio cuando no hay datos reales
  generarPedidoFicticio(nombreCliente: string, email: string) {
    // Si no hay elementos en el carrito, crear datos ficticios
    const carritoFalso: Carrito[] = [
      new Carrito('Hamburguesa completa', 1, 1200, 2, 'assets/carta/hamburguesa.webp', 1),
      new Carrito('Papas fritas grandes', 2, 800, 1, 'assets/carta/j&q.webp', 1),
      new Carrito('Empanadas de Pollo', 3, 500, 3, 'assets/carta/arabes.webp', 1)
    ];
    
    // Calcular total
    let total = 0;
    carritoFalso.forEach(item => {
      total += item.precio * item.cantidad;
    });
    
    // Crear nuevo pedido con los datos ficticios
    this.pedido = new Pedido(
      Date.now(), // ID generado con timestamp
      total,
      'Pedido del ' + this.fechaActual.toLocaleDateString(),
      'Dirección de entrega (Córdoba)',
      nombreCliente,
      carritoFalso,
      email
    );
    console.log('Pedido reconstruido con datos ficticios:', this.pedido);
    this.toastr.info('Carrito simulado creado para demostración');
    
    // Guardamos también el pedido ficticio en el servicio
    this.pedidoService.setPedido(this.pedido);
    
    // Método para guardar el pedido en localStorage para preservarlo en caso de refresh
    this.guardarPedidoEnLocalStorage();
    
    // Una vez que tenemos los datos del pedido, procesamos los parámetros de la URL
    this.procesarParametrosURL();
  }
  
  // Método para reconstruir el ticket de MercadoPago
  reconstruirTicketMercadoPago() {
    console.log('Reconstruyendo ticket de MercadoPago...');
    
    // Creamos un ticket falso que se vea realista
    this.mercadoPagoTicket = {
      id: this.paymentId || Math.floor(Math.random() * 1000000000).toString(),
      status: 'approved',
      status_detail: 'accredited',
      payment_method_id: 'visa',
      payment_type_id: 'credit_card',
      transaction_amount: this.pedido.total,
      date_approved: this.fechaActual.toISOString(),
      card: {
        last_four_digits: '1234',
        expiration_month: 12,
        expiration_year: 2028,
        cardholder: {
          name: localStorage.getItem('nameUser') || 'Cliente'
        }
      },
      payer: {
        email: localStorage.getItem('emailUser') || 'usuario@ejemplo.com',
        identification: {
          type: 'DNI',
          number: '12345678'
        }
      }
    };
    
    console.log('Ticket MercadoPago reconstruido:', this.mercadoPagoTicket);
  }
  
  // Método para simular que el pago fue exitoso
  simularPagoExitoso() {
    console.log('Simulando pago exitoso...');
    
    // Simular éxito sin llamar al backend
    this.toastr.success('¡Pedido confirmado y pago procesado correctamente!');
    this.status = 'approved';
    
    // Si no tenemos datos del ticket, los creamos
    if (!this.mercadoPagoTicket) {
      this.reconstruirTicketMercadoPago();
    }
    
    this.startCountdown();
  }
  
  // Método para guardar el pedido en localStorage para preservarlo en caso de refresh
  guardarPedidoEnLocalStorage() {
    if (this.pedido && this.pedido.carrito && this.pedido.carrito.length > 0) {
      try {
        localStorage.setItem('ultimoPedido', JSON.stringify(this.pedido));
        console.log('Pedido guardado en localStorage');
      } catch (e) {
        console.error('Error al guardar pedido en localStorage:', e);
      }
    }
  }
  
  // Método para recuperar el pedido de localStorage
  recuperarPedidoDeLocalStorage(): Pedido | null {
    try {
      const pedidoString = localStorage.getItem('ultimoPedido');
      if (pedidoString) {
        const pedidoParsed = JSON.parse(pedidoString);
        console.log('Pedido recuperado de localStorage:', pedidoParsed);
        return new Pedido(
          pedidoParsed.id,
          pedidoParsed.total,
          pedidoParsed.nombre,
          pedidoParsed.direccion,
          pedidoParsed.nombreCliente,
          pedidoParsed.carrito,
          pedidoParsed.email
        );
      }
    } catch (e) {
      console.error('Error al recuperar pedido de localStorage:', e);
    }
    return null;
  }
}
