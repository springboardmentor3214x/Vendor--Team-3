import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

interface ComplianceCheck {
  id: string;
  name: string;
  category: string;
  status: 'Passed' | 'Failed' | 'Under Review';
  lastChecked: string;
}

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './compliance.component.html',
  styleUrl: './compliance.component.scss'
})
export class ComplianceComponent implements OnInit {
  checks: ComplianceCheck[] = [];
  activeTab = 'compliance';

  constructor(
    public sidebarService: SidebarService, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loadChecks();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.activeTab = params['tab'] || 'compliance';
    });
  }

  loadChecks() {
    const cached = localStorage.getItem('vrp_compliance_checks');
    if (cached) {
      this.checks = JSON.parse(cached);
    } else {
      this.checks = [
        { id: 'CMP001', name: 'GST Invoice Verification', category: 'Finance', status: 'Passed', lastChecked: '2026-07-15' },
        { id: 'CMP002', name: 'ISO 9001 Quality Certificate', category: 'Quality Control', status: 'Passed', lastChecked: '2026-07-14' },
        { id: 'CMP003', name: 'Vendor NDA Signed Copy', category: 'Legal', status: 'Under Review', lastChecked: '2026-07-15' },
        { id: 'CMP004', name: 'Pan Card Verification', category: 'Identity', status: 'Passed', lastChecked: '2026-07-15' },
        { id: 'CMP005', name: 'Anti-Bribery Compliance Statement', category: 'Legal', status: 'Failed', lastChecked: '2026-07-10' }
      ];
      this.saveChecks();
    }
  }

  saveChecks() {
    localStorage.setItem('vrp_compliance_checks', JSON.stringify(this.checks));
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  toggleCheck(check: ComplianceCheck, newStatus: 'Passed' | 'Failed' | 'Under Review') {
    check.status = newStatus;
    check.lastChecked = new Date().toISOString().split('T')[0];
    this.saveChecks();
    alert(`Compliance check ${check.id} updated to ${newStatus}!`);
  }
}
