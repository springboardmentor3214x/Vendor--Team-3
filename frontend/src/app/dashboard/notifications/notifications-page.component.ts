import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSelectModule, MatFormFieldModule, MatButtonModule, MatIconModule, MatChipsModule, FormsModule],
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.scss']
})
export class NotificationsPageComponent implements OnInit {
  notifications: Notification[] = [];
  displayedColumns: string[] = ['type', 'title', 'module', 'priority', 'time', 'status', 'actions'];
  
  filterModule: string = '';
  filterPriority: string = '';
  filterStatus: string = '';
  
  modules: string[] = ['Contract', 'PurchaseOrder', 'Compliance', 'Vendor', 'Procurement'];
  priorities: string[] = ['High', 'Medium', 'Low'];
  statuses: string[] = ['Unread', 'Read'];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    const filters: any = {};
    if (this.filterModule) filters.module = this.filterModule;
    if (this.filterPriority) filters.priority = this.filterPriority;
    if (this.filterStatus) filters.status = this.filterStatus;

    this.notificationService.getNotifications(filters).subscribe(data => {
      this.notifications = data;
    });
  }

  applyFilters(): void {
    this.loadNotifications();
  }

  clearFilters(): void {
    this.filterModule = '';
    this.filterPriority = '';
    this.filterStatus = '';
    this.loadNotifications();
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe(() => {
      this.loadNotifications();
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.loadNotifications();
    });
  }
}
