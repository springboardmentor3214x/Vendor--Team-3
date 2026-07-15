import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

interface ProcurementRequest {
  id: string;
  title: string;
  department: string;
  requestedBy: string;
  itemName: string;
  itemCategory: string;
  quantity: number;
  unit: string;
  budget: number;
  deliveryDate: string;
  priority: string;
  justification: string;
  remarks: string;
  status: string;
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
  
  // Form Fields
  requestNumber = 'PR004';
  newTitle = '';
  newDepartment = 'IT';
  requestedBy = 'Procurement Manager';
  itemName = '';
  itemCategory = 'Raw Material';
  quantity = 100;
  unit = 'Pieces';
  newBudget = 0;
  deliveryDate = '';
  priority = 'Medium';
  justification = '';
  remarks = '';

  constructor(public sidebarService: SidebarService, private router: Router) {
    this.loadRequests();
  }

  loadRequests() {
    const cached = localStorage.getItem('vrp_procurement_requests_full');
    if (cached) {
      this.requests = JSON.parse(cached);
    } else {
      this.requests = [
        { 
          id: 'PR001', 
          title: 'Office Laptops Purchase', 
          department: 'IT', 
          requestedBy: 'Maria Smith',
          itemName: 'Developer Laptops',
          itemCategory: 'Equipment',
          quantity: 15,
          unit: 'Pieces',
          budget: 1200000, 
          deliveryDate: '2026-07-30', 
          priority: 'High',
          justification: 'Replacement for old developer systems.',
          remarks: 'Ensure quick warranty terms.',
          status: 'Approved' 
        },
        { 
          id: 'PR002', 
          title: 'Warehouse Cardboards', 
          department: 'Logistics', 
          requestedBy: 'John Doe',
          itemName: 'Cardboard Boxes',
          itemCategory: 'Packaging',
          quantity: 1000,
          unit: 'Box',
          budget: 450000, 
          deliveryDate: '2026-07-25', 
          priority: 'Medium',
          justification: 'Monthly inventory boxes.',
          remarks: 'None.',
          status: 'Pending' 
        }
      ];
      this.saveRequests();
    }
    this.requestNumber = 'PR' + String(this.requests.length + 1).padStart(3, '0');
  }

  saveRequests() {
    localStorage.setItem('vrp_procurement_requests_full', JSON.stringify(this.requests));
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
    const newReq: ProcurementRequest = {
      id: this.requestNumber,
      title: this.newTitle,
      department: this.newDepartment,
      requestedBy: this.requestedBy,
      itemName: this.itemName,
      itemCategory: this.itemCategory,
      quantity: this.quantity,
      unit: this.unit,
      budget: this.newBudget,
      deliveryDate: this.deliveryDate || new Date().toISOString().split('T')[0],
      priority: this.priority,
      justification: this.justification,
      remarks: this.remarks,
      status: 'Pending'
    };
    this.requests.push(newReq);
    this.saveRequests();

    // Clear
    this.newTitle = '';
    this.newBudget = 0;
    this.itemName = '';
    this.justification = '';
    this.remarks = '';
    
    this.requestNumber = 'PR' + String(this.requests.length + 1).padStart(3, '0');
    alert('Procurement request created successfully!');
  }
}
