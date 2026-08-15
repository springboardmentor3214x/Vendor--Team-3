import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CertificationService {
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

getCertifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/certifications/`, {
      headers: this.getAuthHeaders()
    });
  }
  
  getVendorCertifications(vendorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/certifications/vendor/${vendorId}`, {
      headers: this.getAuthHeaders()
    });
  }

  addCertification(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/certifications/`, data, {
      headers: this.getAuthHeaders()
    });
  }

  uploadCertificateDocument(certificationId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/certifications/${certificationId}/upload`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  downloadCertificateDocument(certificationId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/certifications/${certificationId}/download`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
}

}
