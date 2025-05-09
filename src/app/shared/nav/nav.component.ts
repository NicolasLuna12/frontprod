import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
  imagenPerfil: string | null = null;

  constructor(
    private authservice: AuthService, 
    private toastr: ToastrService,
    private router: Router
  ) {

  }
  ngOnInit(): void {
    this.authservice.isAuthenticated().subscribe({
      next:(respuesta) => {
        this.estaAutenticado = respuesta;
        if (respuesta) {
          this.obtenerNombreUsuario();
          this.obtenerImagenPerfil();
        }
      }
    });
  }
  obtenerNombreUsuario() {
    // Obtener el nombre del usuario del localStorage
    const nombreCompleto = localStorage.getItem('nameUser');
    if (nombreCompleto) {
      // Extraer solo el primer nombre
      const primerNombre = nombreCompleto.split(' ')[0];
      // Asegurar que la primera letra sea mayúscula
      this.nombreUsuario = primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1).toLowerCase();
    } else {
      this.nombreUsuario = 'Usuario';
    }
  }

  obtenerImagenPerfil() {
    // Obtener la imagen de perfil del localStorage
    const imagen = localStorage.getItem('profileImage');
    this.imagenPerfil = imagen;
  }

  logout() {
    this.authservice.logout();
    this.toastr.info("Se cerró la sesión correctamente");
    // Redirigir al home después de logout
    this.router.navigate(['/home']);
  }

}
