import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

import { ReportService, ReportFilter } from '../../services/report/report.service';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
    BaseChartDirective
  ],
  templateUrl: './reports-dashboard.component.html',
  styleUrls: ['./reports-dashboard.component.css']
})
export class ReportsDashboardComponent implements OnInit {
  reportTypes = ['Vendor Performance', 'Procurement', 'Compliance', 'Contracts'];
  categories = ['IT', 'Hardware', 'Software', 'Furniture', 'Office'];

  filter: ReportFilter = {
    type: 'Vendor Performance',
    category: ''
  };

  displayedColumns: string[] = [];
  dataSource: any[] = [];
  
  // Chart configurations
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.reportService.getReports(this.filter).subscribe(data => {
      this.dataSource = data;
      this.updateTableColumns();
      this.updateChart();
    });
  }

  updateTableColumns() {
    if (this.dataSource.length > 0) {
      this.displayedColumns = Object.keys(this.dataSource[0]);
    } else {
      this.displayedColumns = [];
    }
  }

  updateChart() {
    if (this.dataSource.length === 0) {
      this.barChartData = { labels: [], datasets: [] };
      return;
    }

    if (this.filter.type === 'Vendor Performance') {
      this.barChartData = {
        labels: this.dataSource.map(d => d.vendor),
        datasets: [{ data: this.dataSource.map(d => d.score), label: 'Score' }]
      };
    } else if (this.filter.type === 'Procurement') {
      this.barChartData = {
        labels: this.dataSource.map(d => d.item),
        datasets: [{ data: this.dataSource.map(d => d.amount), label: 'Amount' }]
      };
    } else {
      // generic chart based on first string vs first number field
      const strField = this.displayedColumns.find(col => typeof this.dataSource[0][col] === 'string');
      const numField = this.displayedColumns.find(col => typeof this.dataSource[0][col] === 'number');
      
      if (strField && numField) {
        this.barChartData = {
          labels: this.dataSource.map(d => d[strField]),
          datasets: [{ data: this.dataSource.map(d => d[numField]), label: numField }]
        };
      }
    }
  }

  exportPDF() {
    this.reportService.downloadExport(this.filter, 'pdf').subscribe({
      next: (blob) => this.downloadFile(blob, `report_${this.filter.type}.pdf`),
      error: () => this.fallbackExport('pdf')
    });
  }

  exportExcel() {
    this.reportService.downloadExport(this.filter, 'excel').subscribe({
      next: (blob) => this.downloadFile(blob, `report_${this.filter.type}.xlsx`),
      error: () => this.fallbackExport('excel')
    });
  }

  private fallbackExport(format: string) {
    // If backend is not available, we can trigger a simple CSV export as fallback
    if (format === 'excel') {
      if (this.dataSource.length === 0) return;
      const headers = this.displayedColumns.join(',');
      const rows = this.dataSource.map(row => this.displayedColumns.map(col => row[col]).join(','));
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      this.downloadFile(blob, `report_${this.filter.type}.csv`);
    } else {
      window.print();
    }
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
}
