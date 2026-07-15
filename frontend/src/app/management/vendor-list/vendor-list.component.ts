import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  templateUrl: './vendor-list.component.html',
  styleUrl: './vendor-list.component.scss'
})
export class VendorListComponent {
  constructor(public sidebarService: SidebarService, private router: Router) {}

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }
  loadVendors() {
    alert('Vendor list refreshed!');
  }

  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  currentPage = 1;
  totalVendors = 248;
  pageSize = 10;
  totalPages = Math.ceil(248 / 10);

  vendors = [
    { id: 'V001', name: 'ABC Pvt Ltd',    category: 'Raw Material', contact: 'Rahul Sharma', email: 'abc@mail',  status: 'Active',  approval: 'Approved' },
    { id: 'V002', name: 'XYZ Suppliers',  category: 'Logistics',    contact: 'Arjun Kumar',  email: 'xyz@mail',  status: 'Pending', approval: 'Pending'  },
    { id: 'V003', name: 'Tech India',      category: 'IT Vendor',    contact: 'Priya Singh',  email: 'tech@mail', status: 'Active',  approval: 'Approved' },
  ];

  get pages(): number[] {
    return Array.from({ length: Math.min(4, this.totalPages) }, (_, i) => i + 1);
  }

  goToPage(p: number) { this.currentPage = p; }
  prev() { if (this.currentPage > 1) this.currentPage--; }
  next() { if (this.currentPage < this.totalPages) this.currentPage++; }
}
