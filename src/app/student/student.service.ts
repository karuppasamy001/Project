import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  studentData: any
  printData: any
  cgpa!: string
  gpa!: string

  constructor() {
    this.studentData = JSON.parse(localStorage.getItem('currentUser') ?? '{}');
  }
}
