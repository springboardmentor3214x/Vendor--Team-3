import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

interface Invoice {
  id: string;
  poId: string;
  vendorName: string;
  amount: number;
  dueDate: string;
  paymentMode: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss'
})
export class InvoicesComponent {
  invoices: Invoice[] = [];
  vendors = ['ABC Pvt Ltd', 'XYZ Suppliers', 'Tech India', 'Delta Traders', 'Omega Industries'];

  // Form Fields
  selectedPO = 'PO101';
  invoiceAmount = 0;
  paymentMode = 'NEFT';

  constructor(public sidebarService: SidebarService, private router: Router) {
    this.loadInvoices();
  }

  loadInvoices() {
    const cached = localStorage.getItem('vrp_invoices');
    if (cached) {
      this.invoices = JSON.parse(cached);
    } else {
      this.invoices = [
        { id: 'INV101', poId: 'PO101', vendorName: 'ABC Pvt Ltd', amount: 52000, dueDate: '2026-07-20', paymentMode: 'UPI', status: 'Pending' },
        { id: 'INV102', poId: 'PO102', vendorName: 'XYZ Suppliers', amount: 18000, dueDate: '2026-07-22', paymentMode: 'Bank', status: 'Pending' },
        { id: 'INV103', poId: 'PO103', vendorName: 'Tech India', amount: 31000, dueDate: '2026-07-05', paymentMode: 'NEFT', status: 'Paid' }
      ];
      this.saveInvoices();
    }
  }

  saveInvoices() {
    localStorage.setItem('vrp_invoices', JSON.stringify(this.invoices));
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  payInvoice(invoice: Invoice) {
    alert(`Initiating simulated payment gateway for ₹${invoice.amount.toLocaleString()} to ${invoice.vendorName}...`);
    invoice.status = 'Paid';
    this.saveInvoices();
    alert('Payment successful!');
  }

  createInvoice() {
    if (this.invoiceAmount <= 0) {
      alert('Invoice amount must be greater than zero!');
      return;
    }
    const newId = 'INV' + String(this.invoices.length + 101);
    const newInv: Invoice = {
      id: newId,
      poId: this.selectedPO,
      vendorName: 'ABC Pvt Ltd',
      amount: this.invoiceAmount,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMode: this.paymentMode,
      status: 'Pending'
    };
    this.invoices.push(newInv);
    this.saveInvoices();
    this.invoiceAmount = 0;
    alert('Invoice recorded successfully!');
  }
}
