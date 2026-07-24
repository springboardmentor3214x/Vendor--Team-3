import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../performance.service';

interface PerformanceMetric {
  vendorId: string;
  vendorName: string;
  onTimeRate: number;
  qualityRating: number;
  responseTimeHours: number;
  orderCompletionRate: number;
  ranking: number;
}

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.scss'
})
export class PerformanceComponent implements OnInit {
  // Navigation & UI tabs
  activeTab: string = 'dashboard';
  
  // Dashboard & Metrics State
  dashboardData: any = {
    total_vendors_evaluated: 0,
    avg_delivery_performance: 0,
    avg_product_quality: 0,
    avg_response_time_hours: 0,
    total_completed_orders: 0,
    delayed_deliveries_count: 0,
    rankings: []
  };
  
  rankings: any[] = [];
  vendors: any[] = [];
  purchaseOrders: any[] = [];
  selectedVendorHistory: any[] = [];
  historyVendorId: number | null = null;

  isVendor: boolean = false;
  vendorId: number | null = null;

  // Form States
  // 1. Delivery Recording
  deliveryForm = {
    purchase_order_id: 0,
    actual_delivery_date: '',
    remarks: ''
  };

  // 2. Product Quality Evaluation
  qualityForm = {
    vendor_id: 0,
    purchase_order_id: 0,
    inspection_date: '',
    material_quality: 5,
    packaging_quality: 5,
    quantity_accuracy: 5,
    specification_compliance: 5,
    product_defects: 0,
    remarks: ''
  };

  // 3. Communication Log
  commForm = {
    vendor_id: 0,
    purchase_order_id: 0,
    message_sent_time: '',
    vendor_response_time: '',
    remarks: ''
  };

  // 4. Service Rating
  serviceForm = {
    vendor_id: 0,
    purchase_order_id: 0,
    professionalism: 5,
    customer_support: 5,
    documentation_quality: 5,
    flexibility: 5,
    communication_effectiveness: 5,
    issue_resolution: 5,
    comments: ''
  };

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

    // Load reference lists
    this.performanceService.getVendors().subscribe({
      next: (vendors) => {
        this.vendors = vendors;
        
        if (this.isVendor && email) {
          const currentVendor = vendors.find(v => v.email.toLowerCase() === email.toLowerCase());
          if (currentVendor) {
            this.vendorId = currentVendor.vendor_id;
            this.historyVendorId = this.vendorId;
            this.loadVendorHistory(this.vendorId);
            
            // Load reliability details to get vendor-specific dashboard metrics
            this.performanceService.getReliabilityDetails(currentVendor.vendor_id).subscribe({
              next: (rel) => {
                this.dashboardData = {
                  total_vendors_evaluated: 1,
                  avg_delivery_performance: rel.delivery_score ? Number(rel.delivery_score).toFixed(1) : '0',
                  avg_product_quality: rel.quality_score || 0,
                  avg_response_time_hours: rel.communication_score || 0,
                  total_completed_orders: 0,
                  delayed_deliveries_count: 0,
                  rankings: []
                };

                // Fetch POs to get order count and delay counts
                this.performanceService.getPurchaseOrders().subscribe(pos => {
                  const vendorPOs = pos.filter(po => po.vendor_id === this.vendorId);
                  this.purchaseOrders = vendorPOs;
                  this.dashboardData.total_completed_orders = vendorPOs.filter(po => po.status === 'Completed').length;
                  
                  // Fetch rankings to find their position
                  this.performanceService.getSupplierRankings().subscribe(rankings => {
                    const myRank = rankings.find((r: any) => r.vendor_id === this.vendorId);
                    if (myRank) {
                      this.rankings = [myRank];
                    } else {
                      this.rankings = [];
                    }
                    this.isLoading = false;
                  });
                });
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
          // Procurement/Admin path: load all
          this.performanceService.getPerformanceDashboard().subscribe({
            next: (data) => {
              this.dashboardData = data;
              this.rankings = data.rankings || [];
              
              this.performanceService.getPurchaseOrders().subscribe(pos => {
                this.purchaseOrders = pos;
                this.isLoading = false;
              });
            },
            error: (err) => {
              console.error('Error fetching performance dashboard', err);
              this.errorMessage = 'Could not fetch dashboard summary from backend.';
              this.isLoading = false;
            }
          });
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

  // Find PO details for select dropdown
  getCompletedPOs() {
    return this.purchaseOrders.filter(po => po.status === 'Completed');
  }

  getPendingPOs() {
    return this.purchaseOrders.filter(po => po.status === 'Pending' || po.status === 'Processing');
  }

  // Get vendor name by ID helper
  getVendorName(vendorId: number): string {
    const v = this.vendors.find(item => item.vendor_id === vendorId);
    return v ? v.company_name : `Vendor #${vendorId}`;
  }

  // Get PO Number by ID helper
  getPOStatus(poId: number): string {
    const po = this.purchaseOrders.find(item => item.order_id === poId);
    return po ? po.status : 'Unknown';
  }

  // Auto set vendor ID when PO is selected in forms
  onPOSelected(poId: any, formType: string) {
    const numericPoId = Number(poId);
    const po = this.purchaseOrders.find(item => item.order_id === numericPoId);
    if (po) {
      const vendorId = po.vendor_id;
      if (formType === 'quality') this.qualityForm.vendor_id = vendorId;
      if (formType === 'comm') this.commForm.vendor_id = vendorId;
      if (formType === 'service') this.serviceForm.vendor_id = vendorId;
    }
  }

  // ---------------------------------------------
  // Form Submission Logic
  // ---------------------------------------------
  
  // Submit Delivery Recording (completes a PO)
  onRecordDelivery() {
    if (!this.deliveryForm.purchase_order_id || !this.deliveryForm.actual_delivery_date) {
      this.errorMessage = 'Please select a Purchase Order and delivery date.';
      return;
    }
    
    this.isLoading = true;
    const poId = Number(this.deliveryForm.purchase_order_id);
    const payload = {
      status: 'Completed',
      actual_delivery_date: this.deliveryForm.actual_delivery_date
    };

    this.performanceService.updatePurchaseOrderStatus(poId, payload).subscribe({
      next: (res) => {
        this.successMessage = `Delivery performance recorded! Purchase Order #${res.order_number} marked as Completed. Delay calculated automatically.`;
        this.deliveryForm = { purchase_order_id: 0, actual_delivery_date: '', remarks: '' };
        this.loadAllData();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to record delivery details. Verify role permissions.';
        this.isLoading = false;
      }
    });
  }

  // Submit Product Quality Evaluation
  onSubmitQuality() {
    if (!this.qualityForm.purchase_order_id || !this.qualityForm.inspection_date) {
      this.errorMessage = 'Please select a Purchase Order and inspection date.';
      return;
    }
    
    this.isLoading = true;
    const payload = {
      ...this.qualityForm,
      vendor_id: Number(this.qualityForm.vendor_id),
      purchase_order_id: Number(this.qualityForm.purchase_order_id),
      material_quality: Number(this.qualityForm.material_quality),
      packaging_quality: Number(this.qualityForm.packaging_quality),
      quantity_accuracy: Number(this.qualityForm.quantity_accuracy),
      specification_compliance: Number(this.qualityForm.specification_compliance),
      product_defects: Number(this.qualityForm.product_defects)
    };

    this.performanceService.submitQualityEvaluation(payload).subscribe({
      next: () => {
        this.successMessage = 'Product Quality Evaluation submitted successfully! Vendor scores updated.';
        this.qualityForm = {
          vendor_id: 0,
          purchase_order_id: 0,
          inspection_date: '',
          material_quality: 5,
          packaging_quality: 5,
          quantity_accuracy: 5,
          specification_compliance: 5,
          product_defects: 0,
          remarks: ''
        };
        this.loadAllData();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to submit quality evaluation. Make sure role is authorized.';
        this.isLoading = false;
      }
    });
  }

  // Submit Communication Log
  onSubmitCommLog() {
    if (!this.commForm.purchase_order_id || !this.commForm.message_sent_time) {
      this.errorMessage = 'Please select a Purchase Order and sent time.';
      return;
    }
    
    this.isLoading = true;
    const payload = {
      ...this.commForm,
      vendor_id: Number(this.commForm.vendor_id),
      purchase_order_id: Number(this.commForm.purchase_order_id),
      message_sent_time: new Date(this.commForm.message_sent_time).toISOString(),
      vendor_response_time: this.commForm.vendor_response_time ? new Date(this.commForm.vendor_response_time).toISOString() : null
    };

    this.performanceService.submitCommunicationLog(payload).subscribe({
      next: () => {
        this.successMessage = 'Communication log recorded! Response times recalculated.';
        this.commForm = {
          vendor_id: 0,
          purchase_order_id: 0,
          message_sent_time: '',
          vendor_response_time: '',
          remarks: ''
        };
        this.loadAllData();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to log communication log.';
        this.isLoading = false;
      }
    });
  }

  // Submit Service Rating
  onSubmitServiceRating() {
    if (!this.serviceForm.purchase_order_id) {
      this.errorMessage = 'Please select a Purchase Order.';
      return;
    }
    
    this.isLoading = true;
    const payload = {
      ...this.serviceForm,
      vendor_id: Number(this.serviceForm.vendor_id),
      purchase_order_id: Number(this.serviceForm.purchase_order_id),
      professionalism: Number(this.serviceForm.professionalism),
      customer_support: Number(this.serviceForm.customer_support),
      documentation_quality: Number(this.serviceForm.documentation_quality),
      flexibility: Number(this.serviceForm.flexibility),
      communication_effectiveness: Number(this.serviceForm.communication_effectiveness),
      issue_resolution: Number(this.serviceForm.issue_resolution)
    };

    this.performanceService.submitServiceRating(payload).subscribe({
      next: () => {
        this.successMessage = 'Service rating submitted! Overall vendor metrics recalculated.';
        this.serviceForm = {
          vendor_id: 0,
          purchase_order_id: 0,
          professionalism: 5,
          customer_support: 5,
          documentation_quality: 5,
          flexibility: 5,
          communication_effectiveness: 5,
          issue_resolution: 5,
          comments: ''
        };
        this.loadAllData();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to submit service rating.';
        this.isLoading = false;
      }
    });
  }

  // Load selected vendor's history logs
  loadVendorHistory(vendorIdStr: any) {
    const vId = Number(vendorIdStr);
    if (!vId) return;
    this.historyVendorId = vId;
    this.isLoading = true;
    this.performanceService.getPerformanceHistory(vId).subscribe({
      next: (data) => {
        this.selectedVendorHistory = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Could not load vendor performance history.';
        this.isLoading = false;
      }
    });
  }
}
