import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourService, TourStep } from '../../services/tour.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tour-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour-modal.component.html',
  styleUrls: ['./tour-modal.component.css']
})
export class TourModalComponent implements OnInit, OnDestroy {
  // Para el modal global (navegación entre páginas)
  isActive = false;
  currentStep: TourStep | null = null;
  currentStepNumber = 1;
  totalSteps = 1;
  
  // Para el modal específico de página
  showPageModal = false;
  currentPageStep: TourStep | null = null;
  
  private subscriptions: Subscription[] = [];

  constructor(private tourService: TourService) {}

  ngOnInit(): void {
    // Suscribirse al estado del tour global
    this.subscriptions.push(
      this.tourService.tourActive$.subscribe(isActive => {
        this.isActive = isActive;
      })
    );

    // Suscribirse al paso actual del tour global
    this.subscriptions.push(
      this.tourService.currentStep$.subscribe(() => {
        this.currentStep = this.tourService.getCurrentStep();
        this.currentStepNumber = this.tourService.getCurrentStepNumber();
        this.totalSteps = this.tourService.getTotalSteps();
      })
    );

    // Suscribirse al modal específico de página
    this.subscriptions.push(
      this.tourService.showPageModal$.subscribe(showModal => {
        this.showPageModal = showModal;
      })
    );

    // Suscribirse al paso de página actual
    this.subscriptions.push(
      this.tourService.currentPageStep$.subscribe(pageStep => {
        this.currentPageStep = pageStep;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Métodos para el tour global
  nextStep(): void {
    this.tourService.nextStep();
  }

  previousStep(): void {
    this.tourService.previousStep();
  }

  closeTour(): void {
    this.tourService.stopTour();
  }

  skipTour(): void {
    this.tourService.stopTour();
  }

  // Métodos para el modal de página específica
  closePageModal(): void {
    this.tourService.closePageModal();
  }

  nextPageFromModal(): void {
    this.tourService.closePageModal();
    this.tourService.nextStep();
  }

  previousPageFromModal(): void {
    this.tourService.closePageModal();
    this.tourService.previousStep();
  }

  skipTourFromModal(): void {
    this.tourService.stopTour();
  }
}
