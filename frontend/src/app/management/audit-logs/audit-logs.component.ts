import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';

interface AuditLog {
  log_id: number;
  user_id: number;
  action_performed: string;
  module_name: string;
  related_business_record: string;
  ip_address: string;
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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.http.get<AuditLog[]>('environment.apiUrl/activity-logs/').subscribe({
      next: (data) => {
        this.logs = data.map(log => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        this.totalAudits = this.logs.length;
        this.flaggedTransactions = this.logs.filter(l => l.action_performed && (l.action_performed.includes('Flagged') || l.action_performed.includes('Rejected'))).length;
        this.highRiskVendors = 0;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error fetching audit logs', err);
      }
    });
  }

  applyFilters() {
    this.filteredLogs = this.logs.filter(log => {
      const matchUser = log.user_id?.toString().includes(this.filterUser) ?? true;
      const matchAction = log.action_performed?.toLowerCase().includes(this.filterAction.toLowerCase()) ?? true;
      const matchEntity = log.module_name?.toLowerCase().includes(this.filterEntity.toLowerCase()) ?? true;
      const matchDate = this.filterDate ? log.timestamp.toISOString().split('T')[0] === this.filterDate : true;
      
      return matchUser && matchAction && matchEntity && matchDate;
    });
  }
}
