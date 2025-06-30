import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from './services/auth.service';


export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const currentUser = authService.currentUser;

 

  if (currentUser && currentUser()) {

    const accessToken = currentUser()!.accessToken;
    const refreshToken = currentUser()!.refreshToken;

    const Authorization = `Bearer ${accessToken}`;
    const userId = String(currentUser()!.id);

    return next(req.clone({ setHeaders: { Authorization } })).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === HttpStatusCode.Unauthorized && !authService.refreshTokenInProcess) {
          authService.refreshTokenInProcess = true;

          return authService.requestNewToken().pipe(
            switchMap(() => {
              authService.refreshTokenInProcess = false;
             
              const newAuthorization = `Bearer ${refreshToken}`;

              return next(req.clone({ setHeaders: { Authorization: newAuthorization } }));
            }),
            catchError(err => {
              authService.refreshTokenInProcess = false;
              
              authService.logout(userId);
              router.navigate(['/login']);
              return throwError(() => err);
            })
          );
        } else if (error.status === HttpStatusCode.Forbidden) {
          router.navigate(['/no-access', error.status]); //Route to forbidden page
        } else if (error.status === HttpStatusCode.NotAcceptable) {
          authService.logout(userId);
          router.navigate(['/disabled']); //Route to forbidden page
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
