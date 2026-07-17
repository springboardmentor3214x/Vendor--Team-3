import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  users: UserItem[] = [];
  roles = ['Administrator', 'Procurement Manager', 'Supply Chain Manager', 'Vendor', 'Finance Officer', 'Auditor'];

  // Form Fields
  newUserName = '';
  newUserEmail = '';
  newUserPhone = '';
  newUserRole = 'Vendor';

  constructor(public sidebarService: SidebarService, private router: Router) {
    this.loadUsers();
  }

  loadUsers() {
    const cached = localStorage.getItem('vrp_users');
    if (cached) {
      this.users = JSON.parse(cached);
    } else {
      this.users = [
        { id: 'U001', name: 'Alex Harrison', email: 'a@gmail.com', phone: '+91 9876543210', role: 'Administrator', status: 'Active' },
        { id: 'U002', name: 'John Doe', email: 'f@gmail.com', phone: '+91 9988776655', role: 'Finance Officer', status: 'Active' },
        { id: 'U003', name: 'Maria Smith', email: 'p@gmail.com', phone: '+91 9898989898', role: 'Procurement Manager', status: 'Active' },
        { id: 'U004', name: 'Bruce Wayne', email: 's@gmail.com', phone: '+91 9797979797', role: 'Supply Chain Manager', status: 'Active' },
        { id: 'U005', name: 'Clark Kent', email: 'au@gmail.com', phone: '+91 9696969696', role: 'Auditor', status: 'Active' },
        { id: 'U006', name: 'Peter Parker', email: 'v@gmail.com', phone: '+91 9595959595', role: 'Vendor', status: 'Active' }
      ];
      this.saveUsers();
    }
  }

  saveUsers() {
    localStorage.setItem('vrp_users', JSON.stringify(this.users));
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  addUser() {
    if (!this.newUserName || !this.newUserEmail) {
      alert('Name and Email are required!');
      return;
    }
    const newId = 'U' + String(this.users.length + 1).padStart(3, '0');
    const newUser: UserItem = {
      id: newId,
      name: this.newUserName,
      email: this.newUserEmail,
      phone: this.newUserPhone || '+91 9000000000',
      role: this.newUserRole,
      status: 'Active'
    };
    this.users.push(newUser);
    this.saveUsers();
    
    // Clear fields
    this.newUserName = '';
    this.newUserEmail = '';
    this.newUserPhone = '';
    this.newUserRole = 'Vendor';
    alert('User added successfully!');
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.users = this.users.filter(u => u.id !== userId);
      this.saveUsers();
    }
  }

  toggleStatus(user: UserItem) {
    user.status = user.status === 'Active' ? 'Inactive' : 'Active';
    this.saveUsers();
  }
}
