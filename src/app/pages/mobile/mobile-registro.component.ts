import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Usuario } from '../../model/usuario.model';

@Component({
  selector: 'app-mobile-registro',
  templateUrl: './mobile-registro.component.html',
  styleUrls: ['./mobile-registro.component.css']
})
export class MobileRegistroComponent {
  usuario: Usuario = new Usuario();
  loading: boolean = false;
  error: string = '';
  success: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  registrar() {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.authService.register(this.usuario).subscribe({
      next: () => {
        this.loading = false;
        this.success = '¡Registro exitoso! Redirigiendo...';
        setTimeout(() => this.router.navigate(['/mobile/login']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al registrar. Verifica los datos.';
      }
    });
  }
}
