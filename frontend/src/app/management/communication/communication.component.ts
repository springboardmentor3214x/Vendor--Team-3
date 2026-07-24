import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { SidebarService } from '../../layout/sidebar.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-communication',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './communication.component.html',
  styleUrl: './communication.component.scss'
})
export class CommunicationComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  newMessage = '';
  loading = false;
  unreadCount = 0;
  private pollInterval: any;

  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.loadMessages();
    // Poll for new messages every 15 seconds
    this.pollInterval = setInterval(() => this.loadMessages(), 15000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  loadMessages() {
    this.loading = true;
    this.api.getMyMessages().subscribe({
      next: (data) => {
        this.messages = data;
        this.unreadCount = data.filter((m: any) => !m.is_read).length;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  markAllRead() {
    this.api.markAllRead().subscribe({
      next: () => {
        this.messages.forEach(m => m.is_read = true);
        this.unreadCount = 0;
      }
    });
  }

  goBack() {
    const route = localStorage.getItem('dashboardRoute') || '/admin-dashboard';
    this.router.navigate([route]);
  }

  formatTime(sentAt: string): string {
    if (!sentAt) return '';
    return new Date(sentAt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }

  isSystemMessage(msg: any): boolean {
    return msg.message?.startsWith('📦') ||
           msg.message?.startsWith('✅') ||
           msg.message?.startsWith('📬') ||
           msg.message?.startsWith('🎉') ||
           msg.message?.startsWith('❌') ||
           msg.message?.startsWith('ℹ️');
  }
}
