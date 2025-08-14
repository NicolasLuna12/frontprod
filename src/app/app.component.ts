import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NavComponent } from './shared/nav/nav.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ContactoService } from './services/contacto.service';
import { LanguageSelectorComponent } from './shared/language-selector/language-selector.component';
import { ChatBotComponent } from './shared/chat-bot/chat-bot.component';
import { DemoTourService } from './services/demo-tour.service';

import { JoyrideModule } from 'ngx-joyride';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavComponent,
    RouterOutlet,
    CarritoComponent,
    CommonModule,
    FooterComponent,
    LanguageSelectorComponent,
    ChatBotComponent
  ,JoyrideModule
  ],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'ISPC Food';
  vistaUsuario = false;
  estaAutenticado = false;
  esAdmin = false;
  isHome = false;

  constructor(public contactoService: ContactoService, private router: Router, private demoTour: DemoTourService) {
    const email = localStorage.getItem('emailUser');
    this.estaAutenticado = !!localStorage.getItem('authToken');
    this.esAdmin = email === 'admin@admin.com';

    // Detectar ruta actual
    this.router.events.subscribe(() => {
      this.isHome = this.router.url === '/home' || this.router.url === '/';
    });

    // Lanzar tour si es usuario demo al cargar
    this.demoTour.startTourIfDemoUser();

    // Suscribirse a cambios de autenticación para lanzar el tour si el usuario es demo
    const authService = (window as any).ng?.getInjector?.(AppComponent)?.get?.(require('./services/auth.service').AuthService);
    if (authService && authService.isAuthenticated) {
      authService.isAuthenticated().subscribe((autenticado: boolean) => {
        if (autenticado) {
          this.demoTour.startTourIfDemoUser();
        }
      });
    }
  }

  setVistaUsuario(valor: boolean) {
    this.vistaUsuario = valor;
  }
}
