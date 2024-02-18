import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class StudentLogService {
  private apiUrl = 'http://localhost:5984/sapas/StudentData';

  public localStorageKey: string = "currentUser" 

  constructor(private http: HttpClient, private route: Router) {
    if(this.isAuthenticated()){
      this.isLoggedIn = true
      const userData = this.getCurrentUser()
      this.currentUserName = userData.firstName
    }
  }

  isLoggedIn: boolean = false;
  currentUserName!: string;

  getStudentInfo(registrationNumber: string) {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    this.http.get(this.apiUrl, { headers }).subscribe(
      (data: any) => {
        for (let i in data) {
          if (data[i][registrationNumber]) {
            const currentUser = data[i][registrationNumber]
            localStorage.setItem(this.localStorageKey, JSON.stringify(currentUser))
            this.currentUserName = currentUser.firstName
          }
        }
      },
      (error: any) => {
        console.error('Error fetching student data:', error);
      }
    );
  }

  logout(): void {
    localStorage.removeItem(this.localStorageKey);
    window.location.reload()
    this.currentUserName = ""
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.localStorageKey);
  }

  getCurrentUser(): any {
    const userData = localStorage.getItem(this.localStorageKey);
    return userData ? JSON.parse(userData) : null;
  }
}
