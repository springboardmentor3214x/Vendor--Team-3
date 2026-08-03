import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  isSidebarVisible = true;
  isNotificationVisible = false;

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private pollingSubscription?: Subscription;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    this.updateBodyClass();
    if (isPlatformBrowser(this.platformId)) {
      this.fetchNotifications();
      // Poll every 30 seconds
      this.pollingSubscription = interval(30000).subscribe(() => {
        if (localStorage.getItem('token')) {
          this.fetchNotifications();
        }
      });
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  fetchNotifications() {
    if (!localStorage.getItem('token')) return;
    
    // Assuming backend URL is mapped or hardcoded
    this.http.get<Notification[]>('http://127.0.0.1:8000/notifications/', { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => {
          this.notificationsSubject.next(data);
          this.unreadCountSubject.next(data.filter(n => n.status === 'Unread').length);
        },
        error: (err) => console.error('Error fetching notifications', err)
      });
  }

  markAsRead(id: number) {
    this.http.put(`http://127.0.0.1:8000/notifications/${id}/read`, {}, { headers: this.getAuthHeaders() })
      .subscribe({
        next: () => {
          // Locally update to immediately reflect the change
          const current = this.notificationsSubject.getValue();
          const updated = current.map(n => n.id === id ? { ...n, status: 'Read' } : n);
          this.notificationsSubject.next(updated);
          this.unreadCountSubject.next(updated.filter(n => n.status === 'Unread').length);
        },
        error: (err) => console.error('Error marking notification as read', err)
      });
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    this.updateBodyClass();
  }

  private updateBodyClass() {
    if (typeof document !== 'undefined') {
      if (this.isSidebarVisible) {
        document.body.classList.remove('sidebar-hidden');
      } else {
        document.body.classList.add('sidebar-hidden');
      }
    }
  }

  toggleNotifications() {
    this.isNotificationVisible = !this.isNotificationVisible;
  }

  getNotifications() {
    return this.notificationsSubject.getValue();
  }

  get unreadCount() {
    return this.unreadCountSubject.getValue();
  }

  getCurrentRole(): string {
    const email = localStorage.getItem('userEmail');
    if (!email) return 'admin';

    // PRIMARY CHECK: use the userRole stored directly from the backend login response.
    // This is the most reliable source and handles short emails like s@gmail.com / f@gmail.com
    // that don't contain their role name as a substring.
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      const r = storedRole.toLowerCase();
      if (r === 'admin' || r === 'administrator') return 'admin';
      if (r === 'procurement') return 'procurement';
      if (r === 'supply') return 'supply';
      if (r === 'finance') return 'finance';
      if (r === 'auditor') return 'auditor';
      if (r === 'vendor') return 'vendor';
    }

    // SECONDARY CHECK: cached profile (set during registration in same session)
    const profileStr = localStorage.getItem(`profile_${email}`);
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        const role = profile.role?.toLowerCase() || '';
        if (role.includes('admin')) return 'admin';
        if (role.includes('procurement')) return 'procurement';
        if (role.includes('supply')) return 'supply';
        if (role.includes('finance')) return 'finance';
        if (role.includes('auditor')) return 'auditor';
        if (role.includes('vendor')) return 'vendor';
      } catch (e) {
        console.error('Error parsing user profile role:', e);
      }
    }

    // LAST RESORT: substring match on email address
    // Works for descriptive emails (e.g. supply@company.com) but NOT short ones
    const emailLower = email.toLowerCase();
    if (emailLower === 'a@gmail.com' || emailLower.includes('admin')) return 'admin';
    if (emailLower === 'p@gmail.com' || emailLower.includes('procurement')) return 'procurement';
    if (emailLower === 's@gmail.com' || emailLower.includes('supply')) return 'supply';
    if (emailLower === 'f@gmail.com' || emailLower.includes('finance')) return 'finance';
    if (emailLower === 'au@gmail.com' || emailLower.includes('auditor')) return 'auditor';
    if (emailLower === 'v@gmail.com' || emailLower.includes('vendor')) return 'vendor';
    return 'admin';
  }

  getCurrentRoleLabel(): string {
    const role = this.getCurrentRole();
    switch (role) {
      case 'admin': return 'Administrator';
      case 'procurement': return 'Procurement Manager';
      case 'supply': return 'Supply Chain Manager';
      case 'finance': return 'Finance Officer';
      case 'auditor': return 'Auditor';
      case 'vendor': return 'Vendor';
      default: return 'Administrator';
    }
  }

  getSidebarBackground(): string {
    const role = this.getCurrentRole();
    switch (role) {
      case 'admin': return '#1e3a8a';
      case 'procurement': return '#1e3a8a';
      case 'supply': return '#5c3d2e';
      case 'finance': return '#8b753a';
      case 'auditor': return '#1e1e1e';
      case 'vendor': return '#8b3a3a';
      default: return '#2b303b';
    }
  }

  getDashboardRoute(): string {
    return localStorage.getItem('dashboardRoute') || '/' + this.getCurrentRole() + '-dashboard';
  }
}
