import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../../management/performance.service';

@Component({
  selector: 'app-procurement-manager',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, FormsModule],
  templateUrl: './procurement-manager.component.html',
  styleUrl: './procurement-manager.component.scss'
})
export class ProcurementManagerComponent implements OnInit {
  totalVendors = 0;
  purchaseOrdersCount = 0;
  activeProcurementCount = 0;
  expiringContractsCount = 0;

  recentPOs: any[] = [];
  upcomingDeliveries: any[] = [];
  
  totalPOAmount = 0;
  budgetSpentPercent = 0;
  budgetRemaining = 1500000;
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
      this.recentPOs = this.recentPOs.filter(po =>
        (po.vendor_name && po.vendor_name.toLowerCase().includes(term)) ||
        String(po.order_id).includes(term)
      );
    } else {
      this.loadDashboardData();
    }
  }

  loadDashboardData() {
    // 1. Fetch Vendor Summary Stats
    this.performanceService.getVendorSummary().subscribe({
      next: (summary) => {
        this.totalVendors = summary.total_vendors || 0;
      },
      error: (err) => console.error('Error fetching vendor summary', err)
    });

    // 2. Fetch Purchase Orders
    this.performanceService.getPurchaseOrders().subscribe({
      next: (pos) => {
        this.purchaseOrdersCount = pos.length;
        
        // Map vendor names and calculate amount sum
        this.performanceService.getVendors().subscribe({
          next: (vendors) => {
            const vendorMap = new Map(vendors.map(v => [v.vendor_id, v.company_name]));
            
            // Map POs
            const mappedPOs = pos.map(po => ({
              ...po,
              vendor_name: vendorMap.get(po.vendor_id) || 'Unknown Vendor'
            }));

            // Sort by order_id desc for recent POs
            this.recentPOs = mappedPOs.slice().sort((a, b) => b.order_id - a.order_id).slice(0, 5);

            // Upcoming deliveries: POs with status 'Pending' or 'In Transit'
            this.upcomingDeliveries = mappedPOs
              .filter(po => po.status === 'Pending' || po.status === 'In Transit' || po.status === 'Approved')
              .map(po => ({
                vendor: po.vendor_name,
                date: po.delivery_date
              }))
              .slice(0, 4);

            // Calculate budget
            this.totalPOAmount = pos.reduce((sum, po) => sum + (Number(po.total_amount) || 0), 0);
            this.budgetSpentPercent = Math.min(100, Math.round((this.totalPOAmount / 1500000) * 100));
            this.budgetRemaining = Math.max(0, 1500000 - this.totalPOAmount);
          }
        });
      },
      error: (err) => console.error('Error fetching purchase orders', err)
    });

    // 3. Fetch Procurements for active count
    this.performanceService.getProcurements().subscribe({
      next: (procs) => {
        // Active procurements are those with status NOT 'Completed' or 'Rejected'
        this.activeProcurementCount = procs.filter(p => p.status !== 'Completed' && p.status !== 'Rejected').length;
      },
      error: (err) => console.error('Error fetching procurements', err)
    });

    // 4. Fetch Contracts
    this.performanceService.getContracts().subscribe({
      next: (contracts) => {
        // Expiring contracts count (e.g. status is Active or Pending)
        this.expiringContractsCount = contracts.filter(c => c.status === 'Active' || c.status === 'Pending').length;
      },
      error: (err) => console.error('Error fetching contracts', err)
    });


  }


}
