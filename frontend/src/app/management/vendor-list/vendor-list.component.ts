import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../performance.service';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  templateUrl: './vendor-list.component.html',
  styleUrl: './vendor-list.component.scss'
})
export class VendorListComponent implements OnInit {
  isLoading = true;
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  currentPage = 1;
  totalVendors = 0;
  pageSize = 10;
  totalPages = 1;
  vendors: any[] = [];

  constructor(
    public sidebarService: SidebarService, 
    private performanceService: PerformanceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadVendors();
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  loadVendors() {
    this.isLoading = true;
    this.performanceService.getVendors().subscribe({
      next: (data) => {
        this.vendors = data.map(v => ({
          id: v.vendor_id,
          name: v.company_name,
          category: v.vendor_category,
          contact: v.contact_person,
          email: v.email,
          phone: v.phone,
          status: v.vendor_status,
          approval: v.approval_status
        }));
        this.totalVendors = this.vendors.length;
        this.totalPages = Math.ceil(this.totalVendors / this.pageSize);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching vendors', err);
        this.isLoading = false;
      }
    });
  }

  get filteredVendors() {
    return this.vendors.filter(v => {
      const matchSearch = !this.searchTerm || 
        (v.name && v.name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (v.email && v.email.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (v.contact && v.contact.toLowerCase().includes(this.searchTerm.toLowerCase()));
        
      const matchCategory = !this.selectedCategory || v.category === this.selectedCategory;
      const matchStatus = !this.selectedStatus || v.status === this.selectedStatus;
      
      return matchSearch && matchCategory && matchStatus;
    });
  }

  get pages(): number[] {
    return Array.from({ length: Math.min(4, this.totalPages) }, (_, i) => i + 1);
  }

  goToPage(p: number) { this.currentPage = p; }
  prev() { if (this.currentPage > 1) this.currentPage--; }
  next() { if (this.currentPage < this.totalPages) this.currentPage++; }
}
