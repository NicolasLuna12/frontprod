import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Usuario } from '../../model/usuario.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  perfilForm: FormGroup;
  usuario: any = {};
  cargando = false;
  
  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private toastr: ToastrService
  ) {
    this.perfilForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario(): void {
    const userId = localStorage.getItem('idUser');
    if (userId) {
      this.cargando = true;
      // Aquí normalmente harías una petición para obtener los datos del usuario
      // por ahora simularemos con datos del localStorage
      const nombre = localStorage.getItem('nameUser') || '';
      const [nombreUsuario, apellidoUsuario] = nombre.split(' ');
      
      this.perfilForm.patchValue({
        nombre: nombreUsuario,
        apellido: apellidoUsuario || '',
        email: 'usuario@ejemplo.com', // Esto debería venir del backend
        telefono: '123456789', // Esto debería venir del backend
        direccion: 'Dirección de ejemplo' // Esto debería venir del backend
      });
      
      this.cargando = false;
    }
  }

  actualizarPerfil(): void {
    if (this.perfilForm.invalid) {
      this.toastr.error('Por favor, complete todos los campos requeridos');
      return;
    }

    const userId = localStorage.getItem('idUser');
    if (!userId) {
      this.toastr.error('No se pudo identificar al usuario');
      return;
    }

    this.cargando = true;
    const datosUsuario = {
      ...this.perfilForm.value,
      id_usuario: userId
    };

    this.authService.updateUser(userId, datosUsuario).subscribe({
      next: (response) => {
        this.toastr.success('Perfil actualizado con éxito');
        // Actualizar nombre en localStorage
        localStorage.setItem('nameUser', `${datosUsuario.nombre} ${datosUsuario.apellido}`);
        this.cargando = false;
      },
      error: (error) => {
        this.toastr.error('Error al actualizar el perfil');
        console.error('Error:', error);
        this.cargando = false;
      }
    });
  }

  eliminarCuenta(): void {
    const userId = localStorage.getItem('idUser');
    if (!userId) {
      this.toastr.error('No se pudo identificar al usuario');
      return;
    }
    
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      this.authService.deleteUser(userId).subscribe({
        next: () => {
          // El método logout ya está siendo llamado dentro de deleteUser
          this.toastr.success('Cuenta eliminada correctamente');
        },
        error: (error) => {
          this.toastr.error('Error al eliminar la cuenta');
          console.error('Error:', error);
        }
      });
    }
  }
}