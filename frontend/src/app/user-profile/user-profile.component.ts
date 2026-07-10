import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { SidebarService } from '../layout/sidebar.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  fullName = '';
  email = '';
  mobile = '';
  role = '';
  employeeId = '';
  companyName = '';

  constructor(
    public sidebarService: SidebarService, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.email = localStorage.getItem('userEmail') || 'admin@vrp.com';
    this.authService.getProfile(this.email).subscribe({
      next: (profile) => {
        this.fullName = profile.fullName;
        this.mobile = profile.mobile;
        this.role = profile.role;
        this.employeeId = profile.employeeId;
        this.companyName = profile.companyName;
      }
    });
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  onSave() {
    const profile = {
      fullName: this.fullName,
      email: this.email,
      mobile: this.mobile,
      role: this.role,
      employeeId: this.employeeId,
      companyName: this.companyName
    };
    this.authService.updateProfile(this.email, profile).subscribe({
      next: (res) => {
        alert('Profile details updated successfully!');
      }
    });
  }
}
