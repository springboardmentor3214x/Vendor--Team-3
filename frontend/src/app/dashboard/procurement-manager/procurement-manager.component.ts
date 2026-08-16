import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../../management/performance.service';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import HC_3D from 'highcharts/highcharts-3d';

try {
  if (typeof HC_3D === 'function') {
    (HC_3D as any)(Highcharts);
  } else if (HC_3D && typeof (HC_3D as any).default === 'function') {
    (HC_3D as any).default(Highcharts);
  } else {
    console.warn('Could not initialize Highcharts 3D module:', HC_3D);
  }
} catch (e) {
  console.error('Error initializing Highcharts 3D:', e);
}

@Component({
  selector: 'app-procurement-manager',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, FormsModule, HighchartsChartModule],
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

  Highcharts: typeof Highcharts = Highcharts;

  public deptChartOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      options3d: {
        enabled: true,
        alpha: 45,
        beta: 0
      },
      backgroundColor: 'transparent'
    },
    title: { text: undefined },
    tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        depth: 45,
        innerSize: '40%', // Creates the Donut effect
        dataLabels: { 
          enabled: true, 
          format: '{point.name}' 
        },
        colors: [
            { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, '#38bdf8'], [1, '#0284c7']] },
            { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, '#c084fc'], [1, '#7e22ce']] },
            { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, '#34d399'], [1, '#059669']] },
            { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, '#fbbf24'], [1, '#d97706']] },
            { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, '#f87171'], [1, '#dc2626']] }
        ]
      }
    },
    series: [{
      type: 'pie',
      name: 'Requests',
      data: []
    }],
    credits: { enabled: false }
  };
  public deptChartUpdateFlag = false;

  public costChartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      options3d: {
        enabled: true,
        alpha: 10,
        beta: 15,
        depth: 50,
        viewDistance: 25
      },
      backgroundColor: 'transparent'
    },
    title: { text: undefined },
    xAxis: { categories: [] },
    yAxis: { title: { text: 'Monthly Spend (₹)' } },
    plotOptions: {
      column: {
        depth: 25,
        colorByPoint: true
      }
    },
    series: [{
      type: 'column',
      name: 'Spend',
      data: []
    }],
    credits: { enabled: false }
  };
  public costChartUpdateFlag = false;

  public performanceChartOptions: Highcharts.Options = {
    chart: {
      type: 'line',
      backgroundColor: 'transparent'
    },
    title: { text: undefined },
    xAxis: { categories: ['Month 1', 'Month 2', 'Month 3'] },
    yAxis: { title: { text: 'Score' }, min: 0, max: 100 },
    plotOptions: {
      line: {
        dataLabels: { enabled: true },
        enableMouseTracking: true
      }
    },
    series: [],
    credits: { enabled: false }
  };
  public performanceChartUpdateFlag = false;

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
    this.performanceService.getVendorSummary().subscribe({
      next: (summary) => this.totalVendors = summary.total_vendors || 0
    });

    this.performanceService.getProcurementStats().subscribe({
      next: (stats) => {
        this.activeProcurementCount = stats.total_requests;
        const pieData = stats.by_department.map((d: any) => ({
          name: d.department,
          y: d.count
        }));
        
        this.deptChartOptions.series = [{
          type: 'pie',
          name: 'Requests',
          data: pieData
        }];
        this.deptChartUpdateFlag = true;
      }
    });

    this.performanceService.getActivePurchaseOrders().subscribe({
      next: (pos) => {
        this.purchaseOrdersCount = pos.length;
        this.recentPOs = pos.slice(0, 5);
        this.totalPOAmount = pos.reduce((sum: number, po: any) => sum + (po.total_amount || 0), 0);
        this.budgetSpentPercent = Math.min(100, Math.round((this.totalPOAmount / 1500000) * 100));
        this.budgetRemaining = Math.max(0, 1500000 - this.totalPOAmount);
      }
    });

    this.performanceService.getDeliveryStatus().subscribe({
      next: (status) => {
        this.upcomingDeliveries = [
          { vendor: 'Delayed', date: 'Immediate Action Needed', status: status.delayed_deliveries + ' POs' },
          { vendor: 'Pending Shipment', date: 'Upcoming', status: status.pending_shipments + ' POs' }
        ];
      }
    });

    this.performanceService.getContracts().subscribe({
      next: (contracts) => {
        this.expiringContractsCount = contracts.filter((c: any) => c.status === 'Active' || c.status === 'Pending').length;
      }
    });

    this.performanceService.getCostAnalysis().subscribe({
      next: (cost) => {
        if (cost.monthly_expenses) {
          const categories = cost.monthly_expenses.map((m: any) => m.month);
          const data = cost.monthly_expenses.map((m: any) => m.total);
          
          this.costChartOptions.xAxis = { categories: categories };
          this.costChartOptions.series = [{
            type: 'column',
            name: 'Spend',
            data: data
          }];
          this.costChartUpdateFlag = true;
        }
      }
    });

    this.performanceService.getVendorPerformanceSummary().subscribe({
      next: (scores) => {
        // Mock a 3-month trend using the current overall score
        const seriesData = scores.slice(0, 3).map((s: any) => {
          const current = Math.round(s.overall_score || 0);
          return {
            type: 'line',
            name: s.vendor_name,
            data: [
              Math.max(0, current - Math.floor(Math.random() * 10)), 
              Math.max(0, current - Math.floor(Math.random() * 5)), 
              current
            ]
          };
        });
        
        this.performanceChartOptions.series = seriesData as any;
        this.performanceChartUpdateFlag = true;
      }
    });
  }
}
