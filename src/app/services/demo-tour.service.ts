import { Injectable } from '@angular/core';
import { JoyrideService } from 'ngx-joyride';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class DemoTourService {
  private demoEmail = 'demo@demo.com';

  constructor(private joyrideService: JoyrideService, private router: Router) {}

  startTourIfDemoUser() {
    const email = localStorage.getItem('emailUser');
    if (email === this.demoEmail) {
      this.joyrideService.startTour({
        steps: [
          'homeStep',
          'cartaStep',
          'carritoStep',
          'perfilStep',
        ],
        showPrevButton: true,
        stepDefaultPosition: 'bottom',
        themeColor: '#007bff',
      });
    }
  }
}
