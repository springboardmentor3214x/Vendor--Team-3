import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

interface Contract {
  id: string;
  vendorName: string;
  startDate: string;
  endDate: string;
  status: string;
  complianceRating: number;
}

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './contracts.component.html',
  styleUrl: './contracts.component.scss'
})
export class ContractsComponent {
  contracts: Contract[] = [];
  vendors = ['ABC Pvt Ltd', 'XYZ Suppliers', 'Tech India', 'Delta Traders', 'Omega Industries'];

  // Form Fields
  selectedVendor = '';
  durationYears = 1;
  complianceScore = 100;

  constructor(public sidebarService: SidebarService, private router: Router) {
    this.loadContracts();
  }

  loadContracts() {
    const cached = localStorage.getItem('vrp_contracts');
    if (cached) {
      this.contracts = JSON.parse(cached);
    } else {
      this.contracts = [
        { id: 'CON-2026-01', vendorName: 'ABC Pvt Ltd', startDate: '2026-01-01', endDate: '2027-01-01', status: 'Active', complianceRating: 98 },
        { id: 'CON-2026-02', vendorName: 'Tech India', startDate: '2026-02-15', endDate: '2026-08-15', status: 'Expiring Soon', complianceRating: 95 },
        { id: 'CON-2025-09', vendorName: 'XYZ Suppliers', startDate: '2025-09-01', endDate: '2026-03-01', status: 'Expired', complianceRating: 88 }
      ];
      this.saveContracts();
    }
  }

  saveContracts() {
    localStorage.setItem('vrp_contracts', JSON.stringify(this.contracts));
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  createContract() {
    if (!this.selectedVendor) {
      alert('Please choose a vendor!');
      return;
    }
    const newId = 'CON-2026-' + String(this.contracts.length + 10).padStart(2, '0');
    const today = new Date();
    const expiry = new Date();
    expiry.setFullYear(today.getFullYear() + this.durationYears);

    const newCon: Contract = {
      id: newId,
      vendorName: this.selectedVendor,
      startDate: today.toISOString().split('T')[0],
      endDate: expiry.toISOString().split('T')[0],
      status: 'Active',
      complianceRating: this.complianceScore
    };

    this.contracts.push(newCon);
    this.saveContracts();

    // Clear
    this.selectedVendor = '';
    this.durationYears = 1;
    this.complianceScore = 100;
    alert('Contract established successfully!');
  }

  renewContract(con: Contract) {
    const expiryDate = new Date(con.endDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    con.endDate = expiryDate.toISOString().split('T')[0];
    con.status = 'Active';
    this.saveContracts();
    alert(`Contract ${con.id} extended by 1 year!`);
  }

  terminateContract(con: Contract) {
    if (confirm(`Are you sure you want to terminate contract ${con.id}?`)) {
      con.status = 'Terminated';
      this.saveContracts();
    }
  }
}
