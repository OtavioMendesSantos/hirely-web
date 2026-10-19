import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StartupLoadingService } from '../services/startup-loading';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url === environment.apiUrl || req.url.startsWith(`${environment.apiUrl}/`)) {
    req = req.clone({
      withCredentials: true,
    });
    const path = req.url.slice(environment.apiUrl.length).split('?')[0];
    if (['/users/me', '/auth/login', '/auth/google/login', '/auth/google/url'].includes(path)) {
      const loading = inject(StartupLoadingService);
      const finish = loading.begin();
      return next(req).pipe(
        timeout(45000),
        catchError((error) => {
          if (path === '/users/me' && error.status !== 401 && error.status !== 403) {
            loading.error.set("We couldn't connect to your workspace. Please try again.");
          }
          return throwError(() => error);
        }),
        finalize(finish)
      );
    }
  }
  return next(req);
};
