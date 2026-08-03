import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

export interface Vendor {
  id: number;
  vendor_name: string;
  category: string;
  contact_person: string;
  email: string;
  phone: string;
  status: string;
}

const MOCK_DATA: Vendor[] = [
  {id: 1, vendor_name: 'Acme Corp', category: 'Raw Material', contact_person: 'John Doe', email: 'john@acme.com', phone: '123-456', status: 'Approved'},
  {id: 2, vendor_name: 'TechLogix', category: 'IT', contact_person: 'Jane Smith', email: 'jane@tech.com', phone: '987-654', status: 'Pending'}
];

@Component({
  selector: 'app-vendor-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatButtonModule, MatIconModule, BaseChartDirective],
  templateUrl: './vendor-management.component.html',
  styleUrl: './vendor-management.component.scss'
})
export class VendorManagementComponent {
  displayedColumns: string[] = ['id', 'vendor_name', 'category', 'contact_person', 'email', 'status', 'actions'];
  dataSource = MOCK_DATA;

  // Chart configuration
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'right' }
    }
  };
  public pieChartData: ChartData<'pie'> = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      { data: [65, 25, 10], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }
    ]
  };
  public pieChartType: ChartType = 'pie';
}
