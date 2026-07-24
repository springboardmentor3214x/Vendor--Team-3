import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './purchase-orders.component.html',
  styleUrl: './purchase-orders.component.scss'
})
export class PurchaseOrdersComponent implements OnInit {
  orders: any[] = [];
  procurements: any[] = [];
  vendors: any[] = [];
  loading = false;
  submitting = false;
  updatingId: number | null = null;
  errorMessage = '';
  successMessage = '';

  // Form Fields
  selectedProcurementId: number | null = null;
  selectedVendorId: number | null = null;
  newAmount = 0;
  deliveryDays = 7;

  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.loadVendors();
    this.loadProcurements();
    this.loadOrders();
  }

  loadVendors() {
    this.api.getVendors().subscribe({
      next: (data) => { this.vendors = data; },
      error: () => { this.vendors = []; }
    });
  }

  loadProcurements() {
    this.api.getProcurements().subscribe({
      next: (data) => { this.procurements = data; },
      error: () => { this.procurements = []; }
    });
  }

  loadOrders() {
    this.loading = true;
    this.api.getPurchaseOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load purchase orders.';
      }
    });
  }

  getVendorName(vendorId: number): string {
    const v = this.vendors.find(v => v.vendor_id === vendorId);
    return v ? v.company_name : `Vendor #${vendorId}`;
  }

  getProcurementTitle(procId: number): string {
    const p = this.procurements.find(p => p.procurement_id === procId);
    return p ? p.title : `PR #${procId}`;
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  createOrder() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedVendorId || !this.selectedProcurementId || this.newAmount <= 0) {
      this.errorMessage = 'Vendor, Procurement Request, and Amount are required!';
      return;
    }

    const today = new Date();
    const delivery = new Date();
    delivery.setDate(today.getDate() + this.deliveryDays);

    const orderNum = 'PO-' + Date.now();

    const payload = {
      procurement_id: this.selectedProcurementId,
      vendor_id: this.selectedVendorId,
      order_number: orderNum,
      order_date: today.toISOString().split('T')[0],
      delivery_date: delivery.toISOString().split('T')[0],
      total_amount: this.newAmount,
      status: 'Pending'
    };

    this.submitting = true;
    this.api.createPurchaseOrder(payload).subscribe({
      next: (created) => {
        this.orders.unshift(created);
        this.successMessage = `✅ Purchase Order ${created.order_number} issued! Vendor has been notified automatically.`;
        this.submitting = false;
        this.selectedVendorId = null;
        this.selectedProcurementId = null;
        this.newAmount = 0;
        this.deliveryDays = 7;
      },
      error: (err) => {
        this.errorMessage = err?.error?.detail || 'Failed to create purchase order.';
        this.submitting = false;
      }
    });
  }

  updateStatus(order: any, status: string) {
    this.errorMessage = '';
    this.successMessage = '';
    this.updatingId = order.order_id;

    this.api.updatePurchaseOrder(order.order_id, { status }).subscribe({
      next: (updated) => {
        const idx = this.orders.findIndex(o => o.order_id === updated.order_id);
        if (idx !== -1) this.orders[idx] = updated;
        this.successMessage = `✅ Order ${order.order_number} updated to "${status}". Vendor notified.`;
        this.updatingId = null;
      },
      error: (err) => {
        this.errorMessage = err?.error?.detail || 'Failed to update order status.';
        this.updatingId = null;
      }
    });
  }

  getStatusStyle(status: string): { [key: string]: string } {
    const styles: Record<string, { [key: string]: string }> = {
      'Pending':   { background: '#fef9c3', color: '#854d0e' },
      'Approved':  { background: '#dcfce7', color: '#166534' },
      'Delivered': { background: '#e0e7ff', color: '#3730a3' },
      'Completed': { background: '#dbeafe', color: '#1e40af' },
      'Cancelled': { background: '#fee2e2', color: '#991b1b' }
    };
    return styles[status] || { background: '#f1f5f9', color: '#334155' };
  }
}
