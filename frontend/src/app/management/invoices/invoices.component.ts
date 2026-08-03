import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

export interface InvoiceMatch {
  id: string;
  vendorName: string;
  poNumber: string;
  poQuantity: number;
  poAmount: number;
  grnNumber: string;
  grnQuantity: number;
  grnAmount: number;
  invoiceNumber: string;
  invoiceQuantity: number;
  invoiceAmount: number;
  dueDate: string;
  paymentMode: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Flagged' | 'Paid';
}

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss'
})
export class InvoicesComponent {
  invoices: InvoiceMatch[] = [];
  vendors = ['ABC Pvt Ltd', 'TechCorp Supplies', 'Global Logistics', 'Office Essentials'];

  selectedInvoice: InvoiceMatch | null = null;

  constructor(public sidebarService: SidebarService, private router: Router) {
    this.loadInvoices();
  }

  loadInvoices() {
    const cached = localStorage.getItem('vrp_finance_invoices');
    if (cached) {
      this.invoices = JSON.parse(cached);
    } else {
      this.invoices = [
        {
          id: 'INV-1001', vendorName: 'TechCorp Supplies', dueDate: '2026-07-20', paymentMode: 'NEFT',
          poNumber: 'PO-5501', poQuantity: 100, poAmount: 5000,
          grnNumber: 'GRN-8801', grnQuantity: 100, grnAmount: 5000,
          invoiceNumber: 'INV-1001', invoiceQuantity: 100, invoiceAmount: 5000,
          status: 'Pending'
        },
        {
          id: 'INV-1002', vendorName: 'Global Logistics', dueDate: '2026-07-22', paymentMode: 'Bank Transfer',
          poNumber: 'PO-5502', poQuantity: 200, poAmount: 8000,
          grnNumber: 'GRN-8802', grnQuantity: 190, grnAmount: 7600,
          invoiceNumber: 'INV-1002', invoiceQuantity: 200, invoiceAmount: 8000,
          status: 'Pending'
        },
        {
          id: 'INV-1003', vendorName: 'Office Essentials', dueDate: '2026-07-25', paymentMode: 'UPI',
          poNumber: 'PO-5503', poQuantity: 50, poAmount: 500,
          grnNumber: 'GRN-8803', grnQuantity: 50, grnAmount: 500,
          invoiceNumber: 'INV-1003', invoiceQuantity: 50, invoiceAmount: 550, // Mismatch
          status: 'Pending'
        }
      ];
      this.saveInvoices();
    }
  }

  saveInvoices() {
    localStorage.setItem('vrp_finance_invoices', JSON.stringify(this.invoices));
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  viewDetails(invoice: InvoiceMatch) {
    this.selectedInvoice = invoice;
  }

  closeDetails() {
    this.selectedInvoice = null;
  }

  hasQuantityMismatch(invoice: InvoiceMatch): boolean {
    return invoice.poQuantity !== invoice.grnQuantity || invoice.grnQuantity !== invoice.invoiceQuantity;
  }

  hasAmountMismatch(invoice: InvoiceMatch): boolean {
    return invoice.poAmount !== invoice.grnAmount || invoice.grnAmount !== invoice.invoiceAmount;
  }

  approveInvoice() {
    if (this.selectedInvoice) {
      this.selectedInvoice.status = 'Approved';
      this.saveInvoices();
      this.closeDetails();
    }
  }

  rejectInvoice() {
    if (this.selectedInvoice) {
      this.selectedInvoice.status = 'Rejected';
      this.saveInvoices();
      this.closeDetails();
    }
  }

  flagInvoice() {
    if (this.selectedInvoice) {
      this.selectedInvoice.status = 'Flagged';
      this.saveInvoices();
      this.closeDetails();
    }
  }
  
  payInvoice(invoice: InvoiceMatch) {
    alert(`Initiating simulated payment gateway for ₹${invoice.invoiceAmount.toLocaleString()} to ${invoice.vendorName}...`);
    invoice.status = 'Paid';
    this.saveInvoices();
    alert('Payment successful!');
  }
}
