import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const API_URL = 'http://127.0.0.1:8000';

export const authInterceptor: HttpInterceptorFn = (
  request,
  next,
) => {
  const router = inject(Router);
  const token = localStorage.getItem('flowdesk_token');

  let authenticatedRequest = request;

  if (token && request.url.startsWith(API_URL)) {
    authenticatedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        request.url.startsWith(API_URL)
      ) {
        localStorage.removeItem('flowdesk_token');
        router.navigate(['/']);
      }

      return throwError(() => error);
    }),
  );
};