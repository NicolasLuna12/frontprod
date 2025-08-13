import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SecurityService } from '../security.service'; 
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const securityService = inject(SecurityService);
  const router = inject(Router);

  return securityService.authStatus$.pipe(
    map(isAuthenticated => {
      if (isAuthenticated && securityService.hasValidToken()) {
        return true;
      } else {
        // Limpiar datos si el token ha expirado
        securityService.clearAuthData();
        router.navigate(['/login']);
        return false;
      }
    })
  );
};
