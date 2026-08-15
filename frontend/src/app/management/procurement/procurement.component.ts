import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { VendorService } from '../../services/vendor.service';
import { ProcurementService } from '../../services/procurement.service';

@Component({
  selector: 'app-procurement',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './procurement.component.html',
  styleUrl: './procurement.component.scss'
})
export class ProcurementComponent implements OnInit {
  requests: any[] = [];
  vendors: any[] = [];
  loading = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  // Form Fields
  selectedVendorId: number | null = null;
  newTitle = '';
  newDepartment = 'IT';
  requestedBy = '';
  itemName = '';
  itemCategory = 'Raw Material';
  quantity = 100;
  unit = 'Pieces';
  newBudget = 0;
  deliveryDate = '';
  priority = 'Medium';
  justification = '';
  remarks = '';

  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private procurementService: ProcurementService,
    private vendorService: VendorService
  ) {}

  ngOnInit() {
    this.loadVendors();
    this.loadRequests();
    const email = localStorage.getItem('userEmail') || '';
    this.requestedBy = email.split('@')[0].toUpperCase();
  }

  loadVendors() {
    this.vendorService.getVendors().subscribe({
      next: (data) => { this.vendors = data; },
      error: () => { this.vendors = []; }
    });
  }

  loadRequests() {
    this.loading = true;
    this.procurementService.getProcurements().subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load procurement requests.';
      }
    });
  }

  get requestNumber(): string {
    return 'PR' + String(this.requests.length + 1).padStart(3, '0');
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  addRequest() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newTitle || !this.selectedVendorId) {
      this.errorMessage = 'Title and vendor are required!';
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const payload = {
      title: this.newTitle,
      description: this.remarks || '',
      department: this.newDepartment,
      item_name: this.itemName,
      category: this.itemCategory,
      quantity: this.quantity,
      unit: this.unit,
      budget: this.newBudget,
      priority: this.priority,
      justification: this.justification,
      vendor_id: this.selectedVendorId,
      status: 'Pending',
      created_date: today
    };

    this.submitting = true;
    this.procurementService.createProcurement(payload).subscribe({
      next: (created) => {
        this.requests.unshift(created);
        this.successMessage = `✅ Procurement Request #${created.procurement_id} created successfully!`;
        this.submitting = false;
        this.resetForm();
      },
      error: (err) => {
        this.errorMessage = err?.error?.detail || 'Failed to create procurement request.';
        this.submitting = false;
      }
    });
  }

  resetForm() {
    this.newTitle = '';
    this.selectedVendorId = null;
    this.itemName = '';
    this.justification = '';
    this.remarks = '';
    this.newBudget = 0;
    this.deliveryDate = '';
    this.quantity = 100;
    this.priority = 'Medium';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'status-pending',
      'Approved': 'status-approved',
      'Rejected': 'status-rejected',
      'Draft': 'status-draft',
      'Completed': 'status-completed'
    };
    return map[status] || 'status-pending';
  }
}
