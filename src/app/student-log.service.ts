import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AdminService } from './admin/admin.service';
import { StaffService } from './staff/staff.service';

@Injectable({
  providedIn: 'root',
})
export class StudentLogService {
  private apiUrl = 'http://localhost:5984/sapas/StudentData';

  public localStorageKey: string = "currentUser" 

  constructor(private http: HttpClient, private route: Router, private admin: AdminService, private staff: StaffService) {
    if(this.isAuthenticated()){
      this.isLoggedIn = true
      const userData = this.getCurrentUser("student")
      this.currentUserName = userData.firstName
    }
    else if(admin.isAuthenticated()){
      this.currentUserName = "Admin"
    }
    else if(staff.isAuthenticated()){
      const staffData = this.getCurrentUser("staff")
      this.currentUserName = staffData.staffName
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

  getCurrentUser(typeOfUser: string): any {

    if(typeOfUser === 'student'){
    const userData = localStorage.getItem(this.localStorageKey);
    return userData ? JSON.parse(userData) : null;
    }
    else{
      const userData = localStorage.getItem("isStaff");
      return userData ? JSON.parse(userData) : null;
    }
  }
}
