import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = new BehaviorSubject<Theme>('auto');
  public theme$ = this.currentTheme.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
    }
  }

  private initializeTheme() {
    const savedTheme = localStorage.getItem('theme') as Theme || 'auto';
    this.setTheme(savedTheme);
    
    // Escuchar cambios en el tiempo para el modo automático
    setInterval(() => {
      if (this.currentTheme.value === 'auto') {
        this.applyAutoTheme();
      }
    }, 60000); // Revisar cada minuto
  }

  setTheme(theme: Theme) {
    this.currentTheme.next(theme);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', theme);
      
      if (theme === 'auto') {
        this.applyAutoTheme();
      } else {
        this.applyTheme(theme);
      }
    }
  }

  private applyAutoTheme() {
    const hour = new Date().getHours();
    // Tema oscuro de 19:00 a 06:59, tema claro de 07:00 a 18:59
    const isDarkTime = hour >= 19 || hour < 7;
    this.applyTheme(isDarkTime ? 'dark' : 'light');
  }

  private applyTheme(theme: 'light' | 'dark') {
    const root = document.documentElement;
    
    // Remover clases anteriores
    root.classList.remove('theme-light', 'theme-dark');
    
    // Añadir nueva clase
    root.classList.add(`theme-${theme}`);
    
    // Añadir clase de transición suave
    root.classList.add('theme-transition');
    
    // Remover clase de transición después de la animación
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);
  }

  getCurrentTheme(): Theme {
    return this.currentTheme.value;
  }

  getResolvedTheme(): 'light' | 'dark' {
    if (this.currentTheme.value === 'auto') {
      const hour = new Date().getHours();
      return (hour >= 19 || hour < 7) ? 'dark' : 'light';
    }
    return this.currentTheme.value;
  }
}
