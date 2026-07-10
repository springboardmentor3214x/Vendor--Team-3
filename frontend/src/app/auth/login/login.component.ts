import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

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
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService) {}

  onLogin() {
    this.errorMessage = '';
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
        this.router.navigate([route]);
      },
      error: (err) => {
        console.error('Login error:', err);
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Invalid email or password.';
        } else if (err.status === 422) {
          this.errorMessage = 'Please enter a valid email format.';
        } else {
          this.errorMessage = 'Could not connect to authentication server. Is the backend running?';
        }
      }
    });
  }
}
