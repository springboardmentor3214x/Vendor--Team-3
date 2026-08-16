import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { SidebarService } from '../layout/sidebar.service';
import { AuthService } from '../auth/auth.service';
import { PerformanceService } from '../management/performance.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  // Basic profile
  fullName = '';
  email = '';
  mobile = '';
  role = '';
  employeeId = '';
  companyName = '';

  // Vendor-specific business details
  isVendor = false;
  vendorId: number | null = null;
  gstNumber = '';
  panNumber = '';
  bankAccount = '';
  ifscCode = '';
  addressLine1 = '';
  city = '';
  state = '';
  country = '';
  pincode = '';
  website = '';
  vendorStatus = '';

  // Change password
  showPasswordForm = false;
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  passwordMessage = '';
  passwordError = '';
  showCurrentPwd = false;
  showNewPwd = false;
  showConfirmPwd = false;

  // UI state
  successMessage = '';
  errorMessage = '';

  private apiUrl = environment.apiUrl;

  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private authService: AuthService,
    private performanceService: PerformanceService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.email = localStorage.getItem('userEmail') || '';
    this.isVendor = this.sidebarService.getCurrentRole() === 'vendor';

    this.authService.getProfile(this.email).subscribe({
      next: (profile) => {
        this.fullName = profile.fullName;
        this.mobile = profile.mobile;
        this.role = profile.role;
        this.employeeId = profile.employeeId;
        this.companyName = profile.companyName;

        // If vendor, also load vendor business details from backend
        if (this.isVendor) {
          this.loadVendorDetails();
        }
      }
    });
  }

  loadVendorDetails() {
    this.performanceService.getVendors().subscribe({
      next: (vendors) => {
        const myVendor = vendors.find((v: any) =>
          v.email && v.email.toLowerCase() === this.email.toLowerCase()
        );
        if (myVendor) {
          this.vendorId = myVendor.vendor_id;
          this.companyName = myVendor.company_name || this.companyName;
          this.gstNumber = myVendor.gst_number || '';
          this.panNumber = myVendor.pan_number || '';
          this.bankAccount = myVendor.bank_account_number || '';
          this.ifscCode = myVendor.ifsc_code || '';
          this.addressLine1 = myVendor.address_line1 || '';
          this.city = myVendor.city || '';
          this.state = myVendor.state || '';
          this.country = myVendor.country || '';
          this.pincode = myVendor.pincode || '';
          this.website = myVendor.website || '';
          this.vendorStatus = myVendor.vendor_status || '';
        }
      },
      error: (err) => console.error('Error loading vendor details', err)
    });
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  onSave() {
    this.successMessage = '';
    this.errorMessage = '';
    const profile = {
      fullName: this.fullName,
      email: this.email,
      mobile: this.mobile,
      role: this.role,
      employeeId: this.employeeId,
      companyName: this.companyName
    };
    this.authService.updateProfile(this.email, profile).subscribe({
      next: () => {
        // If vendor, also update vendor business record
        if (this.isVendor && this.vendorId) {
          const vendorPayload = {
            gst_number: this.gstNumber,
            pan_number: this.panNumber,
            bank_account_number: this.bankAccount,
            ifsc_code: this.ifscCode,
            address_line1: this.addressLine1,
            city: this.city,
            state: this.state,
            country: this.country,
            pincode: this.pincode,
            website: this.website
          };
          this.http.put(`${this.apiUrl}/vendors/${this.vendorId}`, vendorPayload).subscribe({
            next: () => { this.successMessage = '✅ Profile and business details updated successfully!'; },
            error: () => { this.successMessage = '✅ Personal profile saved. Business details update failed (endpoint may not exist yet).'; }
          });
        } else {
          this.successMessage = '✅ Profile updated successfully!';
        }
      },
      error: () => { this.errorMessage = '❌ Failed to save profile.'; }
    });
  }

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.passwordMessage = '';
    this.passwordError = '';
  }

  onChangePassword() {
    this.passwordMessage = '';
    this.passwordError = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      this.passwordError = 'Please fill in all password fields.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError = 'New password must be at least 6 characters.';
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordError = 'New passwords do not match.';
      return;
    }

    // Call backend reset-password endpoint
    this.http.post(`${this.apiUrl}/reset-password`, {
      email: this.email,
      new_password: this.newPassword
    }).subscribe({
      next: () => {
        this.passwordMessage = '✅ Password changed successfully!';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
        setTimeout(() => { this.showPasswordForm = false; this.passwordMessage = ''; }, 2500);
      },
      error: (err) => {
        this.passwordError = err?.error?.detail || '❌ Failed to change password. Please try again.';
      }
    });
  }
}
