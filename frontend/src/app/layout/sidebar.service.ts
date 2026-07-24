import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  isSidebarVisible = true;
  isNotificationVisible = false;

  notifications = [
    { id: 1, title: 'Procurement Alert', message: 'New Requisition PR003 created by HR.', time: 'Just now' },
    { id: 2, title: 'Contract Expiry Alert', message: 'Contract CON-2026-02 for Tech India expires in 30 days.', time: '10 mins ago' },
    { id: 3, title: 'Delivery Delay Notification', message: 'xyz Suppliers reported a 2-day delay for order PO102.', time: '2 hours ago' },
    { id: 4, title: 'Compliance Flag', message: 'Anti-Bribery Statement check failed for Delta Traders.', time: '1 day ago' }
  ];

  constructor() {
    this.updateBodyClass();
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
    const role = this.getCurrentRole();
    if (role === 'auditor') {
      // Restrict operational notifications (Procurement Alert, Delivery Delay) for Auditors.
      return this.notifications.filter(n =>
        n.title === 'Contract Expiry Alert' || n.title === 'Compliance Flag'
      );
    }
    return this.notifications;
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
    if (email.includes('admin')) return 'admin';
    if (email.includes('procurement')) return 'procurement';
    if (email.includes('supply')) return 'supply';
    if (email.includes('finance')) return 'finance';
    if (email.includes('auditor')) return 'auditor';
    if (email.includes('vendor')) return 'vendor';
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
