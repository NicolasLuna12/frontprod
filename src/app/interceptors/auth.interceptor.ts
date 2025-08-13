import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SecurityService } from '../services/security.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const securityService = inject(SecurityService);
  
  let token = securityService.getToken();
  
  const baseURL = environment.apiBaseUrl;

  // Verificar si la URL ya tiene el baseURL para evitar duplicación
  const isAbsoluteUrl = req.url.startsWith('http://') || req.url.startsWith('https://');

  // No agregar Authorization si es Cloudinary
  const isCloudinary = req.url.includes('cloudinary.com');

  // Comprobar si el token está presente y si no es una petición a Cloudinary
  // Si ya tiene headers de Authorization, no los sobrescribimos
  if (token && !isCloudinary && !req.headers.has('Authorization')) {
    // Clonamos la solicitud y añadimos el header de Authorization
    req = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Authorization header añadido para checkout (solo debug)
    if (req.url.includes('checkout') && !environment.production) {
      // Authorization header añadido para checkout
    }
  }

  // Ahora manejar la base URL si es necesario
  if (!isAbsoluteUrl) {
    // Construir la URL absoluta
    req = req.clone({
      url: baseURL + req.url
    });

    // URL construida con base URL (solo debug)
    if (req.url.includes('checkout') && !environment.production) {
      // URL construida con base URL
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        // Error de autenticación detectado
        
        // Si es un error de autenticación y estamos en una ruta que requiere autenticación
        if (!req.url.includes('login')) {
          // Mostrar mensaje al usuario
          toastr.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          
          // Redirigir al login si es necesario
          if (error.status === 401) {
            // Limpiar todos los datos de autenticación
            securityService.clearAuthData();
            router.navigate(['/login']);
          }
        }
      } else if (error.status === 500) {
        // Error del servidor detectado
        
        // Si es un error del servidor en el proceso de pago
        if (req.url.includes('checkout')) {
          // Log específico para errores de pago (solo en desarrollo)
          if (!environment.production) {
            console.error('Error en la solicitud de pago:', {
              url: req.url,
              method: req.method,
              status: error.status
            });
          }
          
          // Mostrar mensaje específico para errores de pago
          toastr.error('Error al procesar el pago. Por favor, intenta nuevamente.');
        } else {
          toastr.error('Error del servidor. Por favor, intenta de nuevo más tarde.');
        }
      } else if (error.status === 400) {
        // Error HTTP 400 - Bad Request (solo log en desarrollo)
        if (!environment.production) {
          console.error(`Error HTTP 400:`, error);
        }
        
        // Mostrar mensaje específico para errores de validación
        if (error.error && error.error.detail) {
          toastr.error(error.error.detail);
        } else {
          toastr.error('Error en los datos enviados. Por favor, verifica la información.');
        }
      } else {
        // Otros errores HTTP (solo log en desarrollo)
        if (!environment.production) {
          console.error(`Error HTTP ${error.status}:`, error.message);
        }
        toastr.error('Error de conexión. Por favor, verifica tu conexión a internet.');
      }
      
      return throwError(() => error);
    })
  );
};
