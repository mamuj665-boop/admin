import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly BASE = 'https://shopverse-ef695ae54309.herokuapp.com/api';

  constructor(private http: HttpClient) {}

  get<T>(url: string): Observable<T> { return this.http.get<T>(`${this.BASE}${url}`); }
  post<T>(url: string, body: any): Observable<T> { return this.http.post<T>(`${this.BASE}${url}`, body); }
  put<T>(url: string, body: any): Observable<T> { return this.http.put<T>(`${this.BASE}${url}`, body); }
  delete<T>(url: string): Observable<T> { return this.http.delete<T>(`${this.BASE}${url}`); }
}
