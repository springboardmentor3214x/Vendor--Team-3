import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

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
export class PerformanceComponent {
  metrics: PerformanceMetric[] = [];

  constructor(public sidebarService: SidebarService, private router: Router) {
    this.loadMetrics();
  }

  loadMetrics() {
    const cached = localStorage.getItem('vrp_performance_metrics');
    if (cached) {
      this.metrics = JSON.parse(cached);
    } else {
      this.metrics = [
        { vendorId: 'V001', vendorName: 'ABC Pvt Ltd', onTimeRate: 96, qualityRating: 4.8, responseTimeHours: 2, orderCompletionRate: 98, ranking: 2 },
        { vendorId: 'V003', vendorName: 'Tech India', onTimeRate: 98, qualityRating: 4.9, responseTimeHours: 1, orderCompletionRate: 99, ranking: 1 },
        { vendorId: 'V002', vendorName: 'XYZ Suppliers', onTimeRate: 85, qualityRating: 4.2, responseTimeHours: 4, orderCompletionRate: 90, ranking: 3 }
      ];
      this.saveMetrics();
    }
  }

  saveMetrics() {
    localStorage.setItem('vrp_performance_metrics', JSON.stringify(this.metrics));
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  updateQualityRating(metric: PerformanceMetric, score: number) {
    metric.qualityRating = score;
    this.saveMetrics();
    alert(`Quality rating updated for ${metric.vendorName}!`);
  }
}
