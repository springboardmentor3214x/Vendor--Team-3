import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../../management/performance.service';

@Component({
  selector: 'app-finance-officer',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, FormsModule],
  templateUrl: './finance-officer.component.html',
  styleUrl: './finance-officer.component.scss'
})
export class FinanceOfficerComponent implements OnInit {
  totalBills = 0;
  paidBills = 0;
  pendingBills = 0;
  monthlyRevenue = 0;

  paidCount = 0;
  pendingCount = 0;
  overdueCount = 0;

  completedPayments = 0;
  pendingPayments = 0;
  failedPayments = 0;

  invoicesList: any[] = [];
  upcomingPaymentVendor = 'None';
  upcomingPaymentDate = '—';
  upcomingPaymentAmount = 0;

  neftCount = 0;
  upiCount = 0;
  rtgsCount = 0;
  searchTerm = '';

  constructor(
    public sidebarService: SidebarService,
    private performanceService: PerformanceService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      this.invoicesList = this.invoicesList.filter(inv =>
        inv.vendor.toLowerCase().includes(term) || inv.id.toLowerCase().includes(term)
      );
    } else {
      this.loadDashboardData();
    }
  }

  loadDashboardData() {
    this.performanceService.getPurchaseOrders().subscribe({
      next: (pos) => {
        this.totalBills = pos.length;
        this.monthlyRevenue = pos.reduce((sum, po) => sum + (po.total_amount || 0), 0);

        this.performanceService.getVendors().subscribe({
          next: (vendors) => {
            const vendorMap = new Map(vendors.map(v => [v.vendor_id, v.company_name]));

            this.paidBills = 0;
            this.pendingBills = 0;
            this.overdueCount = 0;
            this.neftCount = 0;
            this.upiCount = 0;
            this.rtgsCount = 0;

            const mappedInvoices = pos.map((po, index) => {
              const vendorName = vendorMap.get(po.vendor_id) || 'Unknown Vendor';
              const isPaid = po.status === 'Completed';
              const pMethod = index % 3 === 0 ? 'NEFT' : (index % 3 === 1 ? 'UPI' : 'RTGS');
              
              if (isPaid) {
                this.paidBills++;
              } else {
                this.pendingBills++;
                // If past delivery date, mark overdue
                if (po.delivery_date && new Date(po.delivery_date) < new Date()) {
                  this.overdueCount++;
                }
              }

              if (pMethod === 'NEFT') this.neftCount++;
              else if (pMethod === 'UPI') this.upiCount++;
              else if (pMethod === 'RTGS') this.rtgsCount++;

              return {
                id: 'INV' + String(100 + po.order_id),
                vendor: vendorName,
                amount: po.total_amount,
                payment: pMethod,
                dueDate: po.delivery_date || po.order_date,
                action: isPaid ? 'View' : 'Pay'
              };
            });

            this.invoicesList = mappedInvoices.slice().sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);

            this.paidCount = this.paidBills;
            this.pendingCount = this.pendingBills;

            this.completedPayments = this.paidBills;
            this.pendingPayments = this.pendingBills;
            this.failedPayments = Math.max(0, Math.floor(pos.length * 0.05)); // 5% failed mock rate

            // Upcoming Payment
            const upcomingPO = pos.find(po => po.status !== 'Completed');
            if (upcomingPO) {
              this.upcomingPaymentVendor = vendorMap.get(upcomingPO.vendor_id) || 'Vendor';
              this.upcomingPaymentDate = upcomingPO.delivery_date ? new Date(upcomingPO.delivery_date).toLocaleDateString() : 'Scheduled';
              this.upcomingPaymentAmount = upcomingPO.total_amount;
            } else if (pos.length > 0) {
              this.upcomingPaymentVendor = vendorMap.get(pos[0].vendor_id) || 'Vendor';
              this.upcomingPaymentDate = 'Paid';
              this.upcomingPaymentAmount = pos[0].total_amount;
            }
          }
        });
      },
      error: (err) => console.error('Error loading finance stats', err)
    });
  }
}
