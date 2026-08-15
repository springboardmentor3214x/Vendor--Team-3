import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { ApiService } from '../../services/api.service';
import { VendorDocumentService } from '../../services/vendor-document.service';

@Component({
  selector: 'app-vendor-documentation',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './vendor-documentation.component.html',
  styleUrls: ['./vendor-documentation.component.scss']
})
export class VendorDocumentationComponent implements OnInit {
  documents: any[] = [];
  
  uploadVendorId: number | null = null;
  uploadDocType: string = 'GST Certificate';
  selectedFile: File | null = null;
  
  viewVendorId: number | null = null;

  constructor(
    public sidebarService: SidebarService,
    private apiService: ApiService,
    private vendorDocumentService: VendorDocumentService
  ) {}

  ngOnInit(): void {
    if (this.sidebarService.getCurrentRole() === 'vendor') {
      // Normally fetch own ID, mocked to 1
      this.viewVendorId = 1;
      this.uploadVendorId = 1;
      this.loadDocuments();
    }
  }

  loadDocuments() {
    if (!this.viewVendorId) return;
    this.apiService.getVendorDocuments(this.viewVendorId).subscribe({
      next: (data) => this.documents = data,
      error: (err) => console.error(err)
    });
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  uploadDocument() {
    if (!this.uploadVendorId || !this.selectedFile) {
      alert("Vendor ID and File are required.");
      return;
    }
    
    this.apiService.uploadVendorRegistrationDocument(this.uploadVendorId, this.uploadDocType, this.selectedFile).subscribe({
      next: () => {
        alert("Document uploaded successfully.");
        this.selectedFile = null;
        if (this.viewVendorId === this.uploadVendorId) {
          this.loadDocuments();
        }
      },
      error: (err) => {
        console.error(err);
        alert("Failed to upload document.");
      }
    });
  }

  downloadDoc(docId: number, type: string) {
    if (!this.viewVendorId) return;
    this.apiService.downloadVendorRegistrationDocument(this.viewVendorId, type).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type.replace(' ', '_')}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error(err)
    });
  }

  approveDoc(docId: number) {
    this.vendorDocumentService.approveVendorDocument(docId).subscribe({
      next: () => {
        alert('Document Approved');
        this.loadDocuments();
      },
      error: (err) => console.error(err)
    });
  }

  rejectDoc(docId: number) {
    this.vendorDocumentService.rejectVendorDocument(docId).subscribe({
      next: () => {
        alert('Document Rejected');
        this.loadDocuments();
      },
      error: (err) => console.error(err)
    });
  }
}
