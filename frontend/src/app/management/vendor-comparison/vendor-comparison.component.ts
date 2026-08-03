import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../performance.service';

@Component({
  selector: 'app-vendor-comparison',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule],
  templateUrl: './vendor-comparison.component.html',
  styleUrls: ['./vendor-comparison.component.scss']
})
export class VendorComparisonComponent implements OnInit {
  compareVendors: any[] = [];
  vendors: any[] = []; // Currently selected vendors for the matrix

  recommendedVendor: any;
  notRecommendedVendor: any;

  // A palette of premium glowing colors for dynamically adding N vendors
  colorPalette = [
    { color: 'rgba(37, 99, 235, 0.4)', stroke: '#3b82f6' }, // Blue
    { color: 'rgba(16, 185, 129, 0.4)', stroke: '#34d399' }, // Emerald
    { color: 'rgba(245, 158, 11, 0.4)', stroke: '#fbbf24' }, // Amber
    { color: 'rgba(236, 72, 153, 0.4)', stroke: '#f472b6' }, // Pink
    { color: 'rgba(139, 92, 246, 0.4)', stroke: '#a78bfa' }, // Violet
    { color: 'rgba(14, 165, 233, 0.4)', stroke: '#38bdf8' }, // Sky
    { color: 'rgba(244, 63, 94, 0.4)', stroke: '#fb7185' },  // Rose
    { color: 'rgba(132, 204, 22, 0.4)', stroke: '#a3e635' }  // Lime
  ];

  constructor(
    public sidebarService: SidebarService,
    private performanceService: PerformanceService
  ) {}

  ngOnInit() {
    this.loadVendors();
  }

  loadVendors() {
    this.performanceService.getVendors().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.compareVendors = data.map((v, i) => {
            const cSet = this.colorPalette[i % this.colorPalette.length];
            
            // Generate some random metrics for the spider chart and table for visual demonstration
            // Real application might get these specifically from an AI or metric endpoint
            const baseScore = 70 + Math.random() * 25;
            const metrics = [
              Math.min(100, baseScore + (Math.random() * 20 - 10)), // Price
              Math.min(100, baseScore + (Math.random() * 20 - 10)), // Quality
              Math.min(100, baseScore + (Math.random() * 20 - 10)), // Speed
              Math.min(100, baseScore + (Math.random() * 20 - 10)), // Comm
              Math.min(100, baseScore + (Math.random() * 20 - 10))  // Compliance
            ];

            const avgQuality = metrics[1] / 20; // Scale 0-5
            const relScore = Math.round(metrics.reduce((a,b)=>a+b, 0) / 5);

            return {
              id: 'V' + v.vendor_id,
              name: v.company_name,
              selected: i < 3, // Select first 3 by default
              color: cSet.color,
              strokeColor: cSet.stroke,
              metrics: metrics,
              
              // Matrix properties
              reliabilityScore: relScore,
              onTimeDelivery: Math.round(metrics[2]),
              qualityRating: avgQuality.toFixed(1),
              riskLevel: relScore > 85 ? 'Low' : (relScore > 70 ? 'Medium' : 'High'),
              avgResponseTime: Math.round(100 - metrics[3]) + ' hours'
            };
          });
          
          this.onVendorSelectionChange();
        }
      },
      error: (err) => console.error('Error fetching vendors:', err)
    });
  }

  onVendorSelectionChange() {
    this.vendors = this.compareVendors.filter(v => v.selected);
    this.calculateRecommendations();
  }

  selectVendor(vendor: any) {
    vendor.selected = true;
    this.onVendorSelectionChange();
  }

  deselectVendor(vendor: any) {
    // Note: window.getSelection() clear is to prevent double-click text selection highlighting
    window.getSelection()?.removeAllRanges();
    vendor.selected = false;
    this.onVendorSelectionChange();
  }

  calculateRecommendations() {
    this.recommendedVendor = null;
    this.notRecommendedVendor = null;

    if (this.vendors.length === 0) return;

    let highestScore = -1;
    let lowestScore = 101;

    this.vendors.forEach(vendor => {
      if (vendor.reliabilityScore > highestScore) {
        highestScore = vendor.reliabilityScore;
        this.recommendedVendor = {
          ...vendor,
          reasons: [
            `Overall Metric Score: ${vendor.reliabilityScore}`,
            `${vendor.riskLevel} Risk Level`,
            `Excellent Quality Rating: ${vendor.qualityRating}/5.0`
          ]
        };
      }
      
      if (vendor.reliabilityScore < lowestScore) {
        lowestScore = vendor.reliabilityScore;
        this.notRecommendedVendor = {
          ...vendor,
          reasons: [
            `${vendor.riskLevel} Risk Level`,
            `Lower Quality Rating: ${vendor.qualityRating}/5.0`,
            `Slower Response Time: ${vendor.avgResponseTime}`
          ]
        };
      }
    });

    // If there's only one selected vendor, they are both highest and lowest. Just keep recommended.
    if (this.vendors.length === 1) {
      this.notRecommendedVendor = null;
    } else if (highestScore === lowestScore && this.vendors.length > 1) {
       this.notRecommendedVendor = null; // No "worst" if tied
    }
  }

  getRadarPoints(vendor: any): string {
    const center = 100;
    const maxVal = 100;
    const maxRadius = 100; // Increased radius because viewBox is wider and we want magnification!
    
    const angles = [
      -Math.PI / 2,         // top (Price)
      -Math.PI / 10,        // top-right (Quality)
      Math.PI * 3 / 10,     // bottom-right (Speed)
      Math.PI * 7 / 10,     // bottom-left (Comm)
      Math.PI * 11 / 10     // top-left (Compliance)
    ];

    return vendor.metrics.map((val: number, i: number) => {
      const r = (val / maxVal) * maxRadius;
      const x = center + r * Math.cos(angles[i]);
      const y = center + r * Math.sin(angles[i]);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }
}
