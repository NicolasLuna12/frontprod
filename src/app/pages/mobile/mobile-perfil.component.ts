import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Usuario } from '../../model/usuario.model';

@Component({
  selector: 'app-mobile-perfil',
  templateUrl: './mobile-perfil.component.html',
  styleUrls: ['./mobile-perfil.component.css']
})
export class MobilePerfilComponent implements OnInit {
  usuario: Usuario = new Usuario();
  loading: boolean = false;
  error: string = '';
  success: string = '';

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.loading = true;
    const id = localStorage.getItem('idUser');
    if (!id) {
      this.error = 'No autenticado.';
      this.loading = false;
      return;
    }
    this.authService.getUserProfile(id).subscribe({
      next: (data) => {
        this.usuario = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar perfil';
        this.loading = false;
      }
    });
  }

  guardarPerfil() {
    this.loading = true;
    this.userService.updateUser(this.usuario).subscribe({
      next: () => {
        this.success = 'Perfil actualizado correctamente';
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al actualizar perfil';
        this.loading = false;
      }
    });
  }
}
