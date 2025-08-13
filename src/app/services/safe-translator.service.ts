import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SafeTranslatorService {
  private renderer: Renderer2;
  private currentLanguage = 'es';

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Cambia el idioma de forma segura
   */
  changeLanguage(languageCode: 'en' | 'pt' | 'es'): void {
    if (!this.isValidLanguageCode(languageCode)) {
      console.error('Código de idioma inválido:', languageCode);
      return;
    }

    this.currentLanguage = languageCode;
    
    // Guardar preferencia de idioma de forma segura
    try {
      localStorage.setItem('selectedLanguage', languageCode);
    } catch (error) {
      console.error('Error al guardar idioma:', error);
    }

    if (languageCode === 'es') {
      this.resetToSpanish();
    } else {
      this.initGoogleTranslate(languageCode);
    }
  }

  /**
   * Valida el código de idioma
   */
  private isValidLanguageCode(code: string): code is 'en' | 'pt' | 'es' {
    return ['en', 'pt', 'es'].includes(code);
  }

  /**
   * Resetea el idioma a español
   */
  private resetToSpanish(): void {
    try {
      // Limpiar cookies de traducción de forma segura
      this.clearTranslateCookies();
      
      // Remover elementos de traducción
      this.removeTranslateWidget();
      
      // Limpiar localStorage
      localStorage.removeItem('selectedLanguage');
      
      // Recargar página si es necesario
      if (window.location && window.location.reload) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error al resetear idioma:', error);
    }
  }

  /**
   * Inicializa Google Translate de forma segura
   */
  private initGoogleTranslate(lang: 'en' | 'pt'): void {
    try {
      // Limpiar widgets previos
      this.removeTranslateWidget();
      
      // Establecer cookie de traducción segura
      this.setSecureTranslateCookie(lang);
      
      // Crear elementos del widget de forma segura
      this.createTranslateWidget();
      
      // Cargar script de Google Translate
      this.loadGoogleTranslateScript();
      
    } catch (error) {
      console.error('Error al inicializar Google Translate:', error);
    }
  }

  /**
   * Establece cookies de traducción con flags de seguridad
   */
  private setSecureTranslateCookie(lang: string): void {
    try {
      const isSecure = window.location.protocol === 'https:';
      const secureFlag = isSecure ? '; Secure' : '';
      const sameSiteFlag = '; SameSite=Lax';
      const path = '; path=/';
      
      const cookieValue = `googtrans=/es/${lang}${path}${sameSiteFlag}${secureFlag}`;
      document.cookie = cookieValue;
      
    } catch (error) {
      console.error('Error al establecer cookie:', error);
    }
  }

  /**
   * Limpia cookies de traducción de forma segura
   */
  private clearTranslateCookies(): void {
    try {
      const domains = [
        '',
        '; domain=' + window.location.hostname,
        '; domain=.' + window.location.hostname,
        '; domain=' + window.location.host,
        '; domain=.' + window.location.host
      ];

      const paths = ['/', '/es', '/en', '/pt'];

      domains.forEach(domain => {
        paths.forEach(path => {
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}${domain};`;
        });
      });
    } catch (error) {
      console.error('Error al limpiar cookies:', error);
    }
  }

  /**
   * Crea el widget de traducción de forma segura
   */
  private createTranslateWidget(): void {
    try {
      const translateDiv = this.renderer.createElement('div');
      this.renderer.setAttribute(translateDiv, 'id', 'google_translate_element');
      this.renderer.setStyle(translateDiv, 'display', 'none');
      this.renderer.appendChild(document.body, translateDiv);
    } catch (error) {
      console.error('Error al crear widget:', error);
    }
  }

  /**
   * Carga el script de Google Translate de forma segura
   */
  private loadGoogleTranslateScript(): void {
    try {
      // Verificar si el script ya existe
      if (document.querySelector('script[src*="translate.googleapis.com"]')) {
        return;
      }

      const script = this.renderer.createElement('script');
      this.renderer.setAttribute(script, 'type', 'text/javascript');
      this.renderer.setAttribute(script, 'src', 'https://translate.googleapis.com/translate_a/element.js?cb=googleTranslateElementInit');
      
      // Crear función de inicialización de forma segura
      this.createInitFunction();
      
      this.renderer.appendChild(document.body, script);
      
    } catch (error) {
      console.error('Error al cargar script:', error);
    }
  }

  /**
   * Crea la función de inicialización de forma segura
   */
  private createInitFunction(): void {
    try {
      // Definir función global de forma segura
      (window as any).googleTranslateElementInit = () => {
        try {
          if ((window as any).google && (window as any).google.translate) {
            new (window as any).google.translate.TranslateElement({
              pageLanguage: 'es',
              includedLanguages: 'en,pt',
              layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: true,
              gaTrack: false
            }, 'google_translate_element');
            
            // Ocultar elementos después de la inicialización
            setTimeout(() => {
              this.hideTranslateElements();
            }, 1000);
          }
        } catch (error) {
          console.error('Error en inicialización de Google Translate:', error);
        }
      };
    } catch (error) {
      console.error('Error al crear función de inicialización:', error);
    }
  }

  /**
   * Oculta elementos visuales de Google Translate
   */
  private hideTranslateElements(): void {
    try {
      const elementsToHide = [
        '.goog-te-banner-frame',
        '.skiptranslate', 
        '.goog-te-gadget-icon',
        '.goog-te-combo',
        '#google_translate_element'
      ];

      elementsToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.display = 'none';
            element.style.visibility = 'hidden';
          }
        });
      });

      // Ajustar estilos del body
      if (document.body) {
        document.body.style.top = '0px';
        document.body.style.position = 'static';
      }
      
    } catch (error) {
      console.error('Error al ocultar elementos:', error);
    }
  }

  /**
   * Remueve el widget de traducción
   */
  private removeTranslateWidget(): void {
    try {
      // Remover elementos del DOM
      const elementsToRemove = [
        '#google_translate_element',
        '.goog-te-banner-frame',
        '.skiptranslate',
        'script[src*="translate.googleapis.com"]'
      ];

      elementsToRemove.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          element.remove();
        });
      });

      // Limpiar función global
      delete (window as any).googleTranslateElementInit;
      
    } catch (error) {
      console.error('Error al remover widget:', error);
    }
  }

  /**
   * Obtiene el idioma actual
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Obtiene el idioma guardado en localStorage
   */
  getSavedLanguage(): string | null {
    try {
      return localStorage.getItem('selectedLanguage');
    } catch (error) {
      console.error('Error al obtener idioma guardado:', error);
      return null;
    }
  }
}
