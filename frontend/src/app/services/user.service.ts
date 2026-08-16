import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  readonly baseUrl = environment.apiUrl;

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

getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
}

}
