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
  successMessage = '';

  step = 1; // 1 = Details, 2 = OTP
  otp = '';

  constructor(private router: Router, private authService: AuthService) {}

  onRegister() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.fullName || !this.email || !this.password || !this.confirmPassword || !this.role) {
      this.errorMessage = 'Please fill in all required fields (Name, Email, Password, and Role).';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    const payload = {
      full_name: this.fullName,
      email: this.email,
      password: this.password,
      role_id: this.getRoleId(this.role),
      phone: this.mobile,
      company: this.companyName,
      employeeId: this.employeeId
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.successMessage = 'OTP sent to your email. Please verify.';
        this.step = 2;
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

  onVerifyOtp() {
    this.errorMessage = '';
    if (!this.otp || this.otp.length !== 6) {
      this.errorMessage = 'Please enter a valid 6-digit OTP.';
      return;
    }

    this.authService.verifyOtp({ email: this.email, otp: this.otp }).subscribe({
      next: () => {
        alert('Registration Successful! Redirecting to login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err?.error?.detail || 'Invalid or expired OTP.';
      }
    });
  }

  getRoleId(roleName: string): number {
    const map: any = {
      'Administrator': 1,
      'Procurement Manager': 2,
      'Supply Chain Manager': 3,
      'Vendor': 4,
      'Finance Officer': 5,
      'Auditor': 6
    };
    return map[roleName] || 4;
  }
}
