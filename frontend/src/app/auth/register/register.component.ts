import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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

  constructor(private router: Router) {}

  onRegister() {
    this.router.navigate(['/login']);
  }
}
