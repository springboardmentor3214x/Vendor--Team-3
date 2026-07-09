import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;

  constructor(private router: Router) {}

  onLogin() {
    // Mock role-based routing — will be replaced by real JWT auth from backend
    const roleRoutes: { [key: string]: string } = {
      'admin@vrp.com':       '/admin-dashboard',
      'procurement@vrp.com': '/procurement-dashboard',
      'supply@vrp.com':      '/supply-chain-dashboard',
      'finance@vrp.com':     '/finance-dashboard',
      'auditor@vrp.com':     '/auditor-dashboard',
      'vendor@vrp.com':      '/vendor-dashboard',
    };
    const route = roleRoutes[this.email] || '/admin-dashboard';
    localStorage.setItem('userEmail', this.email);
    localStorage.setItem('dashboardRoute', route);
    this.router.navigate([route]);
  }
}
