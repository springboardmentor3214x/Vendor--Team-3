import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { AdminComponent } from './dashboard/admin/admin.component';
import { ProcurementManagerComponent } from './dashboard/procurement-manager/procurement-manager.component';
import { SupplyChainManagerComponent } from './dashboard/supply-chain-manager/supply-chain-manager.component';
import { FinanceOfficerComponent } from './dashboard/finance-officer/finance-officer.component';
import { AuditorComponent } from './dashboard/auditor/auditor.component';
import { VendorDashboardComponent } from './dashboard/vendor-dashboard/vendor-dashboard.component';
import { VendorListComponent } from './management/vendor-list/vendor-list.component';
import { AddVendorComponent } from './management/add-vendor/add-vendor.component';
import { VendorDetailsComponent } from './management/vendor-details/vendor-details.component';
import { VendorApprovalComponent } from './management/vendor-approval/vendor-approval.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  
  // Protected dashboards
  { path: 'admin-dashboard', component: AdminComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'procurement-dashboard', component: ProcurementManagerComponent, canActivate: [authGuard, roleGuard], data: { roles: ['procurement'] } },
  { path: 'supply-chain-dashboard', component: SupplyChainManagerComponent, canActivate: [authGuard, roleGuard], data: { roles: ['supply'] } },
  { path: 'finance-dashboard', component: FinanceOfficerComponent, canActivate: [authGuard, roleGuard], data: { roles: ['finance'] } },
  { path: 'auditor-dashboard', component: AuditorComponent, canActivate: [authGuard, roleGuard], data: { roles: ['auditor'] } },
  { path: 'vendor-dashboard', component: VendorDashboardComponent, canActivate: [authGuard, roleGuard], data: { roles: ['vendor'] } },
  
  // Protected management sub-pages
  { path: 'vendors', component: VendorListComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'procurement'] } },
  { path: 'add-vendor', component: AddVendorComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'procurement'] } },
  { path: 'vendor-details', component: VendorDetailsComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'procurement'] } },
  { path: 'vendor-approval', component: VendorApprovalComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'procurement'] } },
  
  // Profile settings accessible to all authenticated users
  { path: 'profile', component: UserProfileComponent, canActivate: [authGuard] },
  
  { path: '**', redirectTo: 'login' }
];
