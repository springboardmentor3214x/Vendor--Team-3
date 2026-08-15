import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-certifications',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './certifications.component.html',
  styleUrls: ['./certifications.component.scss']
})
export class CertificationsComponent implements OnInit {
  certifications: any[] = [];
  vendors: any[] = [];
  
  newCert = {
    vendor_id: null,
    name: '',
    cert_number: '',
    issuing_authority: '',
    issue_date: '',
    expiry_date: ''
  };
  
  selectedFile: File | null = null;

  constructor(
    public sidebarService: SidebarService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadCertifications();
    if (this.sidebarService.getCurrentRole() !== 'vendor') {
      this.loadVendors();
    } else {
      // Vendor logic: fetch own vendor ID somehow, skipping for demo
    }
  }

  loadCertifications() {
    if (this.sidebarService.getCurrentRole() === 'vendor') {
      // Hardcoded vendor ID for vendor role demo, normally get from profile
      this.apiService.getVendorCertifications(1).subscribe({
        next: (data) => this.certifications = data,
        error: (err) => console.error(err)
      });
    } else {
      this.apiService.getCertifications().subscribe({
        next: (data) => this.certifications = data,
        error: (err) => console.error(err)
      });
    }
  }

  loadVendors() {
    this.apiService.getVendors().subscribe({
      next: (data) => this.vendors = data,
      error: (err) => console.error(err)
    });
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  submitCertification() {
    if (!this.newCert.name || !this.newCert.cert_number || !this.newCert.vendor_id) {
      alert('Please fill out all required fields.');
      return;
    }
    
    this.apiService.addCertification(this.newCert).subscribe({
      next: (res: any) => {
        if (this.selectedFile) {
          this.apiService.uploadCertificateDocument(res.certification_id, this.selectedFile).subscribe({
            next: () => {
              alert('Certification and document uploaded!');
              this.loadCertifications();
            },
            error: (err) => {
              console.error(err);
              alert('Certification saved, but document upload failed.');
            }
          });
        } else {
          alert('Certification added!');
          this.loadCertifications();
        }
      },
      error: (err) => {
        console.error(err);
        alert('Failed to add certification.');
      }
    });
  }

  downloadCert(id: number) {
    this.apiService.downloadCertificateDocument(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate_${id}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download failed', err);
        alert('Could not download file.');
      }
    });
  }
}
