import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../layout/sidebar.service';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { ApiService } from '../../services/api.service';

interface Quotation {
  id?: number;
  vendor_id: number;
  vendor_name: string;
  proposed_price: number;
  delivery_time: string;
}

interface Rfq {
  id: number;
  rfq_number: string;
  title: string;
  items: string[];
  deadline: string;
  status: 'Open' | 'Closed';
  quotations: Quotation[];
}

@Component({
  selector: 'app-rfq',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './rfq.component.html',
  styleUrls: ['./rfq.component.scss']
})
export class RfqComponent implements OnInit {
  role: string = '';
  rfqs: Rfq[] = [];

  constructor(public sidebarService: SidebarService, private apiService: ApiService) {}

  ngOnInit() {
    this.role = this.sidebarService.getCurrentRole();
    this.loadRfqs();
  }

  loadRfqs() {
    this.apiService.getRfqs().subscribe({
      next: (data) => {
        this.rfqs = data;
      },
      error: (err) => console.error('Failed to load RFQs', err)
    });
  }

  // Procurement Actions
  newRfq = { title: '', items: '', deadline: '' };
  
  createRfq() {
    if(this.newRfq.title) {
      const payload = {
        title: this.newRfq.title,
        items: this.newRfq.items.split(',').map(s => s.trim()),
        deadline: this.newRfq.deadline
      };
      this.apiService.createRfq(payload).subscribe({
        next: (res) => {
          this.loadRfqs();
          this.newRfq = { title: '', items: '', deadline: '' };
        },
        error: (err) => console.error('Failed to create RFQ', err)
      });
    }
  }

  // Vendor Actions
  newQuotation = { proposed_price: 0, delivery_time: '' };
  selectedRfq: Rfq | null = null;
  
  selectRfq(rfq: Rfq) {
    this.selectedRfq = rfq;
  }

  submitQuotation() {
    if(this.selectedRfq) {
      this.apiService.submitQuotation(this.selectedRfq.id, this.newQuotation).subscribe({
        next: (res) => {
          this.loadRfqs();
          this.newQuotation = { proposed_price: 0, delivery_time: '' };
          this.selectedRfq = null;
        },
        error: (err) => {
          alert(err.error?.detail || 'Failed to submit quotation');
        }
      });
    }
  }
}
