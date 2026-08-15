import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { ApiService } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-file-sharing',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './file-sharing.component.html',
  styleUrls: ['./file-sharing.component.scss']
})
export class FileSharingComponent implements OnInit {
  files: any[] = [];
  filteredFiles: any[] = [];
  searchTerm: string = '';
  loading = false;
  
  uploadEntityId: number = 0;
  uploadEntityType: string = 'PurchaseOrder';
  selectedFile: File | null = null;
  uploading = false;

  constructor(
    public sidebarService: SidebarService,
    private apiService: ApiService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles() {
    this.loading = true;
    this.apiService.get('/shared-files/').subscribe({
      next: (res: any[]) => {
        this.files = res;
        this.filteredFiles = res;
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        // Mock fallback for UI demo if backend is not ready
        this.files = [
          { file_id: 1, file_name: 'Quotation_V2.pdf', entity_type: 'PurchaseOrder', entity_id: 102, uploaded_at: new Date() },
          { file_id: 2, file_name: 'Compliance_Cert.png', entity_type: 'Vendor', entity_id: 5, uploaded_at: new Date() }
        ];
        this.filteredFiles = [...this.files];
      }
    });
  }

  filterFiles() {
    if(!this.searchTerm.trim()){
      this.filteredFiles = this.files;
    } else {
      this.filteredFiles = this.files.filter(f => 
        f.file_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        f.entity_type.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  uploadFile() {
    if (!this.selectedFile || !this.uploadEntityId) return;
    this.uploading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('entity_type', this.uploadEntityType);
    formData.append('entity_id', this.uploadEntityId.toString());

    this.http.post(`${this.apiService.baseUrl}/shared-files/upload`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }).subscribe({
      next: (res: any) => {
        this.files.unshift(res.file);
        this.filterFiles();
        this.selectedFile = null;
        this.uploading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.uploading = false;
      }
    });
  }

  downloadFile(fileId: number) {
    window.open(`${this.apiService.baseUrl}/shared-files/download/${fileId}`, '_blank');
  }
}
