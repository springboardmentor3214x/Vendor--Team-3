import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ReportFilter {
  type: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = ${environment.apiUrl}/reports;

  constructor(private http: HttpClient) {}

  getReports(filter: ReportFilter): Observable<any> {
    let params = new HttpParams().set('type', filter.type);
    if (filter.startDate) params = params.set('startDate', filter.startDate);
    if (filter.endDate) params = params.set('endDate', filter.endDate);
    if (filter.category) params = params.set('category', filter.category);

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Error fetching reports from backend, using dummy data', error);
        return of(this.getDummyData(filter.type));
      })
    );
  }

  downloadExport(filter: ReportFilter, format: 'pdf' | 'excel'): Observable<Blob> {
    let params = new HttpParams().set('type', filter.type).set('format', format);
    if (filter.startDate) params = params.set('startDate', filter.startDate);
    if (filter.endDate) params = params.set('endDate', filter.endDate);
    if (filter.category) params = params.set('category', filter.category);

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  private getDummyData(type: string) {
    if (type === 'Vendor Performance') {
      return [
        { id: 1, vendor: 'Acme Corp', score: 95, category: 'IT', date: '2023-01-15' },
        { id: 2, vendor: 'Global Tech', score: 82, category: 'Hardware', date: '2023-02-10' },
        { id: 3, vendor: 'Office Supplies Inc', score: 76, category: 'Office', date: '2023-03-05' }
      ];
    } else if (type === 'Procurement') {
      return [
        { id: 1, item: 'Laptops', amount: 50000, category: 'IT', date: '2023-01-20' },
        { id: 2, item: 'Desks', amount: 15000, category: 'Furniture', date: '2023-02-15' },
        { id: 3, item: 'Monitors', amount: 20000, category: 'IT', date: '2023-03-10' }
      ];
    }
    return [];
  }
}
