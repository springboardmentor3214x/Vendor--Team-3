import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatIconModule, MatButtonModule, MatBadgeModule, MatDividerModule, RouterModule],
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.scss']
})
export class NotificationDropdownComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount: number = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(data => {
      this.notifications = data.slice(0, 5); // Show top 5 recent
    });
  }

  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    if (notification.status === 'Unread') {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.status = 'Read';
      });
    }
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.status = 'Read');
    });
  }
}
