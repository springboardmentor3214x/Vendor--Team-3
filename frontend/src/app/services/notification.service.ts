import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: string;
  module: string;
  related_record_id: number;
  time: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) { }

  getNotifications(filters?: {module?: string, priority?: string, status?: string}): Observable<Notification[]> {
    let params = new HttpParams();
    if (filters?.module) params = params.set('module', filters.module);
    if (filters?.priority) params = params.set('priority', filters.priority);
    if (filters?.status) params = params.set('status', filters.status);

    return this.http.get<Notification[]>(this.apiUrl, { params }).pipe(
      tap(notifications => {
        const unread = notifications.filter(n => n.status === 'Unread').length;
        this.unreadCountSubject.next(unread);
      })
    );
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        // Decrease unread count locally for immediate UI update
        const currentCount = this.unreadCountSubject.value;
        if (currentCount > 0) {
          this.unreadCountSubject.next(currentCount - 1);
        }
      })
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
      })
    );
  }
}
