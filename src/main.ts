import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Inicializar tema automáticamente antes de cargar la aplicación
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'auto';
  
  function applyTheme(theme: 'light' | 'dark') {
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
  }
  
  if (savedTheme === 'auto') {
    const hour = new Date().getHours();
    const isDarkTime = hour >= 19 || hour < 7;
    applyTheme(isDarkTime ? 'dark' : 'light');
  } else {
    applyTheme(savedTheme as 'light' | 'dark');
  }
}

// Aplicar tema inmediatamente
initializeTheme();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
