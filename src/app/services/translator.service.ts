import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslatorService {
  private renderer: Renderer2;
  private currentLanguage = new BehaviorSubject<string>('es');
  
  // Lista de idiomas soportados
  public availableLanguages = [
    { code: 'es', name: 'Español', flag: 'assets/flags/es-circle.svg' },
    { code: 'en', name: 'English', flag: 'assets/flags/en-circle.svg' },
    { code: 'pt', name: 'Português', flag: 'assets/flags/pt-circle.svg' }
  ];

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    
    // Inicializar después de que el DOM esté listo
    setTimeout(() => {
      this.initializeTranslator();
    }, 1000);
  }

  // Obtener el idioma currente
  get language() {
    return this.currentLanguage.asObservable();
  }

  // Inicializar el traductor
  private initializeTranslator(): void {
    console.log('🚀 Inicializando servicio de traducción...');
    
    const savedLanguage = localStorage.getItem('selectedLanguage');
    console.log('💾 Idioma guardado en localStorage:', savedLanguage);
    
    if (savedLanguage && savedLanguage !== 'es') {
      console.log('🔄 Restaurando idioma guardado:', savedLanguage);
      this.currentLanguage.next(savedLanguage);
      this.setSimpleTranslateCookie(savedLanguage);
    } else {
      console.log('🇪🇸 Usando idioma español (por defecto)');
    }
    
    // Cargar script básico de Google Translate
    this.loadBasicGoogleTranslate();
  }

  // Cargar script básico de Google Translate
  private loadBasicGoogleTranslate(): void {
    console.log('📜 Cargando script básico de Google Translate...');
    
    // Verificar si ya existe el script
    if (document.querySelector('script[src*="translate.google.com"]')) {
      console.log('⚠️ Script de Google Translate ya existe');
      return;
    }

    // Crear elemento para el widget (oculto)
    if (!document.getElementById('google_translate_element')) {
      const translateDiv = document.createElement('div');
      translateDiv.id = 'google_translate_element';
      translateDiv.style.display = 'none';
      document.body.appendChild(translateDiv);
    }

    // Función global simple para Google Translate
    (window as any).googleTranslateElementInit = () => {
      console.log('🎯 Inicializando Google Translate Widget básico...');
      try {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'es',
          includedLanguages: 'en,pt',
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true
        }, 'google_translate_element');
        console.log('✅ Widget de Google Translate inicializado');
      } catch (error) {
        console.error('❌ Error inicializando widget:', error);
      }
    };

    // Cargar el script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onload = () => console.log('✅ Script de Google Translate cargado');
    script.onerror = () => console.error('❌ Error cargando script de Google Translate');
    document.head.appendChild(script);
  }

  // Cambiar el idioma
  changeLanguage(languageCode: string): void {
    console.log('🌐 Intentando cambiar idioma a:', languageCode);
    
    // Si seleccionamos español, volver al idioma base
    if (languageCode === 'es') {
      console.log('🇪🇸 Cambiando a español (idioma base)');
      localStorage.removeItem('selectedLanguage');
      this.clearTranslateCookies();
      this.currentLanguage.next('es');
      window.location.reload();
      return;
    }

    // Validar que el idioma esté soportado
    if (!['en', 'pt'].includes(languageCode)) {
      console.error('❌ Idioma no soportado:', languageCode);
      return;
    }

    console.log('✅ Idioma válido, configurando traducción...');
    
    // Actualizar el idioma actual y guardarlo
    this.currentLanguage.next(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
    
    // Establecer cookie de traducción de manera simple
    this.setSimpleTranslateCookie(languageCode);
    
    // Recargar para aplicar la traducción
    setTimeout(() => {
      console.log('🔄 Recargando página para aplicar traducción...');
      window.location.reload();
    }, 300);
  }

  // Método simplificado para establecer cookies
  private setSimpleTranslateCookie(lang: string): void {
    console.log('🍪 Estableciendo cookie simple para:', lang);
    
    // Limpiar cookies existentes
    this.clearTranslateCookies();
    
    // Establecer la nueva cookie
    const cookieValue = `/es/${lang}`;
    document.cookie = `googtrans=${cookieValue}; path=/; max-age=86400`;
    
    console.log('✅ Cookie establecida:', `googtrans=${cookieValue}`);
  }

  // Limpiar cookies de traducción
  private clearTranslateCookies(): void {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname + ';';
  }
}