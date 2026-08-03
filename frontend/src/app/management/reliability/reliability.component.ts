import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../performance.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

interface ReliabilityMetric {
  reliability_id: number;
  vendor_id: number;
  vendor_name: string;
  vendor_category: string;
  reliability_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  trend: 'Up' | 'Stable' | 'Down';
  recommendation_status: string;
  last_calculated: string;
}

@Component({
  selector: 'app-reliability',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, BaseChartDirective],
  templateUrl: './reliability.component.html',
  styleUrl: './reliability.component.scss'
})
export class ReliabilityComponent implements OnInit {
  activeTab: string = 'dashboard';
  
  // Charts configuration
  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: { r: { min: 0, max: 100 } }
  };
  public radarChartData: ChartData<'radar'> = {
    labels: ['Delivery', 'Quality', 'Communication', 'Compliance', 'Resolution', 'History'],
    datasets: [
      { data: [0, 0, 0, 0, 0, 0], label: 'Vendor Score', borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.2)' }
    ]
  };
  public radarChartType: ChartType = 'radar';

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: { y: { min: 0, max: 100 } }
  };
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Reliability Score', backgroundColor: '#3b82f6' }
    ]
  };
  public barChartType: ChartType = 'bar';

  // Dashboard Metrics
  dashboardData = {
    total_vendors_evaluated: 0,
    avg_reliability_score: 0,
    high_reliability_count: 0,
    medium_reliability_count: 0,
    high_risk_count: 0,
    top_ranked: [] as ReliabilityMetric[]
  };

  // Detailed Factor State
  selectedVendorDetails: any = null;
  selectedVendorId: number | null = null;

  // Supplier Rankings List
  rankingsList: ReliabilityMetric[] = [];

  // Recommendations State
  categoryFilter: string = '';
  recommendationsList: any[] = [];

  // Category List
  categories: string[] = ['Raw Material', 'Logistics', 'IT Vendor'];

  isVendor: boolean = false;
  vendorId: number | null = null;
  vendors: any[] = [];
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    public sidebarService: SidebarService,
    private performanceService: PerformanceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    this.isVendor = role?.toLowerCase() === 'vendor';

    // Load vendors reference list
    this.performanceService.getVendors().subscribe({
      next: (vendors) => {
        this.vendors = vendors;

        if (this.isVendor && email) {
          const currentVendor = vendors.find(v => v.email.toLowerCase() === email.toLowerCase());
          if (currentVendor) {
            this.vendorId = currentVendor.vendor_id;
            this.selectedVendorId = this.vendorId;
            this.onVendorDetailsSelected(this.vendorId);

            // Fetch reliability dashboard metrics (fallback for vendor)
            this.performanceService.getSupplierRankings().subscribe({
              next: (rankings: any[]) => {
                const myRank = rankings.find((r: any) => r.vendor_id === this.vendorId);
                const enriched = myRank ? {
                  ...myRank,
                  vendor_name: currentVendor.company_name,
                  vendor_category: currentVendor.vendor_category,
                  trend: 'Stable'
                } : null;

                this.rankingsList = enriched ? [enriched] : [];
                
                this.dashboardData = {
                  total_vendors_evaluated: 1,
                  avg_reliability_score: enriched ? enriched.reliability_score : 0,
                  high_reliability_count: 0,
                  medium_reliability_count: 0,
                  high_risk_count: 0,
                  top_ranked: enriched ? [enriched] : []
                };
                this.isLoading = false;
              },
              error: (err) => {
                console.error(err);
                this.isLoading = false;
              }
            });

          } else {
            this.isLoading = false;
          }
        } else {
          // Procurement / Admin path: load all
          this.performanceService.getSupplierRankings().subscribe({
            next: (data: any[]) => {
              const enrichedData = data.map(r => {
                const v = this.vendors.find(vend => vend.vendor_id === r.vendor_id);
                return {
                  ...r,
                  vendor_name: v ? v.company_name : `Vendor #${r.vendor_id}`,
                  vendor_category: v ? v.vendor_category : 'General',
                  trend: 'Stable'
                };
              });

              this.rankingsList = enrichedData;
              
              // Update Bar Chart
              this.barChartData.labels = enrichedData.map(r => r.vendor_name);
              this.barChartData.datasets[0].data = enrichedData.map(r => r.reliability_score);
              this.barChartData = {...this.barChartData};

              const total = enrichedData.length;
              const highCount = enrichedData.filter(r => r.risk_level === 'Low').length; // Low risk = high reliability
              const mediumCount = enrichedData.filter(r => r.risk_level === 'Medium').length;
              const highRiskCount = enrichedData.filter(r => r.risk_level === 'High').length;
              const avgScore = total > 0 ? enrichedData.reduce((acc, curr) => acc + curr.reliability_score, 0) / total : 0;

              this.dashboardData = {
                  total_vendors_evaluated: total,
                  avg_reliability_score: avgScore,
                  high_reliability_count: highCount,
                  medium_reliability_count: mediumCount,
                  high_risk_count: highRiskCount,
                  top_ranked: enrichedData.slice(0, 5)
              };
              this.isLoading = false;
            },
            error: (err) => {
              console.error(err);
              this.errorMessage = 'Could not load reliability dashboard from backend.';
              this.isLoading = false;
            }
          });

          this.loadRecommendations();
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  switchTab(tabId: string) {
    this.activeTab = tabId;
    this.successMessage = '';
    this.errorMessage = '';
  }

  goBack() {
    const route = this.sidebarService.getDashboardRoute();
    this.router.navigate([route]);
  }

  // Load detailed factors for a specific vendor
  onVendorDetailsSelected(vendorIdStr: any) {
    const vendorId = Number(vendorIdStr);
    if (!vendorId) {
      this.selectedVendorDetails = null;
      return;
    }
    
    this.isLoading = true;
    this.performanceService.getReliabilityDetails(vendorId).subscribe({
      next: (data) => {
        this.selectedVendorDetails = data;
        if (data) {
          this.radarChartData.datasets[0].data = [
            data.delivery_score || 0,
            data.quality_score || 0,
            data.communication_score || 0,
            data.contract_compliance_score || 0,
            data.issue_resolution_score || 0,
            data.purchase_history_score || 0
          ];
          this.radarChartData = {...this.radarChartData};
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Could not load reliability details for this vendor.';
        this.selectedVendorDetails = null;
        this.isLoading = false;
      }
    });
  }

  // Fetch recommendations based on current category filter
  loadRecommendations() {
    this.performanceService.getProcurementRecommendations(this.categoryFilter).subscribe({
      next: (data) => {
        this.recommendationsList = data;
      }
    });
  }

  // Force recalculate
  triggerRecalculate(vendorId: number) {
    this.isLoading = true;
    this.performanceService.forceRecalculate(vendorId).subscribe({
      next: () => {
        this.successMessage = 'Vendor reliability factors recalculated successfully!';
        this.loadAllData();
        if (this.selectedVendorId && Number(this.selectedVendorId) === vendorId) {
          this.onVendorDetailsSelected(vendorId);
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to recalculate metrics. Authorization restricted.';
        this.isLoading = false;
      }
    });
  }
}
