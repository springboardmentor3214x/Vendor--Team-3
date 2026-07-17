import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  fullName = '';
  employeeId = '';
  companyName = '';
  email = '';
  mobile = '';
  password = '';
  confirmPassword = '';
  role = '';
  roles = ['Administrator', 'Procurement Manager', 'Supply Chain Manager', 'Vendor', 'Finance Officer', 'Auditor'];
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService) {}

  onRegister() {
    this.errorMessage = '';

    if (!this.fullName || !this.email || !this.password || !this.confirmPassword || !this.role) {
      this.errorMessage = 'Please fill in all required fields (Name, Email, Password, and Role).';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    const payload = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      role: this.role,
      mobile: this.mobile,
      companyName: this.companyName,
      employeeId: this.employeeId
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        alert('Registration Successful! Redirecting to login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        if (err.status === 422) {
          this.errorMessage = 'Please verify the email format is correct.';
        } else if (err.error && err.error.detail) {
          this.errorMessage = err.error.detail;
        } else {
          this.errorMessage = 'Registration request failed. Please check if the backend is running.';
        }
      }
    });
  }
}
