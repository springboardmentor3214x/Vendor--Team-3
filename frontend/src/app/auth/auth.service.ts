import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000'; // Default FastAPI port
  
  private userSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const email = localStorage.getItem('userEmail');
    if (email) {
      this.userSubject.next({ email });
    }
  }

  register(data: any): Observable<any> {
    // Backend expects UserRegister: { full_name, email, password }
    const payload = {
      full_name: data.fullName || data.full_name,
      email: data.email,
      password: data.password
    };
    return this.http.post(`${this.apiUrl}/register`, payload).pipe(
      tap((res: any) => {
        // Cache registration details locally to mock user profile fetching
        localStorage.setItem(`profile_${data.email}`, JSON.stringify({
          fullName: data.fullName || data.full_name,
          email: data.email,
          mobile: data.mobile || '',
          role: data.role || 'Vendor',
          companyName: data.companyName || '',
          employeeId: data.employeeId || ''
        }));
      })
    );
  }

  login(data: any): Observable<any> {
    // Backend expects UserLogin: { email, password }
    const payload = {
      email: data.email,
      password: data.password
    };
    return this.http.post(`${this.apiUrl}/login`, payload).pipe(
      tap((res: any) => {
        if (res && res.access_token) {
          localStorage.setItem('authToken', res.access_token);
          localStorage.setItem('userEmail', data.email);
          
          // Determine default route
          let route = '/admin-dashboard';
          if (data.email.includes('admin')) route = '/admin-dashboard';
          else if (data.email.includes('procurement')) route = '/procurement-dashboard';
          else if (data.email.includes('supply')) route = '/supply-chain-dashboard';
          else if (data.email.includes('finance')) route = '/finance-dashboard';
          else if (data.email.includes('auditor')) route = '/auditor-dashboard';
          else if (data.email.includes('vendor')) route = '/vendor-dashboard';
          else {
            // Check local registered profile
            const profileStr = localStorage.getItem(`profile_${data.email}`);
            if (profileStr) {
              const profile = JSON.parse(profileStr);
              const r = profile.role?.toLowerCase() || '';
              if (r.includes('admin')) route = '/admin-dashboard';
              else if (r.includes('procurement')) route = '/procurement-dashboard';
              else if (r.includes('supply')) route = '/supply-chain-dashboard';
              else if (r.includes('finance')) route = '/finance-dashboard';
              else if (r.includes('auditor')) route = '/auditor-dashboard';
              else if (r.includes('vendor')) route = '/vendor-dashboard';
            }
          }
          
          localStorage.setItem('dashboardRoute', route);
          this.userSubject.next({ email: data.email });
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('dashboardRoute');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  forgotPassword(email: string): Observable<any> {
    // Mock backend POST request
    return this.http.post(`${this.apiUrl}/forgot-password`, { email }).pipe(
      tap(() => {}),
      // Fallback response if endpoint is not implemented in mock backend
      (err) => of({ message: 'Mock Password Reset Link Sent' })
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    // Mock backend POST request
    return this.http.post(`${this.apiUrl}/reset-password`, { token, password: newPassword }).pipe(
      tap(() => {}),
      (err) => of({ message: 'Mock Password Reset Completed' })
    );
  }

  getProfile(email: string): Observable<any> {
    // Retrieve cached local profile details
    const profileStr = localStorage.getItem(`profile_${email}`);
    if (profileStr) {
      return of(JSON.parse(profileStr));
    }
    
    // Default fallback profile if user didn't register in this session
    const defaultProfile = {
      fullName: email.split('@')[0].toUpperCase(),
      email: email,
      mobile: '+91 9876543210',
      role: email.includes('admin') ? 'Administrator' : 
            email.includes('procurement') ? 'Procurement Manager' : 
            email.includes('vendor') ? 'Vendor' : 'Staff',
      companyName: email.includes('vendor') ? 'ABC Suppliers Ltd' : 'VendorIQ Corp',
      employeeId: 'EMP' + Math.floor(1000 + Math.random() * 9000)
    };
    return of(defaultProfile);
  }

  updateProfile(email: string, profileData: any): Observable<any> {
    localStorage.setItem(`profile_${email}`, JSON.stringify(profileData));
    return of({ message: 'Profile updated successfully', profile: profileData });
  }
}
