import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
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

uploadContractDocument(contractId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/contracts/${contractId}/upload`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  downloadContractDocument(contractId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/contracts/${contractId}/download`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  uploadVendorRegistrationDocument(vendorId: number, docType: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/vendors/${vendorId}/upload-document?doc_type=${docType}`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  downloadVendorRegistrationDocument(vendorId: number, docType: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/vendors/${vendorId}/download-document?doc_type=${docType}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  uploadMessageAttachment(messageId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/messages/${messageId}/upload`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  downloadMessageAttachment(messageId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/messages/${messageId}/download`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
}

}
