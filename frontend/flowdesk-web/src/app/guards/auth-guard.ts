import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('flowdesk_token');

  if (token) {
    return true;
  }

  return router.createUrlTree(['/'], {
    queryParams: {
      returnUrl: state.url,
    },
  });
};