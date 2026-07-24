import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../performance.service';

@Component({
  selector: 'app-vendor-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  templateUrl: './vendor-approval.component.html',
  styleUrl: './vendor-approval.component.scss'
})
export class VendorApprovalComponent implements OnInit {
  remarks = '';
  pendingVendors: any[] = [];
  selectedVendor: any = null;
  isLoading = true;

  constructor(
    public sidebarService: SidebarService, 
    private performanceService: PerformanceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPendingVendors();
  }

  loadPendingVendors() {
    this.isLoading = true;
    this.performanceService.getVendors().subscribe({
      next: (data) => {
        this.pendingVendors = data.filter(v => v.approval_status === 'Pending');
        if (this.pendingVendors.length > 0) {
          this.selectedVendor = this.pendingVendors[0];
        } else {
          this.selectedVendor = null;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading pending vendors', err);
        this.isLoading = false;
      }
    });
  }

  selectVendor(vendorId: any) {
    const numId = Number(vendorId);
    this.selectedVendor = this.pendingVendors.find(v => v.vendor_id === numId) || null;
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  approveVendor() {
    if (!this.selectedVendor) {
      alert('No vendor selected.');
      return;
    }

    this.isLoading = true;
    this.performanceService.approveVendor(this.selectedVendor.vendor_id).subscribe({
      next: (res) => {
        alert(`Vendor ${this.selectedVendor.company_name} Approved successfully!\nRemarks: ${this.remarks}`);
        this.remarks = '';
        this.loadPendingVendors();
      },
      error: (err) => {
        console.error('Error approving vendor', err);
        alert(err.error?.detail || 'Failed to approve vendor.');
        this.isLoading = false;
      }
    });
  }

  rejectVendor() {
    if (!this.selectedVendor) {
      alert('No vendor selected.');
      return;
    }

    this.isLoading = true;
    this.performanceService.rejectVendor(this.selectedVendor.vendor_id).subscribe({
      next: (res) => {
        alert(`Vendor ${this.selectedVendor.company_name} Rejected successfully!\nRemarks: ${this.remarks}`);
        this.remarks = '';
        this.loadPendingVendors();
      },
      error: (err) => {
        console.error('Error rejecting vendor', err);
        alert(err.error?.detail || 'Failed to reject vendor.');
        this.isLoading = false;
      }
    });
  }
}
