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
import { UserProfileComponent } from './user-profile/user-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'admin-dashboard', component: AdminComponent },
  { path: 'procurement-dashboard', component: ProcurementManagerComponent },
  { path: 'supply-chain-dashboard', component: SupplyChainManagerComponent },
  { path: 'finance-dashboard', component: FinanceOfficerComponent },
  { path: 'auditor-dashboard', component: AuditorComponent },
  { path: 'vendor-dashboard', component: VendorDashboardComponent },
  { path: 'vendors', component: VendorListComponent },
  { path: 'add-vendor', component: AddVendorComponent },
  { path: 'vendor-details', component: VendorDetailsComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: '**', redirectTo: 'login' }
];
