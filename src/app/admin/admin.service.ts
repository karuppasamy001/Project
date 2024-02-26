import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

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


}
