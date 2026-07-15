import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

interface PurchaseOrder {
  id: string;
  vendorName: string;
  amount: number;
  orderDate: string;
  deliveryDate: string;
  status: string;
}

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './purchase-orders.component.html',
  styleUrl: './purchase-orders.component.scss'
})
export class PurchaseOrdersComponent {
  orders: PurchaseOrder[] = [];
  vendors = ['ABC Pvt Ltd', 'XYZ Suppliers', 'Tech India', 'Delta Traders', 'Omega Industries'];

  // Form Fields
  newVendor = '';
  newAmount = 0;
  deliveryDays = 7;

  constructor(public sidebarService: SidebarService, private router: Router) {
    this.loadOrders();
  }

  loadOrders() {
    const cached = localStorage.getItem('vrp_purchase_orders');
    if (cached) {
      this.orders = JSON.parse(cached);
    } else {
      this.orders = [
        { id: 'PO101', vendorName: 'ABC Pvt Ltd', amount: 52000, orderDate: '2026-07-15', deliveryDate: '2026-07-22', status: 'Approved' },
        { id: 'PO102', vendorName: 'XYZ Suppliers', amount: 18000, orderDate: '2026-07-15', deliveryDate: '2026-07-25', status: 'Pending' },
        { id: 'PO103', vendorName: 'Tech India', amount: 31000, orderDate: '2026-07-14', deliveryDate: '2026-07-21', status: 'Approved' }
      ];
      this.saveOrders();
    }
  }

  saveOrders() {
    localStorage.setItem('vrp_purchase_orders', JSON.stringify(this.orders));
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  createOrder() {
    if (!this.newVendor || this.newAmount <= 0) {
      alert('Vendor and amount are required!');
      return;
    }
    const newId = 'PO' + String(this.orders.length + 101);
    const today = new Date();
    const delivery = new Date();
    delivery.setDate(today.getDate() + this.deliveryDays);

    const newPO: PurchaseOrder = {
      id: newId,
      vendorName: this.newVendor,
      amount: this.newAmount,
      orderDate: today.toISOString().split('T')[0],
      deliveryDate: delivery.toISOString().split('T')[0],
      status: 'Pending'
    };

    this.orders.push(newPO);
    this.saveOrders();

    // Clear
    this.newVendor = '';
    this.newAmount = 0;
    this.deliveryDays = 7;
    alert('Purchase order created successfully!');
  }

  updateStatus(order: PurchaseOrder, status: string) {
    order.status = status;
    this.saveOrders();
    alert(`Order ${order.id} updated to ${status}!`);
  }

  simulateUpload(order: PurchaseOrder) {
    alert(`Mock invoice uploaded successfully for order ${order.id}!`);
  }
}
