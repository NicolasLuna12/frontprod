import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, DatePipe } from '@angular/common';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="theme-selector-container">
      <div class="theme-selector-wrapper">
        <div class="theme-selector-header">
          <i class="bi bi-palette-fill theme-icon"></i>
          <span class="theme-label">Tema</span>
        </div>
        
        <div class="theme-options">
          <button 
            class="theme-option"
            [class.active]="currentTheme === 'light'"
            (click)="setTheme('light')"
            title="Tema Claro">
            <i class="bi bi-sun-fill"></i>
            <span>Claro</span>
          </button>
          
          <button 
            class="theme-option"
            [class.active]="currentTheme === 'dark'"
            (click)="setTheme('dark')"
            title="Tema Oscuro">
            <i class="bi bi-moon-stars-fill"></i>
            <span>Oscuro</span>
          </button>
          
          <button 
            class="theme-option"
            [class.active]="currentTheme === 'auto'"
            (click)="setTheme('auto')"
            title="Automático según la hora">
            <i class="bi bi-clock-fill"></i>
            <span>Auto</span>
          </button>
        </div>
        
        <div class="current-time" *ngIf="currentTheme === 'auto'">
          <small>{{ currentTime | date:'HH:mm' }}</small>
        </div>
      </div>
    </div>
  `,
  styleUrl: './theme-selector.component.css'
})
export class ThemeSelectorComponent implements OnInit {
  currentTheme: Theme = 'auto';
  currentTime: Date = new Date();

  constructor(
    private themeService: ThemeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.currentTheme = this.themeService.getCurrentTheme();
      
      // Actualizar la hora cada minuto
      setInterval(() => {
        this.currentTime = new Date();
      }, 60000);
    }
  }

  setTheme(theme: Theme) {
    this.currentTheme = theme;
    this.themeService.setTheme(theme);
  }
}
