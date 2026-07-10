import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

@Component({
  selector: 'app-vendor-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  templateUrl: './vendor-approval.component.html',
  styleUrl: './vendor-approval.component.scss'
})
export class VendorApprovalComponent {
  remarks = '';
  
  vendor = {
    companyName: 'ABC Pvt Ltd',
    vendorId: 'VEN001',
    category: 'Raw Material Supplier',
    email: 'abcvendor@gmail.com',
    phone: '+91 9876543210',
    gstNumber: '33ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    approvalStatus: 'Pending Approval',
    contactPerson: 'Raj Kumar',
    status: 'Pending'
  };

  constructor(public sidebarService: SidebarService, private router: Router) {}

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  approveVendor() {
    alert(`Vendor ${this.vendor.companyName} Approved successfully!\nRemarks: ${this.remarks}`);
    this.goBack();
  }

  rejectVendor() {
    alert(`Vendor ${this.vendor.companyName} Rejected!\nRemarks: ${this.remarks}`);
    this.goBack();
  }
}
