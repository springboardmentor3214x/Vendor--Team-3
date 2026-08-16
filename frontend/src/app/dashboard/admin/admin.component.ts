import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../../management/performance.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import * as Highcharts from 'highcharts';
import HC_3D from 'highcharts/highcharts-3d';
import { HighchartsChartModule } from 'highcharts-angular';

try {
  if (typeof HC_3D === 'function') {
    (HC_3D as any)(Highcharts);
  } else if (HC_3D && typeof (HC_3D as any).default === 'function') {
    (HC_3D as any).default(Highcharts);
  }
} catch (e) {
  console.error(e);
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, FormsModule, BaseChartDirective, HighchartsChartModule],
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
  searchTerm = '';
  activeUsersCount = 0;

  // Chart.js Line Chart Data
  public costTrendData: any = {
    labels: [],
    datasets: [{ data: [] }]
  };
  public costTrendOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: { tension: 0.4 } // Smooth curve
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // Highcharts 3D Pie Data
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      options3d: {
        enabled: true,
        alpha: 45,
        beta: 0
      },
      backgroundColor: 'transparent'
    },
    title: {
      text: ''
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        depth: 35,
        dataLabels: {
          enabled: true,
          format: '{point.name}'
        }
      }
    },
    series: [{
      type: 'pie',
      name: 'Vendors',
      data: []
    }],
    credits: {
      enabled: false
    }
  };
  updateFlag = false;

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
      this.recentActivities = this.recentActivities.filter(a =>
        a.action.toLowerCase().includes(term) || a.user.toLowerCase().includes(term)
      );
    } else {
      this.loadDashboardData();
    }
  }

  loadDashboardData() {
    // 1. Fetch Admin Overview
    this.performanceService.getAdminOverview().subscribe({
      next: (overview) => {
        this.usersCount = overview.total_users || 0;
        this.activeUsersCount = overview.active_users || 0;
        this.totalVendors = overview.total_vendors || 0;
        
        if (overview.vendor_distribution) {
          const chartData = overview.vendor_distribution.map((d: any) => {
             // Map backend status strings to colors
             let color = '#3b82f6';
             if (d.status === 'Approved') color = '#10b981';
             if (d.status === 'Pending') color = '#f59e0b';
             if (d.status === 'Rejected') color = '#ef4444';
             
             return {
                 name: d.status,
                 y: d.count,
                 color: color
             };
          });
          
          this.chartOptions.series = [{
              type: 'pie',
              name: 'Vendors',
              data: chartData
          }];
          this.updateFlag = true;
        }
      },
      error: (err) => console.error('Error fetching admin overview', err)
    });

    // 2. Fetch Cost Analysis for Trend
    this.performanceService.getCostAnalysis().subscribe({
      next: (cost) => {
        if (cost.monthly_expenses) {
          const labels = cost.monthly_expenses.map((m: any) => m.month);
          const data = cost.monthly_expenses.map((m: any) => m.total);
          this.costTrendData = {
            labels: labels,
            datasets: [{
              label: 'Procurement Spend',
              data: data,
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.2)', // Area fill
              fill: true,
            }]
          };
        }
      },
      error: (err) => console.error('Error fetching cost analysis', err)
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
          const medals = ['dY', 'dY^', 'dY%'];
          const stars = r.score >= 90 ? '-?-?-?-?-?' : (r.score >= 80 ? '-?-?-?-?~+' : '-?-?-?~+~+');
          return {
            medal: medals[idx] || 'dYZ-,?',
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
              const medals = ['dY', 'dY^', 'dY%'];
              return {
                medal: medals[idx] || 'dYZ-,?',
                name: v.company_name,
                stars: '-?-?-?-?-?'
              };
            });
          }
        });
      }
    });
  }
}
