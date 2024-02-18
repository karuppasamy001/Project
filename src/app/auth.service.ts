// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private couchDBUrl = 'http://admin:admin@localhost:5984';
  private localStorageKey = 'currentUser';

  
  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa('admin:admin')
    });
    return this.http.get<any>(`${this.couchDBUrl}/sapas/_design/login/_view/view?key={"username":"${username}","password":"${password}"}`, {headers});
  }

  logout(): Observable<any> {
    return this.http.delete<any>(`${this.couchDBUrl}/_session`);
  }

  isAuthenticated(): Observable<any> {
    return this.http.get<any>(`${this.couchDBUrl}/_session`);
  }
}
