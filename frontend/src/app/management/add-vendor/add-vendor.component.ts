import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../performance.service';
import { HttpClient } from '@angular/common/http';

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
  private apiUrl = 'http://localhost:8000';

  vendorForm = {
    companyName: '',
    vendorCategory: '',
    contactPerson: '',
    designation: '',
    email: '',
    phone: '',
    alternatePhone: '',
    password: '',
    confirmPassword: '',
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
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    public sidebarService: SidebarService,
    private performanceService: PerformanceService,
    private router: Router,
    private http: HttpClient
  ) {}

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  onSaveVendor() {
    this.errorMessage = '';
    if (!this.vendorForm.companyName || !this.vendorForm.vendorCategory || !this.vendorForm.contactPerson || !this.vendorForm.email) {
      this.errorMessage = 'Please fill out all required fields marked with *';
      return;
    }
    if (!this.vendorForm.password) {
      this.errorMessage = 'Please enter a login password for this vendor.';
      return;
    }
    if (this.vendorForm.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }
    if (this.vendorForm.password !== this.vendorForm.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
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
        // After vendor record is created, register user account so vendor can log in
        const userPayload = {
          full_name: this.vendorForm.contactPerson,
          email: this.vendorForm.email,
          password: this.vendorForm.password,
          phone: this.vendorForm.phone || '',
          role_id: 4 // Vendor role
        };
        this.http.post(`${this.apiUrl}/register`, userPayload).subscribe({
          next: () => {
            // Cache vendor profile so login role detection works
            localStorage.setItem(`profile_${this.vendorForm.email}`, JSON.stringify({
              fullName: this.vendorForm.contactPerson,
              email: this.vendorForm.email,
              mobile: this.vendorForm.phone || '',
              role: 'Vendor',
              companyName: this.vendorForm.companyName,
              employeeId: ''
            }));
            alert(`✅ Vendor "${this.vendorForm.companyName}" registered successfully!\n\nVendor login credentials:\nEmail: ${this.vendorForm.email}\nPassword: ${this.vendorForm.password}`);
            this.router.navigate(['/vendors']);
          },
          error: (err) => {
            // Vendor record created but user account failed (possibly already exists)
            console.warn('User account creation failed (may already exist):', err);
            alert(`✅ Vendor registered! Note: User account may already exist for ${this.vendorForm.email}.`);
            this.router.navigate(['/vendors']);
          }
        });
      },
      error: (err) => {
        console.error('Error saving vendor', err);
        this.errorMessage = err.error?.detail || 'Failed to save vendor to database.';
      }
    });
  }
}
