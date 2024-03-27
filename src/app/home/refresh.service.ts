import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RefreshService {

  private readonly STORAGE_KEY = 'refreshed';
  
  constructor() { }

  isRefreshed(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) === 'true';
  }

  markRefreshed(): void {
    localStorage.setItem(this.STORAGE_KEY, 'true');
  }


  resetRefresh(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
