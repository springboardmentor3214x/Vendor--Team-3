import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../../management/performance.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  usersCount = 6;
  totalVendors = 0;
  ordersCount = 0;
  totalRevenue = 0;

  topVendors: any[] = [];
  recentActivities: any[] = [];

  constructor(
    public sidebarService: SidebarService,
    private performanceService: PerformanceService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // 1. Fetch Users Count from LocalStorage
    const cachedUsers = localStorage.getItem('vrp_users');
    if (cachedUsers) {
      try {
        this.usersCount = JSON.parse(cachedUsers).length;
      } catch (e) {
        this.usersCount = 6;
      }
    }

    // 2. Fetch Vendor Summary
    this.performanceService.getVendorSummary().subscribe({
      next: (summary) => {
        this.totalVendors = summary.total_vendors || 0;
      },
      error: (err) => console.error('Error fetching admin vendor summary', err)
    });

    // 3. Fetch Purchase Orders
    this.performanceService.getPurchaseOrders().subscribe({
      next: (pos) => {
        this.ordersCount = pos.length;
        this.totalRevenue = pos.reduce((sum, po) => sum + (po.total_amount || 0), 0);

        // Fetch vendor names to map POs to recent activities
        this.performanceService.getVendors().subscribe({
          next: (vendors) => {
            const vendorMap = new Map(vendors.map(v => [v.vendor_id, v.company_name]));
            this.recentActivities = pos.slice().sort((a, b) => b.order_id - a.order_id).slice(0, 5).map(po => ({
              user: po.department || 'Procurement',
              action: `Purchase Order PO${po.order_id} - ${vendorMap.get(po.vendor_id) || 'Vendor'}`,
              date: po.order_date,
              status: po.status
            }));
          }
        });
      },
      error: (err) => console.error('Error fetching admin purchase orders', err)
    });

    // 4. Fetch Vendor Rankings
    this.performanceService.getVendorRankings().subscribe({
      next: (rankings) => {
        // Map top 3 ranked vendors
        this.topVendors = rankings.slice(0, 3).map((r: any, idx: number) => {
          const medals = ['🥇', '🥈', '🥉'];
          const stars = r.score >= 90 ? '⭐⭐⭐⭐⭐' : (r.score >= 80 ? '⭐⭐⭐⭐☆' : '⭐⭐⭐☆☆');
          return {
            medal: medals[idx] || '🎖️',
            name: r.vendor_name,
            stars: stars
          };
        });
      },
      error: (err) => {
        console.error('Error fetching rankings, fallback to vendors list', err);
        // Fallback to top vendors from list if rankings endpoint errors or is empty
        this.performanceService.getVendors().subscribe({
          next: (vendors) => {
            this.topVendors = vendors.slice(0, 3).map((v, idx) => {
              const medals = ['🥇', '🥈', '🥉'];
              return {
                medal: medals[idx] || '🎖️',
                name: v.company_name,
                stars: '⭐⭐⭐⭐⭐'
              };
            });
          }
        });
      }
    });
  }
}
