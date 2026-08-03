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
import { SettingsComponent } from './settings/settings.component';
import { VendorDetailsComponent } from './management/vendor-details/vendor-details.component';
import { VendorApprovalComponent } from './management/vendor-approval/vendor-approval.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UsersComponent } from './management/users/users.component';
import { RoleManagementComponent } from './management/role-management/role-management.component';
import { ProcurementComponent } from './management/procurement/procurement.component';
import { PurchaseOrdersComponent } from './management/purchase-orders/purchase-orders.component';
import { ContractsComponent } from './management/contracts/contracts.component';
import { PerformanceComponent } from './management/performance/performance.component';
import { ReliabilityComponent } from './management/reliability/reliability.component';
import { InvoicesComponent } from './management/invoices/invoices.component';
import { CommunicationComponent } from './management/communication/communication.component';
import { ReportsComponent } from './management/reports/reports.component';
import { RfqComponent } from './management/rfq/rfq.component';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';
import { VendorComparisonComponent } from './management/vendor-comparison/vendor-comparison.component';
import { GoodsReceiptComponent } from './management/goods-receipt/goods-receipt.component';
import { AuditLogsComponent } from './management/audit-logs/audit-logs.component';

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
  { path: 'add-vendor', component: AddVendorComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'vendor-details', component: VendorDetailsComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'procurement'] } },
  { path: 'vendor-approval', component: VendorApprovalComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'procurement'] } },
  
  // New features routes
  { path: 'vendor-comparison', component: VendorComparisonComponent, canActivate: [authGuard, roleGuard], data: { permissions: ['vendor.compare'] } },
  { path: 'role-management', component: RoleManagementComponent, canActivate: [authGuard, roleGuard], data: { permissions: ['role.view'] } },
  { path: 'users', component: UsersComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'procurement', component: ProcurementComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'procurement'] } },
  { path: 'orders', component: PurchaseOrdersComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'procurement', 'supply', 'finance', 'vendor'] } },
  { path: 'contracts', component: ContractsComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'procurement', 'auditor', 'vendor'] } },
  { path: 'performance', component: PerformanceComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'procurement', 'supply', 'vendor'] } },
  { path: 'reliability', component: ReliabilityComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'procurement', 'supply', 'vendor'] } },
  { path: 'invoices', component: InvoicesComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'finance', 'vendor'] } },
  { path: 'messages', component: CommunicationComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'procurement', 'supply', 'finance', 'vendor'] } },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'procurement', 'supply', 'finance', 'auditor'] } },
  { path: 'rfq', component: RfqComponent, canActivate: [authGuard, roleGuard], data: { permissions: ['rfq.view'] } },
  { path: 'goods-receipt', component: GoodsReceiptComponent, canActivate: [authGuard, roleGuard], data: { permissions: ['delivery.receipt'] } },
  { path: 'audit-logs', component: AuditLogsComponent, canActivate: [authGuard, roleGuard], data: { permissions: ['audit.view'] } },


  // Profile settings accessible to all authenticated users
  { path: 'profile', component: UserProfileComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  
  { path: '**', redirectTo: 'login' }
];
