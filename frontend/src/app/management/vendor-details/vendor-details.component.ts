import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { PerformanceService } from '../performance.service';

@Component({
  selector: 'app-vendor-details',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  templateUrl: './vendor-details.component.html',
  styleUrl: './vendor-details.component.scss'
})
export class VendorDetailsComponent implements OnInit {
  vendor: any = null;
  isLoading = true;

  constructor(
    public sidebarService: SidebarService, 
    private performanceService: PerformanceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = Number(params['id']);
      if (id) {
        this.loadVendor(id);
      } else {
        this.isLoading = false;
      }
    });
  }

  loadVendor(id: number) {
    this.isLoading = true;
    this.performanceService.getVendorDetails(id).subscribe({
      next: (data) => {
        this.vendor = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching vendor details', err);
        this.isLoading = false;
      }
    });
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }
}
