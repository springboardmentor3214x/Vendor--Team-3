import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

@Component({
  selector: 'app-procurement-manager',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, FormsModule],
  templateUrl: './procurement-manager.component.html',
  styleUrl: './procurement-manager.component.scss'
})
export class ProcurementManagerComponent {
  constructor(public sidebarService: SidebarService) {}

  compareVendors = [
    { id: 'V1', name: 'ABC Pvt Ltd', selected: true, color: 'rgba(37, 99, 235, 0.4)', strokeColor: '#2563eb', metrics: [80, 90, 85, 75, 95] },
    { id: 'V2', name: 'XYZ Suppliers', selected: true, color: 'rgba(16, 185, 129, 0.4)', strokeColor: '#10b981', metrics: [95, 60, 70, 80, 75] },
    { id: 'V3', name: 'Tech India', selected: false, color: 'rgba(245, 158, 11, 0.4)', strokeColor: '#f59e0b', metrics: [60, 95, 90, 90, 85] }
  ];

  getRadarPoints(vendor: any): string {
    const center = 100;
    const maxVal = 100;
    const maxRadius = 60;
    
    // Angles for 5 dimensions in radians: Price, Quality, Delivery Speed, Communication, Compliance
    const angles = [
      -Math.PI / 2,         // top
      -Math.PI / 10,        // top-right
      Math.PI * 3 / 10,     // bottom-right
      Math.PI * 7 / 10,     // bottom-left
      Math.PI * 11 / 10     // top-left
    ];

    return vendor.metrics.map((val: number, i: number) => {
      const r = (val / maxVal) * maxRadius;
      const x = center + r * Math.cos(angles[i]);
      const y = center + r * Math.sin(angles[i]);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }
}
