import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

interface ReliabilityMetric {
  vendorId: string;
  vendorName: string;
  reliabilityScore: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High';
  trend: 'Up' | 'Stable' | 'Down';
  recommendation: string;
}

@Component({
  selector: 'app-reliability',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './reliability.component.html',
  styleUrl: './reliability.component.scss'
})
export class ReliabilityComponent {
  metrics: ReliabilityMetric[] = [];

  constructor(public sidebarService: SidebarService, private router: Router) {
    this.loadMetrics();
  }

  loadMetrics() {
    const cached = localStorage.getItem('vrp_reliability_metrics');
    if (cached) {
      this.metrics = JSON.parse(cached);
    } else {
      this.metrics = [
        { vendorId: 'V003', vendorName: 'Tech India', reliabilityScore: 98, riskLevel: 'Low', trend: 'Up', recommendation: 'Highly Recommended for critical IT and raw electronics assignments.' },
        { vendorId: 'V001', vendorName: 'ABC Pvt Ltd', reliabilityScore: 94, riskLevel: 'Low', trend: 'Stable', recommendation: 'Recommended for standard operations and logistics.' },
        { vendorId: 'V002', vendorName: 'XYZ Suppliers', reliabilityScore: 78, riskLevel: 'Medium', trend: 'Down', recommendation: 'Monitor delivery delays. Recommended only with backup partners.' }
      ];
      this.saveMetrics();
    }
  }

  saveMetrics() {
    localStorage.setItem('vrp_reliability_metrics', JSON.stringify(this.metrics));
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }
}
