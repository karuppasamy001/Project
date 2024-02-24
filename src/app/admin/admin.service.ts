import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:5984/sapas/StudentData';

  constructor() {
    if(this.isAuthenticated()){
      this.isLoggedIn = true
    }
   }

   isLoggedIn: boolean = false


   isAuthenticated(): boolean{
    return !!localStorage.getItem("isAdmin");
   }

   logout(): void {
    localStorage.removeItem("isAdmin");
    window.location.reload()
  }

  // getStudentDetails(): Observable<any> {
  //   const headers = new HttpHeaders({
  //     'Authorization': 'Basic ' + btoa('admin:admin')
  //   });


  // }
}
