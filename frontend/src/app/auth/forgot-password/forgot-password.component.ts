import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  email = '';
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService) {}

  onSend() {
    this.errorMessage = '';
    if (!this.email) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        alert('Reset link sent! Mock check successful, proceeding to Reset Password page.');
        this.router.navigate(['/reset-password']);
      },
      error: (err) => {
        console.error('Forgot password error:', err);
        this.errorMessage = 'Failed to submit reset request.';
      }
    });
  }
}
