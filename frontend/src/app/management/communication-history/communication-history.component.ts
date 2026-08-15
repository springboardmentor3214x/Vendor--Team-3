import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-communication-history',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './communication-history.component.html',
  styleUrls: ['./communication-history.component.scss']
})
export class CommunicationHistoryComponent implements OnInit {
  logs: any[] = [];
  filteredLogs: any[] = [];
  searchTerm: string = '';
  filterType: string = 'All';

  constructor(
    public sidebarService: SidebarService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Ideally fetch from an API like /messages/history or /discussions/history
    // Using a mock for the layout
    this.logs = [
      { id: 1, type: 'Direct Message', participants: 'Procurement (ID:2) → Vendor (ID:5)', related: 'PO #102', content: 'Please review the attached...', date: new Date(Date.now() - 86400000) },
      { id: 2, type: 'Discussion', participants: 'Vendor, Supply Chain, Admin', related: 'PO #102', content: 'Thread: Delivery Delay on PO-102 created', date: new Date(Date.now() - 172800000) },
      { id: 3, type: 'Direct Message', participants: 'Vendor (ID:5) → Procurement (ID:2)', related: 'PO #105', content: 'Quotation attached.', date: new Date(Date.now() - 345600000) }
    ];
    this.filteredLogs = [...this.logs];
  }

  filterLogs() {
    this.filteredLogs = this.logs.filter(log => {
      const matchSearch = log.participants.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                          log.related.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          log.content.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchType = this.filterType === 'All' || log.type === this.filterType;
      return matchSearch && matchType;
    });
  }
}
