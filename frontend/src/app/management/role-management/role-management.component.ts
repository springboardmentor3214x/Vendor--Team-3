import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss']
})
export class RoleManagementComponent {
  roles = ['Admin', 'Procurement', 'Supply Chain', 'Finance', 'Auditor', 'Vendor'];
  permissions = [
    'vendor.view', 'vendor.create', 'vendor.edit', 'vendor.delete',
    'rfq.view', 'rfq.manage',
    'order.view', 'order.manage',
    'invoice.view', 'invoice.process',
    'user.view', 'user.manage',
    'role.view', 'role.manage'
  ];

  dataScopes = ['All Data', 'Department Data', 'Own Data', 'Custom'];
  selectedDataScope: { [role: string]: string } = {
    'Admin': 'All Data',
    'Procurement': 'Department Data',
    'Supply Chain': 'Department Data',
    'Finance': 'Department Data',
    'Auditor': 'All Data',
    'Vendor': 'Own Data'
  };

  // Matrix storing role-permission mappings.
  // mock data
  permissionMatrix: { [permission: string]: { [role: string]: boolean } } = {};

  constructor() {
    this.initializeMatrix();
  }

  initializeMatrix() {
    this.permissions.forEach(permission => {
      this.permissionMatrix[permission] = {};
      this.roles.forEach(role => {
        // Mock default permissions based on role
        if (role === 'Admin') {
          this.permissionMatrix[permission][role] = true;
        } else {
          this.permissionMatrix[permission][role] = false;
        }
      });
    });
    
    // Some mock data for procurement
    this.permissionMatrix['vendor.view']['Procurement'] = true;
    this.permissionMatrix['rfq.manage']['Procurement'] = true;
  }

  togglePermission(permission: string, role: string) {
    this.permissionMatrix[permission][role] = !this.permissionMatrix[permission][role];
  }

  savePermissions() {
    alert('Permissions and Data Scopes saved successfully!');
  }
}
