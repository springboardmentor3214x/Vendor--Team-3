import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { ApiService } from '../../services/api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  viewingContract: any = null;
  viewingDocUrl: SafeResourceUrl | null = null;
  isLoadingDoc = false;

  renewalData = {
    new_end_date: '',
    new_value: 0
  };

  // Form Fields
  selectedVendorId: number | null = null;
  selectedProcurementId: number | null = null;
  contractTitle = '';
  contractNumber = '';
  startDate = '';
  endDate = '';
  contractValue = 0;
  status = 'Active';
  scopeOfWork = '';
  paymentTerms = '';

  constructor(
    public sidebarService: SidebarService, 
    private router: Router,
    private apiService: ApiService,
    private sanitizer: DomSanitizer
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
      status: this.status,
      scope_of_work: this.scopeOfWork,
      payment_terms: this.paymentTerms
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

  viewDocument(contract: any) {
    this.viewingContract = contract;
    this.viewingDocUrl = null;
    if (contract.document_path) {
      this.isLoadingDoc = true;
      this.apiService.downloadContractDocument(contract.contract_id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          this.viewingDocUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.isLoadingDoc = false;
        },
        error: (err) => {
          console.error('Failed to load document', err);
          this.isLoadingDoc = false;
          alert('Could not load document.');
        }
      });
    }
  }

  renewContract() {
    if (!this.viewingContract || !this.renewalData.new_end_date) {
      alert("Please provide a new end date.");
      return;
    }
    
    const payload = {
      contract_id: this.viewingContract.contract_id,
      renewal_date: new Date().toISOString().split('T')[0],
      new_end_date: this.renewalData.new_end_date,
      new_value: this.renewalData.new_value || this.viewingContract.contract_value,
      notes: "Renewed via dashboard"
    };

    this.apiService.renewContract(this.viewingContract.contract_id, payload).subscribe({
      next: () => {
        alert("Contract renewed successfully!");
        this.loadContracts();
        this.closeViewer();
      },
      error: (err) => {
        console.error("Failed to renew", err);
        alert("Failed to renew contract.");
      }
    });
  }

  closeViewer() {
    this.viewingContract = null;
    this.viewingDocUrl = null;
    this.renewalData = { new_end_date: '', new_value: 0 };
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
    this.scopeOfWork = '';
    this.paymentTerms = '';
  }
}
