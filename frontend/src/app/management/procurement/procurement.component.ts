import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

interface ProcurementRequest {
  id: string;
  title: string;
  description: string;
  department: string;
  budget: number;
  date: string;
  status: string;
  assignedVendor?: string;
}

@Component({
  selector: 'app-procurement',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './procurement.component.html',
  styleUrl: './procurement.component.scss'
})
export class ProcurementComponent {
  requests: ProcurementRequest[] = [];
  vendors = ['ABC Pvt Ltd', 'XYZ Suppliers', 'Tech India', 'Delta Traders', 'Omega Industries'];

  // Form Fields
  newTitle = '';
  newDescription = '';
  newDepartment = 'IT';
  newBudget = 0;
  assignedVendor = '';

  constructor(public sidebarService: SidebarService, private router: Router) {
    this.loadRequests();
  }

  loadRequests() {
    const cached = localStorage.getItem('vrp_procurement_requests');
    if (cached) {
      this.requests = JSON.parse(cached);
    } else {
      this.requests = [
        { id: 'PR001', title: 'Office Laptops Purchase', description: 'Procurement of 15 developer-grade laptops', department: 'IT', budget: 1200000, date: '2026-07-10', status: 'Approved', assignedVendor: 'Tech India' },
        { id: 'PR002', title: 'Warehouse Raw Cardboards', description: 'Logistics packaging supply materials', department: 'Logistics', budget: 450000, date: '2026-07-12', status: 'Pending', assignedVendor: 'ABC Pvt Ltd' },
        { id: 'PR003', title: 'Office Chair Replacements', description: 'Ergonomic seating for HR department', department: 'HR', budget: 180000, date: '2026-07-14', status: 'Pending' }
      ];
      this.saveRequests();
    }
  }

  saveRequests() {
    localStorage.setItem('vrp_procurement_requests', JSON.stringify(this.requests));
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  addRequest() {
    if (!this.newTitle || this.newBudget <= 0) {
      alert('Title and budget are required!');
      return;
    }
    const newId = 'PR' + String(this.requests.length + 1).padStart(3, '0');
    const newReq: ProcurementRequest = {
      id: newId,
      title: this.newTitle,
      description: this.newDescription,
      department: this.newDepartment,
      budget: this.newBudget,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      assignedVendor: this.assignedVendor || undefined
    };
    this.requests.push(newReq);
    this.saveRequests();

    // Clear
    this.newTitle = '';
    this.newDescription = '';
    this.newDepartment = 'IT';
    this.newBudget = 0;
    this.assignedVendor = '';
    alert('Procurement request created successfully!');
  }

  updateStatus(req: ProcurementRequest, status: string) {
    req.status = status;
    this.saveRequests();
    alert(`Request ${req.id} status updated to ${status}!`);
  }

  assignVendorToRequest(req: ProcurementRequest, vendor: string) {
    req.assignedVendor = vendor;
    this.saveRequests();
    alert(`Assigned ${vendor} to request ${req.id}!`);
  }
}
