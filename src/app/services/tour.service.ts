import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface TourStep {
  title: string;
  content: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  features: string[];
  route: string;
  pageSpecific: boolean; // Nueva propiedad para indicar si es específico de página
}

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private tourActiveSubject = new BehaviorSubject<boolean>(false);
  public tourActive$ = this.tourActiveSubject.asObservable();

  private currentStepSubject = new BehaviorSubject<number>(0);
  public currentStep$ = this.currentStepSubject.asObservable();

  private showPageModalSubject = new BehaviorSubject<boolean>(false);
  public showPageModal$ = this.showPageModalSubject.asObservable();

  private currentPageStepSubject = new BehaviorSubject<TourStep | null>(null);
  public currentPageStep$ = this.currentPageStepSubject.asObservable();

  private tourSteps: TourStep[] = [
    {
      title: 'Página Principal - Home',
      content: 'La página de inicio donde los usuarios pueden conocer el restaurante.',
      route: '/home',
      pageSpecific: true,
      features: [
        'Ver información general del restaurante',
        'Acceder rápidamente a la carta',
        'Conocer las especialidades del día',
        'Ver comentarios de otros clientes',
        'Información de ubicación y horarios',
        'Navegación intuitiva a todas las secciones'
      ]
    },
    {
      title: 'Carta de Productos',
      content: 'Explora toda nuestra variedad de productos organizados por categorías.',
      route: '/carta',
      pageSpecific: true,
      features: [
        'Ver todos los productos disponibles',
        'Filtrar por categorías (hamburguesas, lomitos, árabes, etc.)',
        'Ver detalles de cada producto (ingredientes, precios)',
        'Agregar productos al carrito con un clic',
        'Ver imágenes en alta calidad de cada producto',
        'Buscar productos específicos',
        'Comparar precios y opciones'
      ]
    },
    {
      title: 'Carrito de Compras',
      content: 'Gestiona los productos que deseas ordenar.',
      route: '/carrito',
      pageSpecific: true,
      features: [
        'Ver todos los productos agregados',
        'Modificar cantidades de productos fácilmente',
        'Eliminar productos del carrito',
        'Ver el total de la compra en tiempo real',
        'Proceder al checkout de forma segura',
        'Guardar carrito para más tarde',
        'Aplicar descuentos y promociones'
      ]
    },
    {
      title: 'Dashboard Personal',
      content: 'Tu panel personal donde puedes ver tu historial y gestionar tus pedidos.',
      route: '/dashboard',
      pageSpecific: true,
      features: [
        'Ver historial completo de pedidos',
        'Seguir el estado de pedidos activos en tiempo real',
        'Acceder a facturas y comprobantes',
        'Ver estadísticas de consumo personal',
        'Gestionar múltiples direcciones de entrega',
        'Repetir pedidos anteriores fácilmente',
        'Ver puntos de fidelidad (en versión completa)'
      ]
    },
    {
      title: 'Perfil de Usuario',
      content: 'Edita tu información personal y configuraciones de cuenta.',
      route: '/perfil',
      pageSpecific: true,
      features: [
        'Editar información personal (nombre, apellido, teléfono)',
        'Actualizar dirección de entrega principal',
        'Cambiar foto de perfil',
        'Gestionar configuraciones de privacidad',
        '⚠️ DEMO: Email no editable (disponible en versión completa)',
        '⚠️ DEMO: No se puede eliminar cuenta (disponible en versión completa)',
        '✅ VERSIÓN COMPLETA: Editar email y eliminar cuenta libremente',
        'Configurar preferencias de notificaciones'
      ]
    },
    {
      title: 'Contacto',
      content: 'Ponte en contacto con nosotros para consultas o sugerencias.',
      route: '/contacto',
      pageSpecific: true,
      features: [
        'Enviar mensajes directos al restaurante',
        'Ver información de contacto completa',
        'Formulario de consultas y sugerencias',
        'Ver ubicación exacta en mapa interactivo',
        'Horarios de atención detallados',
        'Links directos a redes sociales',
        'Número de WhatsApp para consultas rápidas'
      ]
    },
    {
      title: 'Quiénes Somos',
      content: 'Conoce al equipo de desarrollo detrás de esta aplicación.',
      route: '/quienes-somos',
      pageSpecific: true,
      features: [
        'Información sobre el equipo de desarrollo',
        'Tecnologías utilizadas en el proyecto',
        'Historia del desarrollo de la aplicación',
        'Contacto directo con los desarrolladores',
        'Créditos y reconocimientos',
        'Metodología de desarrollo utilizada'
      ]
    }
  ];

  constructor(private router: Router) {
    // Escuchar cambios de ruta para mostrar modales específicos de página
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (this.tourActiveSubject.value && event instanceof NavigationEnd) {
        this.checkCurrentPageStep(event.url);
      }
    });
  }

  startTour(userEmail: string): void {
    if (userEmail === 'demo@demo.com') {
      this.tourActiveSubject.next(true);
      this.currentStepSubject.next(0);
      // Navegar a la primera página del tour
      this.router.navigate(['/home']).then(() => {
        // Pequeño delay para asegurar que la navegación se complete
        setTimeout(() => {
          this.checkCurrentPageStep('/home');
        }, 500);
      });
    }
  }

  stopTour(): void {
    this.tourActiveSubject.next(false);
    this.currentStepSubject.next(0);
    this.showPageModalSubject.next(false);
    this.currentPageStepSubject.next(null);
  }

  nextStep(): void {
    const currentStep = this.currentStepSubject.value;
    if (currentStep < this.tourSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      this.currentStepSubject.next(nextStepIndex);
      
      // Cerrar el modal actual antes de navegar
      this.showPageModalSubject.next(false);
      
      // Navegar a la ruta del siguiente paso
      const nextStep = this.tourSteps[nextStepIndex];
      this.router.navigate([nextStep.route]).then(() => {
        // Pequeño delay para asegurar que la navegación se complete
        setTimeout(() => {
          this.checkCurrentPageStep(nextStep.route);
        }, 300);
      });
    } else {
      this.stopTour();
    }
  }

  previousStep(): void {
    const currentStep = this.currentStepSubject.value;
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      this.currentStepSubject.next(prevStepIndex);
      
      // Cerrar el modal actual antes de navegar
      this.showPageModalSubject.next(false);
      
      // Navegar a la ruta del paso anterior
      const prevStep = this.tourSteps[prevStepIndex];
      this.router.navigate([prevStep.route]).then(() => {
        // Pequeño delay para asegurar que la navegación se complete
        setTimeout(() => {
          this.checkCurrentPageStep(prevStep.route);
        }, 300);
      });
    }
  }

  getCurrentStep(): TourStep {
    return this.tourSteps[this.currentStepSubject.value];
  }

  getTotalSteps(): number {
    return this.tourSteps.length;
  }

  getCurrentStepNumber(): number {
    return this.currentStepSubject.value + 1;
  }

  goToStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.tourSteps.length) {
      this.currentStepSubject.next(stepIndex);
      
      // Cerrar el modal actual antes de navegar
      this.showPageModalSubject.next(false);
      
      const step = this.tourSteps[stepIndex];
      this.router.navigate([step.route]).then(() => {
        // Pequeño delay para asegurar que la navegación se complete
        setTimeout(() => {
          this.checkCurrentPageStep(step.route);
        }, 300);
      });
    }
  }

  // Método mejorado para verificar si la página actual tiene un paso de tour
  private checkCurrentPageStep(currentUrl: string): void {
    const currentStep = this.tourSteps.find(step => 
      currentUrl === step.route || currentUrl.startsWith(step.route)
    );
    
    if (currentStep && this.tourActiveSubject.value) {
      console.log('🎯 Mostrando modal para:', currentStep.title);
      // Mostrar el modal específico de esta página
      this.currentPageStepSubject.next(currentStep);
      this.showPageModalSubject.next(true);
      
      // Actualizar el paso actual si corresponde
      const stepIndex = this.tourSteps.findIndex(step => step === currentStep);
      if (stepIndex !== -1 && stepIndex !== this.currentStepSubject.value) {
        this.currentStepSubject.next(stepIndex);
      }
    }
  }

  // Método para cerrar el modal de página específica
  closePageModal(): void {
    this.showPageModalSubject.next(false);
  }

  // Método para obtener el paso de la página actual
  getCurrentPageStep(): TourStep | null {
    return this.currentPageStepSubject.value;
  }
}
