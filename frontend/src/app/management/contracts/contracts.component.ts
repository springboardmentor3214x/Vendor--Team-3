import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './contracts.component.html',
  styleUrl: './contracts.component.scss'
})
export class ContractsComponent implements OnInit {
  contracts: any[] = [];
  vendors: any[] = [];
  procurements: any[] = [];

  // Form Fields
  selectedVendorId: number | null = null;
  selectedProcurementId: number | null = null;
  contractTitle = '';
  contractNumber = '';
  startDate = '';
  endDate = '';
  contractValue = 0;
  status = 'Active';

  constructor(
    public sidebarService: SidebarService, 
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadContracts();
    this.loadVendors();
    this.loadProcurements();
  }

  loadContracts() {
    this.apiService.getContracts().subscribe({
      next: (data) => {
        this.contracts = data;
      },
      error: (err) => {
        console.error('Failed to load contracts', err);
      }
    });
  }

  loadVendors() {
    this.apiService.getVendors().subscribe({
      next: (data) => {
        this.vendors = data;
      },
      error: (err) => {
        console.error('Failed to load vendors', err);
      }
    });
  }

  loadProcurements() {
    this.apiService.getProcurements().subscribe({
      next: (data) => {
        this.procurements = data;
      },
      error: (err) => {
        console.error('Failed to load procurements', err);
      }
    });
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  createContract() {
    if (!this.selectedVendorId || !this.selectedProcurementId) {
      alert('Please choose a vendor and procurement request!');
      return;
    }

    const payload = {
      vendor_id: this.selectedVendorId,
      procurement_id: this.selectedProcurementId,
      contract_title: this.contractTitle,
      contract_number: this.contractNumber,
      start_date: this.startDate,
      end_date: this.endDate,
      contract_value: this.contractValue,
      status: this.status
    };

    this.apiService.createContract(payload).subscribe({
      next: (data) => {
        alert('Contract established successfully!');
        this.loadContracts();
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to create contract', err);
        alert('Error creating contract');
      }
    });
  }

  resetForm() {
    this.selectedVendorId = null;
    this.selectedProcurementId = null;
    this.contractTitle = '';
    this.contractNumber = '';
    this.startDate = '';
    this.endDate = '';
    this.contractValue = 0;
    this.status = 'Active';
  }
}
