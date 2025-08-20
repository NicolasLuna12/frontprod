import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NavComponent } from './shared/nav/nav.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ContactoService } from './services/contacto.service';
import { LanguageSelectorComponent } from './shared/language-selector/language-selector.component';
import { ChatBotComponent } from './shared/chat-bot/chat-bot.component';
import { TourModalComponent } from './shared/tour-modal/tour-modal.component';
import { ThemeSelectorComponent } from './shared/theme-selector/theme-selector.component';
import { ThemeService } from './services/theme.service';
import { TranslatorService } from './services/translator.service';


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
    ChatBotComponent,
    TourModalComponent,
    ThemeSelectorComponent
  ],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'ISPC Food';
  vistaUsuario = false;
  estaAutenticado = false;
  esAdmin = false;
  isHome = false;

  esMovil = false;

  constructor(
    public contactoService: ContactoService, 
    private router: Router,
    private themeService: ThemeService,
    private translatorService: TranslatorService
  ) {
    const email = localStorage.getItem('emailUser');
    this.estaAutenticado = !!localStorage.getItem('authToken');
    this.esAdmin = email === 'admin@admin.com';

    // Detectar ruta actual
    this.router.events.subscribe(() => {
      this.isHome = this.router.url === '/home' || this.router.url === '/';
    });

  // Detectar si es móvil
  this.esMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  ngOnInit() {
    // Inicializar el tema automáticamente
    this.themeService.setTheme('auto');
  }

  setVistaUsuario(valor: boolean) {
    this.vistaUsuario = valor;
  }
}
