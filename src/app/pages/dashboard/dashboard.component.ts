import { Component, OnInit } from '@angular/core';
import { DashboardService, IPedido, IPedidosData } from '../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements OnInit{

  pedidosData: IPedidosData = { pendientes: [], aprobados: [], entregados: [] };
  pedidosFiltrados: IPedido[] = [];
  activeTab: string = 'Pendientes';
  nombre: string = '';
  isLoading: boolean = true; // Añadir indicador de carga
  
  constructor(private dashboardService: DashboardService, private authService: AuthService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.nombre = localStorage.getItem('nameUser') || '';
    this.obtenerPedidos();
  }
  obtenerPedidos(): void {
    this.isLoading = true; // Comenzar la carga
    this.dashboardService.obtenerPedidos().subscribe({
      next:(data: IPedidosData) => {
        console.log('Datos recibidos del dashboard:', data);
        // Asegurarse de que todos los arrays existan incluso si la API no los devuelve
        this.pedidosData = {
          pendientes: data.pendientes || [],
          aprobados: data.aprobados || [],
          entregados: data.entregados || []
        };
        this.setActiveTab(this.activeTab);
        this.isLoading = false; // Finalizar la carga
      }, 
      error: (error) => {
        console.error('Error al obtener pedidos:', error);
        
        if (error.error && error.error.detail === 'Given token not valid for any token type') {
          this.toastr.info(
            'Su sesión ha expirado. Debe iniciar sesión nuevamente'
          );
          this.authService.logout();        } else {
          // Mostrar un mensaje de error más genérico para otros errores
          this.toastr.error('No se pudieron cargar los pedidos. Intente nuevamente más tarde.');
        }
        this.isLoading = false; // Finalizar la carga incluso si hay error
      },
    });
  }


  //filtro los pedidos
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    switch (tab) {
      case 'Pendientes':
        this.pedidosFiltrados = this.pedidosData.pendientes || [];
        break;
      case 'Aprobados':
        this.pedidosFiltrados = this.pedidosData.aprobados || [];
        break;
      case 'Entregados':
        this.pedidosFiltrados = this.pedidosData.entregados || [];
        break;
      default:
        this.pedidosFiltrados = [];
    }
  }
}
