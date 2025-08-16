import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { TourService } from '../../services/tour.service';
import { ThemeService, Theme } from '../../services/theme.service';
import { ContactoService } from '../../services/contacto.service';
import { TranslatorService } from '../../services/translator.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit {
  @Input() vistaUsuario = false;
  estaAutenticado = false;
  nombreUsuario = '';
  imagenPerfil: string | null = null;
  esDemoUser = false;
  tourActivo = false;
  mobileMenuOpen = false;
  
  // Theme properties
  showThemeSelector = false;
  currentTheme: Theme = 'auto';
  
  // Language properties
  showLanguageSelector = false;
  currentLanguage = 'es';

  constructor(
    private authservice: AuthService, 
    private toastr: ToastrService,
    private router: Router,
    private tourService: TourService,
    private themeService: ThemeService,
    private contactoService: ContactoService,
    public translatorService: TranslatorService
  ) {}

  ngOnInit(): void {
    this.authservice.isAuthenticated().subscribe({
      next: (respuesta) => {
        this.estaAutenticado = respuesta;
        if (respuesta) {
          this.obtenerNombreUsuario();
        }
      }
    });
    // Suscribirse a los cambios de la URL de la imagen de perfil
    this.authservice.imagenPerfil$.subscribe((url) => {
      this.imagenPerfil = url;
    });

    // Suscribirse al estado del tour
    this.tourService.tourActive$.subscribe((activo) => {
      this.tourActivo = activo;
    });
    
    // Suscribirse al tema actual
    this.currentTheme = this.themeService.getCurrentTheme();
    
    // Suscribirse a los cambios de idioma
    this.translatorService.language.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  obtenerNombreUsuario() {
    // Obtener el nombre del usuario del localStorage
    const nombreCompleto = localStorage.getItem('nameUser');
    const email = localStorage.getItem('emailUser');
    this.esDemoUser = email === 'demo@demo.com';
    
    if (nombreCompleto) {
      // Extraer solo el primer nombre
      const primerNombre = nombreCompleto.split(' ')[0];
      // Asegurar que la primera letra sea mayúscula
      this.nombreUsuario = primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1).toLowerCase();
    } else if (email === 'admin@admin.com') {
      this.nombreUsuario = 'Admin';
    } else {
      this.nombreUsuario = 'Usuario';
    }
  }

  isAdmin(): boolean {
    // Puedes cambiar esto por una lógica real de roles
    // Por ahora, si el email es admin@admin.com es admin
    const email = localStorage.getItem('emailUser');
    return email === 'admin@admin.com';
  }

  logout() {
    this.authservice.logout();
    this.toastr.info("Se cerró la sesión correctamente");
    // Redirigir al home después de logout
    this.router.navigate(['/home']);
  }

  iniciarTour() {
    const email = localStorage.getItem('emailUser');
    if (email === 'demo@demo.com') {
      if (this.tourActivo) {
        // Si está activo, desactivarlo
        this.tourService.stopTour();
        this.toastr.info("Tour desactivado.", "Tour");
      } else {
        // Si está desactivado, reactivarlo desde donde se quedó
        this.tourService.startTour(email);
        this.toastr.success("Tour reactivado.", "Tour");
      }
    } else {
      this.toastr.info("El tour guiado solo está disponible para el usuario demo.", "Función Demo");
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
  
  // Theme methods
  toggleThemeSelector() {
    this.showThemeSelector = !this.showThemeSelector;
    this.showLanguageSelector = false; // Close language selector
  }

  setTheme(theme: Theme) {
    this.themeService.setTheme(theme);
    this.currentTheme = theme;
    this.showThemeSelector = false;
  }

  // WhatsApp method
  getWhatsAppUrl(): string {
    return this.contactoService.getUrlWhatsApp('Hola, necesito ayuda con mi pedido');
  }

  // Language methods
  toggleLanguageSelector() {
    this.showLanguageSelector = !this.showLanguageSelector;
    this.showThemeSelector = false; // Close theme selector
  }

  selectLanguage(languageCode: string) {
    this.translatorService.changeLanguage(languageCode);
    this.currentLanguage = languageCode;
    this.showLanguageSelector = false;
  }

  getCurrentLanguageFlag(): string {
    const lang = this.translatorService.availableLanguages.find(l => l.code === this.currentLanguage);
    return lang ? lang.flag : 'assets/flags/es-circle.svg';
  }

  getCurrentLanguageName(): string {
    const lang = this.translatorService.availableLanguages.find(l => l.code === this.currentLanguage);
    return lang ? lang.name : 'Español';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-tool-item')) {
      this.showThemeSelector = false;
      this.showLanguageSelector = false;
    }
  }
}
