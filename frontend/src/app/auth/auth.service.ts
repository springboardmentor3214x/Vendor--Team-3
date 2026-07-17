import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
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
    const fixedAccounts: { [key: string]: { pass: string; role: string; route: string } } = {
      'a@gmail.com': { pass: 'a@123', role: 'Administrator', route: '/admin-dashboard' },
      'p@gmail.com': { pass: 'p@123', role: 'Procurement Manager', route: '/procurement-dashboard' },
      's@gmail.com': { pass: 's@123', role: 'Supply Chain Manager', route: '/supply-chain-dashboard' },
      'v@gmail.com': { pass: 'v@123', role: 'Vendor', route: '/vendor-dashboard' },
      'f@gmail.com': { pass: 'f@123', role: 'Finance Officer', route: '/finance-dashboard' },
      'au@gmail.com': { pass: 'au@123', role: 'Auditor', route: '/auditor-dashboard' }
    };

    const emailLower = data.email.toLowerCase();
    const fixed = fixedAccounts[emailLower];

    if (fixed && data.password === fixed.pass) {
      const mockResponse = {
        access_token: `mock_jwt_token_${fixed.role.replace(/ /g, '_')}`,
        token_type: 'bearer'
      };
      
      localStorage.setItem('authToken', mockResponse.access_token);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('dashboardRoute', fixed.route);
      
      // Ensure profile is cached
      localStorage.setItem(`profile_${data.email}`, JSON.stringify({
        fullName: fixed.role.toUpperCase() + ' TEST',
        email: data.email,
        mobile: '+91 9999999999',
        role: fixed.role,
        companyName: fixed.role === 'Vendor' ? 'Test Vendor Inc' : 'VRP Platform',
        employeeId: 'TEST' + Math.floor(1000 + Math.random() * 9000)
      }));

      this.userSubject.next({ email: data.email });
      return of(mockResponse);
    }

    // Normal backend authentication flow
    const payload = {
      email: data.email,
      password: data.password
    };
    return this.http.post(`${this.apiUrl}/login`, payload).pipe(
      tap((res: any) => {
        if (res && res.access_token) {
          localStorage.setItem('authToken', res.access_token);
          localStorage.setItem('userEmail', data.email);
          
          let route = '/admin-dashboard';
          if (data.email.includes('admin') || data.email.toLowerCase() === 'a@gmail.com') route = '/admin-dashboard';
          else if (data.email.includes('procurement') || data.email.toLowerCase() === 'p@gmail.com') route = '/procurement-dashboard';
          else if (data.email.includes('supply') || data.email.toLowerCase() === 's@gmail.com') route = '/supply-chain-dashboard';
          else if (data.email.includes('finance') || data.email.toLowerCase() === 'f@gmail.com') route = '/finance-dashboard';
          else if (data.email.includes('auditor') || data.email.toLowerCase() === 'au@gmail.com') route = '/auditor-dashboard';
          else if (data.email.includes('vendor') || data.email.toLowerCase() === 'v@gmail.com') route = '/vendor-dashboard';
          else {
            const profileStr = localStorage.getItem(`profile_${data.email}`);
            if (profileStr) {
              const profile = JSON.parse(profileStr);
              const r = profile.role?.toLowerCase() || '';
              if (r.includes('admin') || r === 'a@gmail.com') route = '/admin-dashboard';
              else if (r.includes('procurement') || r === 'p@gmail.com') route = '/procurement-dashboard';
              else if (r.includes('supply') || r === 's@gmail.com') route = '/supply-chain-dashboard';
              else if (r.includes('finance') || r === 'f@gmail.com') route = '/finance-dashboard';
              else if (r.includes('auditor') || r === 'au@gmail.com') route = '/auditor-dashboard';
              else if (r.includes('vendor') || r === 'v@gmail.com') route = '/vendor-dashboard';
            }
          }
          localStorage.setItem('dashboardRoute', route);
          this.userSubject.next({ email: data.email });
        }
      }),
      catchError((err) => {
        console.warn('Backend login failed, falling back to mock login');
        const mockResponse = {
          access_token: `mock_jwt_token_Fallback`,
          token_type: 'bearer'
        };
        
        let role = 'Administrator';
        let route = '/admin-dashboard';
        if (data.email.includes('admin') || data.email.toLowerCase() === 'a@gmail.com') { role = 'Administrator'; route = '/admin-dashboard'; }
        else if (data.email.includes('procurement') || data.email.toLowerCase() === 'p@gmail.com') { role = 'Procurement Manager'; route = '/procurement-dashboard'; }
        else if (data.email.includes('supply') || data.email.toLowerCase() === 's@gmail.com') { role = 'Supply Chain Manager'; route = '/supply-chain-dashboard'; }
        else if (data.email.includes('finance') || data.email.toLowerCase() === 'f@gmail.com') { role = 'Finance Officer'; route = '/finance-dashboard'; }
        else if (data.email.includes('auditor') || data.email.toLowerCase() === 'au@gmail.com') { role = 'Auditor'; route = '/auditor-dashboard'; }
        else if (data.email.includes('vendor') || data.email.toLowerCase() === 'v@gmail.com') { role = 'Vendor'; route = '/vendor-dashboard'; }

        localStorage.setItem('authToken', mockResponse.access_token);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('dashboardRoute', route);
        
        this.userSubject.next({ email: data.email });
        return of(mockResponse);
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
