import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit {
  estaAutenticado = false;
  nombreUsuario = '';

  constructor(private authservice: AuthService, private toastr: ToastrService) {

  }
  ngOnInit(): void {
    this.authservice.isAuthenticated().subscribe({
      next:(respuesta) => {
        this.estaAutenticado = respuesta;
        if (respuesta) {
          this.obtenerNombreUsuario();
        }
      }
    });
  }

  obtenerNombreUsuario() {
    // Obtener el nombre del usuario del localStorage
    const nombre = localStorage.getItem('nameUser');
    this.nombreUsuario = nombre || 'Usuario';
  }

  logout() {
    this.authservice.logout();
    this.toastr.info("Se cerró la sesión correctamente");
  }

}
