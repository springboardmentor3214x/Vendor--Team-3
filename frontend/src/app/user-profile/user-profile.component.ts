import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { SidebarService } from '../layout/sidebar.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  constructor(public sidebarService: SidebarService, private router: Router) {}

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }
  fullName = 'John Administrator';
  email = 'admin@vrp.com';
  mobile = '+91 9876543210';
  role = 'Administrator';
}
