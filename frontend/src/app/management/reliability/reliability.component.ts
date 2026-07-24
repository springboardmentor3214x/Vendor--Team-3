import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../performance.service';

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
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './reliability.component.html',
  styleUrl: './reliability.component.scss'
})
export class ReliabilityComponent implements OnInit {
  activeTab: string = 'dashboard';
  
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

            // Fetch reliability dashboard metrics
            this.performanceService.getReliabilityDashboard().subscribe({
              next: (data) => {
                this.dashboardData = {
                  total_vendors_evaluated: 1,
                  avg_reliability_score: 0,
                  high_reliability_count: 0,
                  medium_reliability_count: 0,
                  high_risk_count: 0,
                  top_ranked: []
                };
                this.isLoading = false;
              },
              error: (err) => {
                console.error(err);
                this.isLoading = false;
              }
            });

            // Load rankings list filtered only to this vendor
            this.performanceService.getSupplierRankings().subscribe({
              next: (rankings) => {
                const myRank = rankings.find((r: any) => r.vendor_id === this.vendorId);
                this.rankingsList = myRank ? [myRank] : [];
                if (myRank) {
                  this.dashboardData.avg_reliability_score = myRank.reliability_score;
                }
              }
            });

          } else {
            this.isLoading = false;
          }
        } else {
          // Procurement / Admin path: load all
          this.performanceService.getReliabilityDashboard().subscribe({
            next: (data) => {
              this.dashboardData = data;
              this.isLoading = false;
            },
            error: (err) => {
              console.error(err);
              this.errorMessage = 'Could not load reliability dashboard from backend.';
              this.isLoading = false;
            }
          });

          this.performanceService.getSupplierRankings().subscribe({
            next: (data) => {
              this.rankingsList = data;
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
