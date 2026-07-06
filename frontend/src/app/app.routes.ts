import { Routes } from '@angular/router';
import { CoreLayoutComponent } from './layout/core-layout/core-layout.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard/admin-dashboard.component';
import { VendorDashboardComponent } from './dashboard/vendor-dashboard/vendor-dashboard.component';
import { ProcurementDashboardComponent } from './dashboard/procurement-dashboard/procurement-dashboard.component';
import { VendorManagementComponent } from './management/vendor-management/vendor-management.component';
import { PurchaseOrdersComponent } from './management/purchase-orders/purchase-orders.component';
import { ReportsDashboardComponent } from './dashboard/reports-dashboard/reports-dashboard.component';
import { NotificationsScreenComponent } from './dashboard/notifications-screen/notifications-screen.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: CoreLayoutComponent,
    children: [
      { path: 'admin-dashboard', component: AdminDashboardComponent },
      { path: 'vendor-dashboard', component: VendorDashboardComponent },
      { path: 'procurement-dashboard', component: ProcurementDashboardComponent },
      { path: 'vendors', component: VendorManagementComponent },
      { path: 'purchase-orders', component: PurchaseOrdersComponent },
      { path: 'reports', component: ReportsDashboardComponent },
      { path: 'notifications', component: NotificationsScreenComponent },
      { path: '', redirectTo: 'admin-dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
