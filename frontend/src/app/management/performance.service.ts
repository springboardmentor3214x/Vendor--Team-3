import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // ---------------------------------------------
  // Module 4: Performance API
  // ---------------------------------------------
  getPerformanceDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/performance/dashboard`);
  }

  getPerformanceHistory(vendorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/performance/history/${vendorId}`);
  }

  submitQualityEvaluation(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/performance/quality-evaluation`, payload);
  }

  submitCommunicationLog(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/performance/communication-log`, payload);
  }

  submitServiceRating(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/performance/service-rating`, payload);
  }

  getVendorRankings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/performance/rankings`);
  }

  // ---------------------------------------------
  // Module 5: Reliability API
  // ---------------------------------------------
  getReliabilityDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reliability/dashboard`);
  }

  getReliabilityDetails(vendorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/reliability/details/${vendorId}`);
  }

  getSupplierRankings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reliability/rankings`);
  }

  getProcurementRecommendations(category?: string): Observable<any> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    return this.http.get(`${this.apiUrl}/reliability/recommendations`, { params });
  }

  forceRecalculate(vendorId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reliability/recalculate/${vendorId}`, {});
  }

  // ---------------------------------------------
  // Reference Data
  // ---------------------------------------------
  getVendors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vendors/`);
  }

  addVendor(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/vendors/`, payload);
  }

  getVendorDetails(vendorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/vendors/${vendorId}`);
  }

  approveVendor(vendorId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/vendors/${vendorId}/approve`, {});
  }

  rejectVendor(vendorId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/vendors/${vendorId}/reject`, {});
  }

  getPurchaseOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/purchase-orders/`);
  }

  updatePurchaseOrderStatus(orderId: number, statusPayload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/purchase-orders/${orderId}`, statusPayload);
  }

  getVendorSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/vendor-summary`);
  }

  getContracts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contracts/`);
  }

  getProcurements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/procurements/`);
  }
}
