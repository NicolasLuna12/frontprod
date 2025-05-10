import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Usuario } from '../../model/usuario.model';
import { ImageUploadService } from '../../services/image-upload.service';

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
  
  // Variables para la imagen de perfil
  imagenPerfil: string | null = null;
  imagenError: string | null = null;
  imagenArchivo: File | null = null;
  
  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private toastr: ToastrService,
    private imageUploadService: ImageUploadService // Inyectar el servicio
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
    this.cargarImagenPerfil();
  }

  // Método para cargar la imagen de perfil guardada
  cargarImagenPerfil(): void {
    const imagenGuardada = localStorage.getItem('profileImage');
    if (imagenGuardada) {
      this.imagenPerfil = imagenGuardada;
    }
  }

  // Método para manejar la selección de una nueva imagen
  onImagenSeleccionada(event: any): void {
    this.imagenError = null;
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.imagenError = 'La imagen no debe superar los 2MB';
        return;
      }
      // Validar tipo de archivo
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
        this.imagenError = 'Formato de imagen no válido. Use JPG, PNG, GIF o WEBP.';
        return;
      }
      this.imagenArchivo = file;
      this.cargando = true;
      // Subir a Cloudinary automáticamente
      this.imageUploadService.uploadImage(file).subscribe({
        next: (res) => {
          this.imagenPerfil = res.secure_url;
          localStorage.setItem('profileImage', res.secure_url);
          this.toastr.success('Imagen subida correctamente');
          this.cargando = false;
        },
        error: (err) => {
          this.imagenError = 'Error al subir la imagen';
          this.cargando = false;
        }
      });
    }
  }

  cargarDatosUsuario(): void {
    const userId = localStorage.getItem('idUser');
    if (userId) {
      this.cargando = true;
      // Aquí normalmente harías una petición para obtener los datos del usuario
      // por ahora simularemos con datos del localStorage
      const nombre = localStorage.getItem('nameUser') || '';
      const [nombreUsuario, apellidoUsuario] = nombre.split(' ');
      const email = localStorage.getItem('emailUser') || 'usuario@ejemplo.com';
      
      this.perfilForm.patchValue({
        nombre: nombreUsuario,
        apellido: apellidoUsuario || '',
        email: email, // Ahora usamos el email del localStorage
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
      id_usuario: userId,
      // En una aplicación real, aquí se enviaría también la imagen al servidor
      imagen_perfil: this.imagenPerfil
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