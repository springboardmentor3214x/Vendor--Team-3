import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../../management/performance.service';

import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-supply-chain-manager',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, FormsModule, HighchartsChartModule],
  templateUrl: './supply-chain-manager.component.html',
  styleUrl: './supply-chain-manager.component.scss'
})
export class SupplyChainManagerComponent implements OnInit {
  activeVendorsCount = 0;
  deliveriesTodayCount = 0;
  delayedShipmentsCount = 0;
  avgReliabilityScore = 0;

  reliabilityRatings: any[] = [];
  deliveryTrackingLogs: any[] = [];
  vendorPerformanceList: any[] = [];
  recentShipments: any[] = [];
  upcomingDeliveries: any[] = [];

  deliveredCount = 0;
  onRouteCount = 0;
  delayedCount = 0;
  searchTerm = '';

  Highcharts: typeof Highcharts = Highcharts;
  scatterOptions: Highcharts.Options = {
    chart: {
      type: 'scatter',
      zoomType: 'xy',
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Vendor Delivery Speed vs Defect Rate'
    },
    xAxis: {
      title: { enabled: true, text: 'Delivery Speed (Days)' },
      startOnTick: true,
      endOnTick: true,
      showLastLabel: true
    },
    yAxis: {
      title: { text: 'Defect Rate (%)' }
    },
    plotOptions: {
      scatter: {
        marker: {
          radius: 5,
          states: { hover: { enabled: true, lineColor: 'rgb(100,100,100)' } }
        },
        states: { hover: { marker: { enabled: false } } },
        tooltip: {
          headerFormat: '<b>{series.name}</b><br>',
          pointFormat: '{point.x} days, {point.y} % defects'
        }
      }
    },
    series: [{
      name: 'Vendors',
      type: 'scatter',
      color: 'rgba(99, 102, 241, .5)',
      data: []
    }],
    credits: { enabled: false }
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
      // Filter recentShipments and vendorPerformanceList
      const term = this.searchTerm.toLowerCase();
      this.recentShipments = this.recentShipments.filter(s =>
        s.vendor.toLowerCase().includes(term) || s.id.toLowerCase().includes(term)
      );
    } else {
      this.loadDashboardData();
    }
  }

  loadDashboardData() {
    // 1. Fetch Active Vendors
    this.performanceService.getVendorSummary().subscribe({
      next: (summary) => {
        this.activeVendorsCount = summary.active_vendors || 0;
      },
      error: (err) => console.error('Error fetching SCM vendor summary', err)
    });

    // 2. Fetch Reliability Dashboard
    this.performanceService.getReliabilityDashboard().subscribe({
      next: (data) => {
        this.avgReliabilityScore = Math.round(data.avg_reliability_score || 0);
        
        // Map ratings stars
        this.reliabilityRatings = (data.top_ranked || []).slice(0, 4).map((r: any) => {
          const stars = r.reliability_score >= 90 ? '-~.-~.-~.-~.-~.' : (r.reliability_score >= 75 ? '-~.-~.-~.-~.-~+' : '-~.-~.-~.-~+-~+');
          return {
            stars: stars,
            name: r.vendor_name
          };
        });

        // Map performance rows
        this.vendorPerformanceList = (data.top_ranked || []).slice(0, 3).map((r: any) => ({
          name: r.vendor_name,
          score: Math.round(r.reliability_score)
        }));
        
        // Scatter Plot Data
        const scatterData = (data.top_ranked || []).map((r: any) => {
           // mock delivery speed vs defect rate based on score
           const speed = Math.max(1, Math.round(15 - (r.reliability_score / 10)));
           const defects = Math.max(0, Math.round(20 - (r.reliability_score / 5)));
           return { x: speed, y: defects, name: r.vendor_name };
        });
        
        this.scatterOptions.series = [{
            type: 'scatter',
            name: 'Vendors',
            data: scatterData,
            color: 'rgba(99, 102, 241, .7)'
        }];
        this.updateFlag = true;
      },
      error: (err) => {
        console.error('Error fetching reliability stats, fallback to seed', err);
        this.avgReliabilityScore = 83;
        this.reliabilityRatings = [
          { stars: '★★★★★', name: 'ABC Pvt Ltd' },
          { stars: '★★★★☆', name: 'Tech India' },
          { stars: '★★★★☆', name: 'XYZ Suppliers' }
        ];
        this.vendorPerformanceList = [
          { name: 'ABC Pvt Ltd', score: 97 },
          { name: 'Tech India', score: 80 },
          { name: 'XYZ Suppliers', score: 73 }
        ];
      }
    });

    // 3. Fetch Purchase Orders for Shipments mapping
    this.performanceService.getPurchaseOrders().subscribe({
      next: (pos) => {
        this.performanceService.getVendors().subscribe({
          next: (vendors) => {
            const vendorMap = new Map(vendors.map(v => [v.vendor_id, v.company_name]));
            const todayStr = new Date().toISOString().split('T')[0];

            // Reset counts
            this.deliveredCount = 0;
            this.onRouteCount = 0;
            this.delayedCount = 0;

            const mappedShipments = pos.map((po, index) => {
              let status = 'Pending';
              let priority = 'Medium';
              
              if (po.status === 'Completed') {
                status = 'Delivered';
                this.deliveredCount++;
              } else if (po.status === 'In Transit' || po.status === 'Approved') {
                status = 'On Route';
                this.onRouteCount++;
              } else {
                status = 'Pending';
              }

              // Check delay
              const deliveryDate = po.delivery_date ? new Date(po.delivery_date) : null;
              if (deliveryDate && deliveryDate < new Date() && po.status !== 'Completed') {
                status = 'Delayed';
                this.delayedCount++;
              }

              if (po.total_amount > 100000) {
                priority = 'High';
              } else if (po.total_amount < 30000) {
                priority = 'Low';
              }

              return {
                id: 'SH' + String(100 + po.order_id),
                vendor: vendorMap.get(po.vendor_id) || 'Unknown Vendor',
                destination: po.shipping_address || 'Warehouse A',
                priority: priority,
                date: po.delivery_date || po.order_date,
                status: status
              };
            });

            this.recentShipments = mappedShipments.slice().sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);
            this.delayedShipmentsCount = this.delayedCount;
            this.deliveriesTodayCount = pos.filter(po => po.delivery_date === todayStr).length;

            // Generate delivery tracking logs
            this.deliveryTrackingLogs = mappedShipments.slice(0, 4).map(s => ({
              text: `Truck for ${s.vendor} is ${s.status}`,
              statusClass: s.status === 'Delivered' ? 'green' : (s.status === 'Delayed' ? 'red' : 'blue')
            }));

            // Generate upcoming deliveries list
            this.upcomingDeliveries = pos.filter(po => po.status !== 'Completed').slice(0, 3).map((po, i) => ({
              truck: `Truck ${10 + po.order_id}`,
              day: po.delivery_date ? new Date(po.delivery_date).toLocaleDateString(undefined, { weekday: 'long' }) : 'Scheduled'
            }));
          }
        });
      },
      error: (err) => console.error('Error fetching SCM purchase orders', err)
    });
  }
}
