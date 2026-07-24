import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  readonly baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ─── Vendors ────────────────────────────────────────────────────────────────
  getVendors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/vendors/?limit=100`, {
      headers: this.getAuthHeaders()
    });
  }

  // ─── Procurements ───────────────────────────────────────────────────────────
  getProcurements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/procurements/?limit=100`, {
      headers: this.getAuthHeaders()
    });
  }

  createProcurement(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/procurements/`, data, {
      headers: this.getAuthHeaders()
    });
  }

  updateProcurement(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/procurements/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // ─── Purchase Orders ─────────────────────────────────────────────────────────
  getPurchaseOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/purchase-orders/`, {
      headers: this.getAuthHeaders()
    });
  }

  createPurchaseOrder(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/purchase-orders/`, data, {
      headers: this.getAuthHeaders()
    });
  }

  updatePurchaseOrder(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/purchase-orders/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // ─── Messages ────────────────────────────────────────────────────────────────
  getMyMessages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/messages/my/inbox`, {
      headers: this.getAuthHeaders()
    });
  }

  getUnreadCount(): Observable<{ unread_count: number }> {
    return this.http.get<{ unread_count: number }>(`${this.baseUrl}/messages/my/unread-count`, {
      headers: this.getAuthHeaders()
    });
  }

  markAllRead(): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/messages/my/mark-read`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  sendMessage(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/messages/`, data, {
      headers: this.getAuthHeaders()
    });
  }

  getAllMessages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/messages/`, {
      headers: this.getAuthHeaders()
    });
  }
}
