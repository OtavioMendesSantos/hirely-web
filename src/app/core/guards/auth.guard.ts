import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  if (!token) {
    router.navigate(['/auth']);
    return false;
  }

  if (authService.currentUser() !== null) {
    return true;
  }

  return authService.checkAuth().pipe(
    map(() => true),
    catchError(() => {
      return of(false);
    }),
  );
};
