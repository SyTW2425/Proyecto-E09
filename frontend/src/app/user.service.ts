import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<{ token: string }> {
    const body = { username, password };
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, body);
  }

	register(username: string, password: string, email: string): Observable<{ token: string }> {
		const body = { username, password, email };
		return this.http.post<{ token: string }>(`${this.apiUrl}/register`, body);
	}


  getUserName(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/username`);
  }

}