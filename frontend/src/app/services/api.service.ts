import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  readonly baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ─── Generic Methods ─────────────────────────────────────────────────────────
  get(url: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${url}`, { headers: this.getAuthHeaders() });
  }

  getBlob(url: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${url}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  post(url: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}${url}`, data, { headers: this.getAuthHeaders() });
  }

  put(url: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}${url}`, data, { headers: this.getAuthHeaders() });
  }

  delete(url: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}${url}`, { headers: this.getAuthHeaders() });
  }

  // ─── Users ──────────────────────────────────────────────────────────────────
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
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

  // ─── Contracts ───────────────────────────────────────────────────────────────
  getContracts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/contracts/`, {
      headers: this.getAuthHeaders()
    });
  }

  getContract(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/contracts/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createContract(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/contracts/`, data, {
      headers: this.getAuthHeaders()
    });
  }

  updateContract(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/contracts/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // ─── Vendor Documents & Compliance ───────────────────────────────────────────
  getVendorDocuments(vendorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/vendor-documents/${vendorId}`, {
      headers: this.getAuthHeaders()
    });
  }

  uploadVendorDocument(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/vendor-documents/`, data, {
      headers: this.getAuthHeaders()
    });
  }

  deleteVendorDocument(documentId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/vendor-documents/${documentId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ─── RFQs ───────────────────────────────────────────────────────────────────
  getRfqs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/rfqs/`, {
      headers: this.getAuthHeaders()
    });
  }

  createRfq(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/rfqs/`, data, {
      headers: this.getAuthHeaders()
    });
  }

  submitQuotation(rfqId: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/rfqs/${rfqId}/quotations`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // ─── File Uploads & Downloads ────────────────────────────────────────────────
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

  // ─── Renewals ────────────────────────────────────────────────────────────────
  renewContract(contractId: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/contracts/${contractId}/renew`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // ─── Certifications ───────────────────────────────────────────────────────────
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

  // ─── Compliance ─────────────────────────────────────────────────────────────
  getComplianceRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/compliance/`, {
      headers: this.getAuthHeaders()
    });
  }

  getVendorCompliance(vendorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/compliance/vendor/${vendorId}`, {
      headers: this.getAuthHeaders()
    });
  }

  addComplianceRecord(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/compliance/`, data, {
      headers: this.getAuthHeaders()
    });
  }

  updateComplianceRecord(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/compliance/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }
}
