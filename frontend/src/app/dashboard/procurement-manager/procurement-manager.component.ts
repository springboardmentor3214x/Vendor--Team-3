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

  compareVendors: any[] = [
    { id: 'V1', name: 'ABC Pvt Ltd', selected: true, color: 'rgba(37, 99, 235, 0.4)', strokeColor: '#2563eb', metrics: [80, 90, 85, 75, 95] },
    { id: 'V2', name: 'XYZ Suppliers', selected: true, color: 'rgba(16, 185, 129, 0.4)', strokeColor: '#10b981', metrics: [95, 60, 70, 80, 75] },
    { id: 'V3', name: 'Tech India', selected: false, color: 'rgba(245, 158, 11, 0.4)', strokeColor: '#f59e0b', metrics: [60, 95, 90, 90, 85] }
  ];

  constructor(
    public sidebarService: SidebarService,
    private performanceService: PerformanceService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
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
            this.totalPOAmount = pos.reduce((sum, po) => sum + (po.total_amount || 0), 0);
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

    // 5. Populate Compare Vendors sandbox dynamically
    this.performanceService.getVendors().subscribe({
      next: (vendors) => {
        if (vendors && vendors.length > 0) {
          const colors = [
            { color: 'rgba(37, 99, 235, 0.4)', stroke: '#2563eb' },
            { color: 'rgba(16, 185, 129, 0.4)', stroke: '#10b981' },
            { color: 'rgba(245, 158, 11, 0.4)', stroke: '#f59e0b' }
          ];
          this.compareVendors = vendors.slice(0, 3).map((v, i) => {
            const colorSet = colors[i % 3];
            const metrics = i === 0 ? [85, 90, 80, 75, 90] : (i === 1 ? [90, 85, 95, 80, 85] : [75, 80, 70, 90, 80]);
            return {
              id: 'V' + v.vendor_id,
              name: v.company_name,
              selected: i < 2, // Select first two by default
              color: colorSet.color,
              strokeColor: colorSet.stroke,
              metrics: metrics
            };
          });
        }
      },
      error: (err) => console.error('Error fetching comparison vendors', err)
    });
  }

  getRadarPoints(vendor: any): string {
    const center = 100;
    const maxVal = 100;
    const maxRadius = 60;
    
    // Angles for 5 dimensions in radians: Price, Quality, Delivery Speed, Communication, Compliance
    const angles = [
      -Math.PI / 2,         // top
      -Math.PI / 10,        // top-right
      Math.PI * 3 / 10,     // bottom-right
      Math.PI * 7 / 10,     // bottom-left
      Math.PI * 11 / 10     // top-left
    ];

    return vendor.metrics.map((val: number, i: number) => {
      const r = (val / maxVal) * maxRadius;
      const x = center + r * Math.cos(angles[i]);
      const y = center + r * Math.sin(angles[i]);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }
}
