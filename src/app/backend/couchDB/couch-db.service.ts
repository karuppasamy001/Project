import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class CouchDBService {
  private apiUrl = 'http://localhost:5984/sapas/StudentData';

  constructor(private http: HttpClient, private route: Router) { }

  addOrUpdateStudentDetails(studentDetails: any, academicYear: string) {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:admin')
    });

    const rollNumber = studentDetails.rollNumber;
    const registrationNumber = studentDetails.registrationNumber;
    const email = studentDetails.email;
    const phoneNum = studentDetails.mobileNumber;

    const url = `${this.apiUrl}`;

    this.http.get(url, { headers }).subscribe(
      (data: any) => {
        if (data[academicYear]) {
          const yearData = data[academicYear];

          // Check if registration number already exists
          if (yearData[registrationNumber]) {
            alert('User already exists with the same registration number!');
            return;
          }

          // Check if roll number already exists
          const studentKeys = Object.keys(yearData);
          const rollNumberExists = studentKeys.some(key => yearData[key].rollNumber === rollNumber);
          if (rollNumberExists) {
            alert('User already exists with the same roll number!');
            return;
          }

          // Check if email already exists
          const emailExists = studentKeys.some(key => yearData[key].email === email);
          if (emailExists) {
            alert('User already exists with the same email!');
            return;
          }

          // Check if phone number already exists
          const phoneNumExists = studentKeys.some(key => yearData[key].mobileNumber === phoneNum);
          if (phoneNumExists) {
            alert('User already exists with the same phone number!');
            return;
          }

          // If all validations pass, add the student details
          yearData[registrationNumber] = studentDetails;
          this.updateDocument(url, data, headers);
        } else {
          // Academic year does not exist, create it and add the student details inside it
          data[academicYear] = {
            [registrationNumber]: studentDetails
          };
          this.updateDocument(url, data, headers);
        }
      },
      (error: any) => {
        console.error('Error fetching student data:', error);
      }
    );
  }

  private updateDocument(url: string, data: any, headers: HttpHeaders){
    this.http.put(url, data, { headers }).subscribe(
      (response: any) => {
        console.log('Student details added successfully:', response);
      },
      (error: any) => {
        console.error('Error adding student details:', error);
      }
    );
  }

 
}
