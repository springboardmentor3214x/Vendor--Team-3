import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AuditLog {
  id: number;
  user: string;
  action: string;
  entity: string;
  oldValue: string;
  newValue: string;
  timestamp: Date;
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss']
})
export class AuditLogsComponent implements OnInit {
  logs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  
  // Dashboard Metrics
  totalAudits = 0;
  flaggedTransactions = 0;
  highRiskVendors = 0;

  // Filters
  filterUser = '';
  filterAction = '';
  filterEntity = '';
  filterDate = '';

  ngOnInit() {
    this.mockData();
    this.applyFilters();
  }

  mockData() {
    this.logs = [
      { id: 1, user: 'Admin User', action: 'Created', entity: 'Vendor', oldValue: '-', newValue: 'Vendor A', timestamp: new Date('2026-07-20T10:00:00') },
      { id: 2, user: 'Manager 1', action: 'Approved', entity: 'PO', oldValue: 'Pending', newValue: 'Approved', timestamp: new Date('2026-07-21T11:30:00') },
      { id: 3, user: 'Auditor 1', action: 'Rejected', entity: 'Invoice', oldValue: 'Submitted', newValue: 'Rejected', timestamp: new Date('2026-07-22T14:15:00') },
      { id: 4, user: 'System', action: 'Flagged', entity: 'Transaction', oldValue: 'Normal', newValue: 'High Risk', timestamp: new Date('2026-07-23T09:45:00') },
      { id: 5, user: 'Admin User', action: 'Updated', entity: 'Vendor', oldValue: 'Status: Active', newValue: 'Status: Suspended', timestamp: new Date('2026-07-24T16:20:00') }
    ];
    
    this.totalAudits = this.logs.length;
    this.flaggedTransactions = this.logs.filter(l => l.action === 'Flagged' || l.action === 'Rejected').length;
    this.highRiskVendors = 2; // mock value
  }

  applyFilters() {
    this.filteredLogs = this.logs.filter(log => {
      const matchUser = log.user.toLowerCase().includes(this.filterUser.toLowerCase());
      const matchAction = log.action.toLowerCase().includes(this.filterAction.toLowerCase());
      const matchEntity = log.entity.toLowerCase().includes(this.filterEntity.toLowerCase());
      const matchDate = this.filterDate ? log.timestamp.toISOString().split('T')[0] === this.filterDate : true;
      
      return matchUser && matchAction && matchEntity && matchDate;
    });
  }
}
