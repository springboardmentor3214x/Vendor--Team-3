import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken') || '';
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  // ---------------------------------------------
  // Module 4: Performance API
  // ---------------------------------------------
  getPerformanceDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/performance/dashboard`, this.getAuthHeaders());
  }

  getPerformanceHistory(vendorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/performance/history/${vendorId}`, this.getAuthHeaders());
  }

  submitQualityEvaluation(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/performance/quality-evaluation`, payload, this.getAuthHeaders());
  }

  submitCommunicationLog(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/performance/communication-log`, payload, this.getAuthHeaders());
  }

  submitServiceRating(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/performance/service-rating`, payload, this.getAuthHeaders());
  }

  getVendorRankings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/performance/rankings`, this.getAuthHeaders());
  }

  // ---------------------------------------------
  // Module 5: Reliability API
  // ---------------------------------------------
  getReliabilityDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reliability/dashboard`, this.getAuthHeaders());
  }

  getReliabilityDetails(vendorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/vendor-reliability/${vendorId}`, this.getAuthHeaders());
  }

  getSupplierRankings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/supplier-ranking/`, this.getAuthHeaders());
  }

  getProcurementRecommendations(category?: string): Observable<any> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    // New endpoint
    return this.http.get(`${this.apiUrl}/procurement-recommendation/`, { params, ...this.getAuthHeaders() });
  }

  forceRecalculate(vendorId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/vendor-reliability/calculate`, {
      vendor_id: vendorId
    }, this.getAuthHeaders());
  }

  // ---------------------------------------------
  // Reference Data
  // ---------------------------------------------
  getVendors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vendors/`, this.getAuthHeaders());
  }

  addVendor(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/vendors/`, payload, this.getAuthHeaders());
  }

  getVendorDetails(vendorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/vendors/${vendorId}`, this.getAuthHeaders());
  }

  approveVendor(vendorId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/vendors/${vendorId}/approve`, {}, this.getAuthHeaders());
  }

  rejectVendor(vendorId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/vendors/${vendorId}/reject`, {}, this.getAuthHeaders());
  }

  getPurchaseOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/purchase-orders/`, this.getAuthHeaders());
  }

  updatePurchaseOrderStatus(orderId: number, statusPayload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/purchase-orders/${orderId}`, statusPayload, this.getAuthHeaders());
  }

  getVendorSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/vendor-summary`, this.getAuthHeaders());
  }

  getProcurementStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/procurement-stats`, this.getAuthHeaders());
  }

  getActivePurchaseOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/active-purchase-orders`, this.getAuthHeaders());
  }

  getVendorPerformanceSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/vendor-performance-summary`, this.getAuthHeaders());
  }

  getDeliveryStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/delivery-status`, this.getAuthHeaders());
  }

  getAdminOverview(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin-dashboard/overview`, this.getAuthHeaders());
  }

  getVendorPerformanceView(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vendor-dashboard/performance-view`, this.getAuthHeaders());
  }

  getVendorContractStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vendor-dashboard/contract-status`, this.getAuthHeaders());
  }

  getVendorOrderHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vendor-dashboard/order-history`, this.getAuthHeaders());
  }

  getContracts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contracts/`, this.getAuthHeaders());
  }

  getProcurements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/procurements/`, this.getAuthHeaders());
  }

  getCostAnalysis(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/cost-analysis`, this.getAuthHeaders());
  }

  getVendorCommunicationSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vendor-dashboard/communication-summary`, this.getAuthHeaders());
  }

  getVendorPendingDeliveries(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vendor-dashboard/pending-deliveries`, this.getAuthHeaders());
  }
}
