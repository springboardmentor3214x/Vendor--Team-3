import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../performance.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import * as THREE from 'three';
import { LucideAngularModule, TrendingUp, TrendingDown, Minus, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-angular';

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
  imports: [CommonModule, FormsModule, SidebarComponent, BaseChartDirective, LucideAngularModule],
  templateUrl: './reliability.component.html',
  styleUrl: './reliability.component.scss'
})
export class ReliabilityComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('threeCanvasContainer', { static: false }) threeCanvasContainer!: ElementRef;
  
  // Three.js instances
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private mesh!: THREE.Mesh;
  private animationId: number = 0;
  
  // Icons
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Minus = Minus;
  readonly ShieldAlert = ShieldAlert;
  readonly ShieldCheck = ShieldCheck;
  readonly AlertTriangle = AlertTriangle;

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

  ngAfterViewInit() {
    // Need to wait for DOM to render the tab before initializing 3D
    setTimeout(() => {
      this.initThreeJs();
    }, 100);
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.renderer) this.renderer.dispose();
  }

  initThreeJs() {
    if (!this.threeCanvasContainer) return;
    
    const container = this.threeCanvasContainer.nativeElement;
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Clear container
    while(container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(this.renderer.domElement);

    // Create a cool icosahedron wireframe
    const geometry = new THREE.IcosahedronGeometry(1.5, 1);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x6366f1, 
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.mesh.rotation.x += 0.005;
      this.mesh.rotation.y += 0.008;
      this.renderer.render(this.scene, this.camera);
    };
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
      if (!this.threeCanvasContainer) return;
      const newWidth = this.threeCanvasContainer.nativeElement.clientWidth;
      const newHeight = this.threeCanvasContainer.nativeElement.clientHeight;
      this.renderer.setSize(newWidth, newHeight);
      this.camera.aspect = newWidth / newHeight;
      this.camera.updateProjectionMatrix();
    });
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
          this.performanceService.getReliabilityDashboard().subscribe({
            next: (data: any) => {
              this.dashboardData = data;
              this.rankingsList = data.top_ranked;
              
              // Update Bar Chart
              this.barChartData.labels = data.top_ranked.map((r: any) => r.vendor_name);
              this.barChartData.datasets[0].data = data.top_ranked.map((r: any) => r.reliability_score);
              this.barChartData = {...this.barChartData};

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
    
    // Re-initialize threejs if switching to dashboard
    if (tabId === 'dashboard') {
      setTimeout(() => this.initThreeJs(), 100);
    }
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
