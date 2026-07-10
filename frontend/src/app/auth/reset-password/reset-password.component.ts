import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService) {}

  onReset() {
    this.errorMessage = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please enter both password fields.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.authService.resetPassword('mock-token', this.newPassword).subscribe({
      next: (res) => {
        alert('Password has been reset successfully! You can now log in.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Reset password error:', err);
        this.errorMessage = 'Failed to reset password. Please try again.';
      }
    });
  }
}
