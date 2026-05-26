import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: any }>(`${this.BASE}/login`, { email, password }).pipe(
      tap(res => { localStorage.setItem('token', res.token); localStorage.setItem('user', JSON.stringify(res.user)); })
    );
  }

  register(data: any) {
    return this.http.post(`${this.BASE}/register`, data);
  }

  logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); this.router.navigate(['/auth/login']); }

  getToken() { return localStorage.getItem('token'); }
  getUser() { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; }
  isLoggedIn() { return !!this.getToken(); }
}
