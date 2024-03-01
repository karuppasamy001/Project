import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  constructor() {
    if(this.isAuthenticated()){
      this.isLoggedIn = true
    }
   }

   isLoggedIn: boolean = false

  isAuthenticated(): boolean{
    return !!localStorage.getItem("isStaff");
   }

   logout(): void {
    localStorage.removeItem("isStaff");
    window.location.reload()
  }
}
