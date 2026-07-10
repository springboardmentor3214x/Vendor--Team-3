import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SidebarService } from '../layout/sidebar.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const sidebarService = inject(SidebarService);
  
  const expectedRoles = route.data?.['roles'] as Array<string>;
  const currentRole = sidebarService.getCurrentRole();
  
  if (expectedRoles && expectedRoles.includes(currentRole)) {
    return true;
  }
  
  // If not allowed, redirect to their role-based dashboard
  const defaultRoute = sidebarService.getDashboardRoute();
  router.navigate([defaultRoute]);
  return false;
};
