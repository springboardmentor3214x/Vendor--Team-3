import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000'; // FastAPI backend port
  
  private userSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('authToken');
    if (token && token.startsWith('mock_jwt_token_')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('dashboardRoute');
    }
    const email = localStorage.getItem('userEmail');
    if (email) {
      this.userSubject.next({ email });
    }
  }

  register(data: any): Observable<any> {
    const roleMapping: { [key: string]: number } = {
      'Administrator': 1,
      'Procurement Manager': 2,
      'Supply Chain Manager': 3,
      'Vendor': 4,
      'Finance Officer': 5,
      'Auditor': 6
    };
    const roleId = roleMapping[data.role] || 4; // Default to Vendor

    const payload = {
      full_name: data.fullName || data.full_name,
      email: data.email,
      password: data.password,
      phone: data.mobile || '',
      role_id: roleId
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
    const body = new URLSearchParams();
    body.set('username', data.email);
    body.set('password', data.password);

    return this.http.post(`${this.apiUrl}/login`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap((res: any) => {
        if (res && res.access_token) {
          localStorage.setItem('authToken', res.access_token);
          localStorage.setItem('userEmail', data.email);
          
          // Store the role from backend response (lowercase, matches roleGuard expectations)
          const roleMap: { [key: string]: string } = {
            'Administrator': 'admin',
            'Procurement Manager': 'procurement',
            'Supply Chain Manager': 'supply',
            'Vendor': 'vendor',
            'Finance Officer': 'finance',
            'Auditor': 'auditor'
          };
          if (res.role) {
            localStorage.setItem('userRole', roleMap[res.role] || res.role.toLowerCase());
          }
          if (res.user_id) {
            localStorage.setItem('userId', res.user_id.toString());
          }

          // Determine dashboard route — use backend role first (most reliable),
          // then fall back to email-pattern matching for flexibility
          const routeMap: { [key: string]: string } = {
            'Administrator': '/admin-dashboard',
            'Procurement Manager': '/procurement-dashboard',
            'Supply Chain Manager': '/supply-chain-dashboard',
            'Finance Officer': '/finance-dashboard',
            'Auditor': '/auditor-dashboard',
            'Vendor': '/vendor-dashboard'
          };
          let route = (res.role && routeMap[res.role]) ? routeMap[res.role] : '/admin-dashboard';

          // Email-based fallback (for users without a role in the backend response)
          if (!res.role) {
            const emailLower = data.email.toLowerCase();
            if (emailLower === 'a@gmail.com' || emailLower.includes('admin')) route = '/admin-dashboard';
            else if (emailLower === 'p@gmail.com' || emailLower.includes('procurement')) route = '/procurement-dashboard';
            else if (emailLower === 's@gmail.com' || emailLower.includes('supply')) route = '/supply-chain-dashboard';
            else if (emailLower === 'f@gmail.com' || emailLower.includes('finance')) route = '/finance-dashboard';
            else if (emailLower === 'au@gmail.com' || emailLower.includes('auditor')) route = '/auditor-dashboard';
            else if (emailLower === 'v@gmail.com' || emailLower.includes('vendor')) route = '/vendor-dashboard';
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
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
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

  // ---------------------------------------------------------
  // Verify OTP
  // ---------------------------------------------------------
  verifyOtp(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, payload);
  }

  // ---------------------------------------------------------
  // Password Reset Methods
  // ---------------------------------------------------------
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
      role: (email.includes('admin') || email.toLowerCase() === 'a@gmail.com') ? 'Administrator' : 
            (email.includes('procurement') || email.toLowerCase() === 'p@gmail.com') ? 'Procurement Manager' : 
            (email.includes('supply') || email.toLowerCase() === 's@gmail.com') ? 'Supply Chain Manager' : 
            (email.includes('finance') || email.toLowerCase() === 'f@gmail.com') ? 'Finance Officer' : 
            (email.includes('auditor') || email.toLowerCase() === 'au@gmail.com') ? 'Auditor' : 
            (email.includes('vendor') || email.toLowerCase() === 'v@gmail.com') ? 'Vendor' : 'Staff',
      companyName: (email.includes('vendor') || email.toLowerCase() === 'v@gmail.com') ? 'ABC Suppliers Ltd' : 'VendorIQ Corp',
      employeeId: 'EMP' + Math.floor(1000 + Math.random() * 9000)
    };
    return of(defaultProfile);
  }

  updateProfile(email: string, profileData: any): Observable<any> {
    localStorage.setItem(`profile_${email}`, JSON.stringify(profileData));
    return of({ message: 'Profile updated successfully', profile: profileData });
  }
}
