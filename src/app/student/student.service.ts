import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  studentData: any
  constructor() {
    this.studentData = JSON.parse(localStorage.getItem('currentUser') ?? '{}');
  }
}
