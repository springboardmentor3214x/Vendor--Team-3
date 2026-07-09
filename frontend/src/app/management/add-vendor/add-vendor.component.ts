import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';

@Component({
  selector: 'app-add-vendor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  templateUrl: './add-vendor.component.html',
  styleUrl: './add-vendor.component.scss'
})
export class AddVendorComponent {
  constructor(public sidebarService: SidebarService, private router: Router) {}

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }
  categories = ['Raw Material', 'IT Services', 'Electronics', 'Logistics', 'Manufacturing'];
  paymentTerms = ['Net 30', 'Net 60', 'Net 90', 'Immediate'];
  statusOptions = ['Active', 'Pending', 'Inactive'];
}
