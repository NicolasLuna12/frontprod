import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { SecurityService } from './security.service';
import { TourService } from './tour.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'appUSERS/';
  private imagenPerfilSubject = new BehaviorSubject<string | null>(localStorage.getItem('imagenPerfil'));
  imagenPerfil$ = this.imagenPerfilSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private toastr: ToastrService,
    private securityService: SecurityService,
    private tourService: TourService
  ) { }

  login(email: string, password: string): Observable<any> {
    // Simula una llamada HTTP POST a tu API de autenticación
    return this.http.post<{ 
      access: string, 
      user_id: string, 
      nombre: string, 
      apellido: string, 
      email: string, 
      direccion?: string, 
      telefono?: string, 
      imagen_perfil_url?: string 
    }>(`${this.apiUrl}login/`, { email, password }).pipe(
      map(response => {
        
        // Usar SecurityService para almacenar datos de forma segura
        this.securityService.setToken(response.access);
        this.securityService.setUserData({
          user_id: response.user_id,
          nombre: response.nombre,
          apellido: response.apellido,
          email: response.email,
          direccion: response.direccion,
          telefono: response.telefono,
          imagen_perfil_url: response.imagen_perfil_url
        });

        // Mantener compatibilidad con código existente (temporal)
        localStorage.setItem('nameUser', response.nombre+' '+response.apellido);
        localStorage.setItem('emailUser', response.email);
        localStorage.setItem('idUser', response.user_id);
        
        // Guardar la dirección del usuario si viene en la respuesta
        if (response.direccion) {
          localStorage.setItem('direccion', response.direccion);
        }
        
        // Guardar el teléfono si viene en la respuesta
        if (response.telefono) {
          localStorage.setItem('telefono', response.telefono);
        }
        
        // Guardar la URL de la imagen de perfil SIEMPRE que venga del backend
        if (response.imagen_perfil_url) {
          localStorage.setItem('imagenPerfil', response.imagen_perfil_url);
          this.imagenPerfilSubject.next(response.imagen_perfil_url); // Notificar cambio
        } else {
          localStorage.removeItem('imagenPerfil');
          this.imagenPerfilSubject.next(null);
        }
       
        // Iniciar tour para usuario demo
        if (response.email === 'demo@demo.com') {
          this.toastr.info("🎯 Iniciando tour guiado de la plataforma...", "Usuario Demo");
          // Usar setTimeout para asegurar que el login se complete antes de iniciar el tour
          setTimeout(() => {
            this.tourService.startTour(response.email);
          }, 1500);
        }
       
        this.toastr.success("Bienvenida/o "+response.nombre+' '+response.apellido+'!');
        return response;

      })
    );
  }

  logout() {
    // Usar SecurityService para limpiar todos los datos
    this.securityService.clearAuthData();
  }

  isAuthenticated(): Observable<boolean> {
    return this.securityService.authStatus$;
  }

  // Nuevo método para actualizar la URL de la imagen de perfil en el backend usando el endpoint de update
  // updateUserProfileImage(imageUrl: string): Observable<any> {
  //   const userId = localStorage.getItem('idUser');
  //   // Puedes agregar más campos si tu backend los requiere
  //   return this.http.put<any>(`${this.apiUrl}update/`, { id_usuario: userId, imagen_perfil_url: imageUrl });
  // }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}register/`, userData).pipe(
      map(response => {
        if (response.re_registro && response.nombre) {
          this.toastr.success('Gracias por volver a elegirnos, ' + response.nombre + '!');
        } else {
          this.toastr.success('Registro exitoso!');
        }
        return response;
      })
    );
  }

  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}update/`, userData).pipe(
      map(response => {
        // Si se actualizó la imagen de perfil, actualizar el observable
        if (userData.imagen_perfil_url) {
          localStorage.setItem('imagenPerfil', userData.imagen_perfil_url);
          this.imagenPerfilSubject.next(userData.imagen_perfil_url);
        }
        return response;
      })
    );
  }
  
  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}delete/`).pipe(
      map(response => {
        this.toastr.success('Usuario eliminado con éxito!');
        // Al eliminar el usuario, también cerramos su sesión
        this.logout();
        return response;
      })
    );
  }
  
  // Método para obtener el perfil del usuario incluyendo su dirección
  getUserProfile(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}user/${userId}/`);
  }

  // Nuevo método para obtener el perfil actualizado del usuario autenticado
  getUserProfileMe(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}me/`);
  }

  // Método para actualizar la URL de la imagen de perfil manualmente (opcional)
  setImagenPerfilUrl(url: string | null) {
    if (url) {
      localStorage.setItem('imagenPerfil', url);
    } else {
      localStorage.removeItem('imagenPerfil');
    }
    this.imagenPerfilSubject.next(url);
  }
}
