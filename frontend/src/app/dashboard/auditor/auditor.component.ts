import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../../management/performance.service';

@Component({
  selector: 'app-auditor',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  templateUrl: './auditor.component.html',
  styleUrl: './auditor.component.scss'
})
export class AuditorComponent implements OnInit {
  totalAudits = 0;
  complianceScore = 0;
  openIssues = 0;
  riskLevel = 'Medium';

  passedAudits = 0;
  failedAudits = 0;

  highRiskCount = 0;
  mediumRiskCount = 0;
  lowRiskCount = 0;

  auditLogs: any[] = [];

  constructor(
    public sidebarService: SidebarService,
    private performanceService: PerformanceService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // 1. Fetch Reliability Stats
    this.performanceService.getReliabilityDashboard().subscribe({
      next: (data) => {
        this.complianceScore = Math.round(data.avg_reliability_score || 0);
        this.highRiskCount = data.high_risk_count || 0;
        this.lowRiskCount = data.high_reliability_count || 0;
        this.mediumRiskCount = Math.max(0, data.total_evaluated - this.highRiskCount - this.lowRiskCount);

        // Determine risk level based on average compliance score
        if (this.complianceScore >= 85) this.riskLevel = 'Low';
        else if (this.complianceScore >= 70) this.riskLevel = 'Medium';
        else this.riskLevel = 'High';

        // Map passed vs failed audits
        this.failedAudits = this.highRiskCount;
      },
      error: (err) => console.error('Error loading auditor reliability', err)
    });

    // 2. Fetch Vendors and POs to count total audits
    this.performanceService.getVendors().subscribe({
      next: (vendors) => {
        this.performanceService.getPurchaseOrders().subscribe({
          next: (pos) => {
            this.totalAudits = vendors.length + pos.length;
            this.openIssues = vendors.filter(v => v.approval_status === 'Pending').length;
            this.passedAudits = this.totalAudits - this.failedAudits - this.openIssues;

            // Compile dynamic timeline logs
            const logs: any[] = [];
            
            // Map recent vendors
            vendors.slice(0, 2).forEach((v, index) => {
              logs.push({
                title: v.approval_status === 'Approved' ? 'Vendor Approved Successfully' : 'Vendor Registration Pending',
                desc: `${v.approval_status === 'Approved' ? 'Admin approved' : 'New registration submitted for'} **${v.company_name}**. GST: ${v.gst_number || 'None'}.`,
                date: index === 0 ? 'Today, 10:42 AM' : 'Yesterday, 02:15 PM',
                module: 'Vendor Onboarding',
                class: v.approval_status === 'Approved' ? 'green' : 'blue'
              });
            });

            // Map recent POs
            pos.slice(0, 2).forEach((po, index) => {
              logs.push({
                title: po.status === 'Completed' ? 'Payment Released' : 'Purchase Order Released',
                desc: `Finance processed transaction on order PO${po.order_id} for **₹${po.total_amount.toLocaleString()}**. Status: ${po.status}.`,
                date: index === 0 ? 'Today, 09:15 AM' : 'Yesterday, 04:30 PM',
                module: 'Finance Ledger',
                class: po.status === 'Completed' ? 'green' : 'yellow'
              });
            });

            this.auditLogs = logs.slice(0, 3);
          }
        });
      },
      error: (err) => console.error('Error loading auditor logs', err)
    });
  }
}
