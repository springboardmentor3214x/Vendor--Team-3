import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  metrics = [
    { title: 'Total Vendors', value: '142', icon: 'store', color: '#3f51b5' },
    { title: 'Pending POs', value: '28', icon: 'pending_actions', color: '#ff9800' },
    { title: 'Active Contracts', value: '85', icon: 'description', color: '#4caf50' },
    { title: 'Alerts', value: '3', icon: 'warning', color: '#f44336' }
  ];

  recentActivities = [
    { message: 'New vendor "TechLogix" registered.', time: '2 hours ago' },
    { message: 'Purchase Order #1045 approved.', time: '5 hours ago' },
    { message: 'Contract for "Acme Corp" expires in 30 days.', time: '1 day ago' },
  ];
}
