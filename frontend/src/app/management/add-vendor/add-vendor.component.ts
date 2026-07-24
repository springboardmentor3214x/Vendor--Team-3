import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../performance.service';

@Component({
  selector: 'app-add-vendor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  templateUrl: './add-vendor.component.html',
  styleUrl: './add-vendor.component.scss'
})
export class AddVendorComponent {
  categories = ['Raw Material', 'IT Services', 'Electronics', 'Logistics', 'Manufacturing'];
  paymentTerms = ['Net 30', 'Net 60', 'Net 90', 'Immediate'];
  statusOptions = ['Active', 'Pending', 'Inactive'];

  vendorForm = {
    companyName: '',
    vendorCategory: '',
    contactPerson: '',
    designation: '',
    email: '',
    phone: '',
    alternatePhone: '',
    gstNumber: '',
    panNumber: '',
    companyRegistrationNumber: '',
    bankAccountNumber: '',
    paymentTerms: 'Net 30',
    ifscCode: '',
    vendorStatus: 'Pending',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    website: '',
    description: ''
  };

  errorMessage = '';

  constructor(
    public sidebarService: SidebarService, 
    private performanceService: PerformanceService,
    private router: Router
  ) {}

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  onSaveVendor() {
    if (!this.vendorForm.companyName || !this.vendorForm.vendorCategory || !this.vendorForm.contactPerson || !this.vendorForm.email) {
      this.errorMessage = 'Please fill out all required fields marked with *';
      return;
    }

    const payload = {
      company_name: this.vendorForm.companyName,
      vendor_category: this.vendorForm.vendorCategory,
      contact_person: this.vendorForm.contactPerson,
      designation: this.vendorForm.designation,
      email: this.vendorForm.email,
      phone: this.vendorForm.phone,
      alternate_phone: this.vendorForm.alternatePhone,
      gst_number: this.vendorForm.gstNumber || null,
      pan_number: this.vendorForm.panNumber || null,
      company_registration_number: this.vendorForm.companyRegistrationNumber || null,
      bank_account_number: this.vendorForm.bankAccountNumber,
      payment_terms: this.vendorForm.paymentTerms,
      ifsc_code: this.vendorForm.ifscCode,
      vendor_status: this.vendorForm.vendorStatus,
      approval_status: 'Pending',
      address_line1: this.vendorForm.addressLine1,
      address_line2: this.vendorForm.addressLine2,
      city: this.vendorForm.city,
      state: this.vendorForm.state,
      country: this.vendorForm.country,
      pincode: this.vendorForm.pincode,
      website: this.vendorForm.website,
      description: this.vendorForm.description
    };

    this.performanceService.addVendor(payload).subscribe({
      next: () => {
        alert('Vendor registered successfully!');
        this.router.navigate(['/vendors']);
      },
      error: (err) => {
        console.error('Error saving vendor', err);
        this.errorMessage = err.error?.detail || 'Failed to save vendor to database.';
      }
    });
  }
}
