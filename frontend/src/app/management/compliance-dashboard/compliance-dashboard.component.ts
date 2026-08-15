import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-compliance-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './compliance-dashboard.component.html',
  styleUrls: ['./compliance-dashboard.component.scss']
})
export class ComplianceDashboardComponent implements OnInit {
  records: any[] = [];
  nonCompliantCount: number = 0;
  showAddForm = false;
  
  newRecord = {
    vendor_id: null,
    requirement_type: '',
    status: 'Pending Verification',
    notes: ''
  };

  constructor(
    public sidebarService: SidebarService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords() {
    if (this.sidebarService.getCurrentRole() === 'vendor') {
      // Demo logic, normally pull own ID
      this.apiService.getVendorCompliance(1).subscribe({
        next: (data) => {
          this.records = data;
          this.calculateStats();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.apiService.getComplianceRecords().subscribe({
        next: (data) => {
          this.records = data;
          this.calculateStats();
        },
        error: (err) => console.error(err)
      });
    }
  }

  calculateStats() {
    this.nonCompliantCount = this.records.filter(r => r.status === 'Non-Compliant').length;
  }

  submitRecord() {
    if (!this.newRecord.vendor_id || !this.newRecord.requirement_type) {
      alert("Vendor ID and Requirement Type are required.");
      return;
    }
    
    this.apiService.addComplianceRecord(this.newRecord).subscribe({
      next: () => {
        this.loadRecords();
        this.showAddForm = false;
        this.newRecord.requirement_type = '';
        this.newRecord.notes = '';
      },
      error: (err) => {
        console.error(err);
        alert('Failed to add record.');
      }
    });
  }

  updateStatus(id: number, status: string) {
    this.apiService.updateComplianceRecord(id, { status }).subscribe({
      next: () => {
        this.loadRecords();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to update record.');
      }
    });
  }
}
