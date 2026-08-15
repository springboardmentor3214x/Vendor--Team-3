import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');
  const isOnboarded = localStorage.getItem('isOnboarded');

  if (token) {
    if (role === 'Vendor' && isOnboarded === 'false' && state.url !== '/onboarding') {
      router.navigate(['/onboarding']);
      return false;
    }
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
