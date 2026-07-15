import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

interface ReportRow {
  id: string;
  name: string;
  type: string;
  value: string;
  date: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  selectedReport = 'Performance';
  reportData: ReportRow[] = [];

  constructor(public sidebarService: SidebarService, private router: Router) {
    this.generateReport();
  }

  generateReport() {
    if (this.selectedReport === 'Performance') {
      this.reportData = [
        { id: 'V001', name: 'ABC Pvt Ltd', type: 'Quality Score', value: '4.8 / 5.0', date: '2026-07-15' },
        { id: 'V002', name: 'XYZ Suppliers', type: 'Quality Score', value: '4.2 / 5.0', date: '2026-07-15' },
        { id: 'V003', name: 'Tech India', type: 'Quality Score', value: '4.9 / 5.0', date: '2026-07-14' }
      ];
    } else if (this.selectedReport === 'Procurement') {
      this.reportData = [
        { id: 'PR001', name: 'Office Laptops Purchase', type: 'Budget allocation', value: '₹12,00,000', date: '2026-07-10' },
        { id: 'PR002', name: 'Warehouse Raw Cardboards', type: 'Budget allocation', value: '₹4,50,000', date: '2026-07-12' },
        { id: 'PR003', name: 'Office Chair Replacements', type: 'Budget allocation', value: '₹1,80,000', date: '2026-07-14' }
      ];
    } else if (this.selectedReport === 'Purchase Orders') {
      this.reportData = [
        { id: 'PO101', name: 'ABC Pvt Ltd', type: 'Completed order', value: '₹52,000', date: '2026-07-15' },
        { id: 'PO102', name: 'XYZ Suppliers', type: 'Pending order', value: '₹18,000', date: '2026-07-15' },
        { id: 'PO103', name: 'Tech India', type: 'Completed order', value: '₹31,000', date: '2026-07-14' }
      ];
    } else if (this.selectedReport === 'Compliance') {
      this.reportData = [
        { id: 'CMP001', name: 'GST Invoice Verification', type: 'Audit pass', value: '100% compliant', date: '2026-07-15' },
        { id: 'CMP002', name: 'ISO 9001 Quality Certificate', type: 'Audit pass', value: '100% compliant', date: '2026-07-14' },
        { id: 'CMP005', name: 'Anti-Bribery Statement', type: 'Audit fail', value: '0% compliant', date: '2026-07-10' }
      ];
    } else {
      this.reportData = [
        { id: 'CON-2026-01', name: 'ABC Pvt Ltd', type: 'Active contract', value: '1 Year Term', date: '2026-01-01' },
        { id: 'CON-2026-02', name: 'Tech India', type: 'Expiring Soon', value: '6 Month Term', date: '2026-02-15' },
        { id: 'CON-2025-09', name: 'XYZ Suppliers', type: 'Expired contract', value: '6 Month Term', date: '2025-09-01' }
      ];
    }
  }

  exportToExcel() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Name,Type,Value,Date\n";
    this.reportData.forEach(row => {
      csvContent += `${row.id},"${row.name.replace(/"/g, '""')}",${row.type},"${row.value.replace(/"/g, '""')}",${row.date}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VRP_Report_${this.selectedReport.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('Excel (CSV) report downloaded successfully!');
  }

  exportToPDF() {
    window.print();
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }
}
