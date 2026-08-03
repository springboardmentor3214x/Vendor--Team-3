import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private apiUrl = 'http://localhost:8000';

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
    // The new backend doesn't have a single dashboard API, so we fetch rankings and risks to compute it
    return this.http.get(`${this.apiUrl}/supplier-ranking/`);
  }

  getReliabilityDetails(vendorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/vendor-reliability/${vendorId}`);
  }

  getSupplierRankings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/supplier-ranking/`);
  }

  getProcurementRecommendations(category?: string): Observable<any> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    // New endpoint
    return this.http.get(`${this.apiUrl}/procurement-recommendation/`, { params });
  }

  forceRecalculate(vendorId: number): Observable<any> {
    // Note: VendorReliabilityCreate payload requires scores, but for force recalculate we might just send the vendor_id 
    // or rely on a specific recalculate endpoint if it exists. 
    // The new backend has /vendor-reliability/calculate POST
    return this.http.post(`${this.apiUrl}/vendor-reliability/calculate`, {
      vendor_id: vendorId,
      delivery_score: 100,
      quality_score: 100,
      communication_score: 100,
      contract_compliance_score: 100,
      purchase_history_score: 100,
      issue_resolution_score: 100
    });
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
