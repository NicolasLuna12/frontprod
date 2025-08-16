import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-particles-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="particles-container">
      <div class="particle" *ngFor="let particle of particles; trackBy: trackByIndex"></div>
      <div class="liquid-blob" 
           style="position: absolute; width: 200px; height: 200px; top: 10%; left: 5%; z-index: -1;"></div>
      <div class="liquid-blob" 
           style="position: absolute; width: 150px; height: 150px; top: 60%; right: 10%; z-index: -1;"></div>
      <div class="liquid-blob" 
           style="position: absolute; width: 100px; height: 100px; bottom: 20%; left: 20%; z-index: -1;"></div>
    </div>
  `,
  styleUrls: []
})
export class ParticlesBackgroundComponent implements OnInit, OnDestroy {
  particles: number[] = [];
  private animationFrame?: number;

  ngOnInit() {
    this.particles = Array(12).fill(0).map((_, i) => i);
    this.startAnimation();
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  private startAnimation() {
    const animate = () => {
      // Las animaciones CSS manejan el movimiento
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }
}
