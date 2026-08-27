import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, SignupRequest, AuthResponse } from '../models/auth.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Must match the key read by auth.interceptor.ts
  private tokenKey = 'token';
  private apiUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient) {}

signup(data: SignupRequest): Observable<string> {
  return this.http.post(`${this.apiUrl}/Signup`, data, {
    responseType: 'text'
  });
}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Login`, data).pipe(
      tap(res => this.setToken(res.token))
    );
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}
