import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SidebarService } from '../layout/sidebar.service';
import { PermissionEngineService } from './permission-engine.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const sidebarService = inject(SidebarService);
  const permissionEngine = inject(PermissionEngineService);
  
  const expectedRoles = route.data?.['roles'] as Array<string>;
  const requiredPermissions = route.data?.['permissions'] as Array<string>;
  const currentRole = sidebarService.getCurrentRole();
  
  // 1. Check Granular Permissions (New standard)
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(perm => permissionEngine.hasPermission(perm));
    if (hasAllPermissions) {
      return true;
    }
  } 
  // 2. Check Role-based Fallback (Legacy)
  else if (expectedRoles && expectedRoles.includes(currentRole)) {
    return true;
  }
  
  // If not allowed, redirect to their role-based dashboard
  const defaultRoute = sidebarService.getDashboardRoute();
  router.navigate([defaultRoute]);
  return false;
};
