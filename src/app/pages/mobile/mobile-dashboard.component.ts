import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-mobile-dashboard',
  templateUrl: './mobile-dashboard.component.html',
  styleUrls: ['./mobile-dashboard.component.css']
})
export class MobileDashboardComponent implements OnInit {
  resumen: any = null;
  loading: boolean = false;
  error: string = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.cargarResumen();
  }

  cargarResumen() {
    this.loading = true;
    this.dashboardService.obtenerPedidos().subscribe({
      next: (data) => {
        this.resumen = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar dashboard';
        this.loading = false;
      }
    });
  }
}
