import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  readonly baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ─── Generic Methods ─────────────────────────────────────────────────────────
  get(url: string): Observable<any> { return this.http.get<any>(`${this.baseUrl}${url}`, { headers: this.getAuthHeaders() }); }
  post(url: string, data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}${url}`, data, { headers: this.getAuthHeaders() }); }
  put(url: string, data: any): Observable<any> { return this.http.put<any>(`${this.baseUrl}${url}`, data, { headers: this.getAuthHeaders() }); }
  delete(url: string): Observable<any> { return this.http.delete<any>(`${this.baseUrl}${url}`, { headers: this.getAuthHeaders() }); }
  getBlob(url: string): Observable<Blob> { return this.http.get(`${this.baseUrl}${url}`, { headers: this.getAuthHeaders(), responseType: 'blob' }); }

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
