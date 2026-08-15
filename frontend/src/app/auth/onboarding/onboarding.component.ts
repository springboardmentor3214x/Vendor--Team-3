import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SidebarService } from '../../layout/sidebar.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss'
})
export class OnboardingComponent implements OnInit {
  
  companyName = '';
  vendorCategory = 'Raw Material';
  contactPerson = '';
  gstNumber = '';
  panNumber = '';
  addressLine1 = '';
  
  gstFile: File | null = null;
  panFile: File | null = null;
  addressFile: File | null = null;
  
  errorMessage = '';
  successMessage = '';
  submitting = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private sidebarService: SidebarService
  ) {}

  ngOnInit() {
    // Optionally pre-fill company name if stored during registration
  }

  onFileSelected(event: any, docType: string) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (docType === 'gst') this.gstFile = file;
      if (docType === 'pan') this.panFile = file;
      if (docType === 'address') this.addressFile = file;
    }
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.companyName || !this.contactPerson || !this.gstNumber || !this.panNumber || !this.addressLine1) {
      this.errorMessage = 'Please fill out all mandatory fields.';
      return;
    }

    if (!this.gstFile || !this.panFile || !this.addressFile) {
      this.errorMessage = 'Please upload all mandatory documents (GST, PAN, Address Proof).';
      return;
    }

    const formData = new FormData();
    formData.append('company_name', this.companyName);
    formData.append('vendor_category', this.vendorCategory);
    formData.append('contact_person', this.contactPerson);
    formData.append('gst_number', this.gstNumber);
    formData.append('pan_number', this.panNumber);
    formData.append('address_line1', this.addressLine1);
    
    formData.append('gst_file', this.gstFile);
    formData.append('pan_file', this.panFile);
    formData.append('address_file', this.addressFile);

    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.submitting = true;
    this.http.post('http://localhost:8000/vendors/onboarding', formData, { headers }).subscribe({
      next: (res: any) => {
        this.successMessage = 'Onboarding complete! Redirecting to dashboard...';
        localStorage.setItem('isOnboarded', 'true');
        setTimeout(() => {
          this.router.navigate([this.sidebarService.getDashboardRoute()]);
        }, 1500);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.detail || 'Onboarding failed. Please try again.';
      }
    });
  }
}
