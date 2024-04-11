import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FaceUpdate } from './interface';
import { Observable } from 'rxjs/internal/Observable';
import { map, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class CouchDBService {
  private apiUrl = 'http://localhost:5984/sapas/StudentData';
  private faceUpdateUrl = 'http://localhost:5984/sapas/FaceUpdate';

  studentData: any;
  userName!: string;
  password!: string;
  academicYear!: string;

  constructor(private http: HttpClient, private route: Router) {}

  addOrUpdateStudentDetails(studentDetails: any, academicYear: string) {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const rollNumber = studentDetails.rollNumber;
    const registrationNumber = studentDetails.registrationNumber;
    const email = studentDetails.email;
    const phoneNum = studentDetails.mobileNumber;

    const approvalUrl = 'http://localhost:5984/sapas/StudentData';

    this.validateInfoFromStaff(studentDetails).subscribe(matchFound => {
      if (matchFound) {
        return;
      } else {
        console.log('No match found with staff data.');
      }
    });

    this.http.get(approvalUrl, { headers }).subscribe(
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
          const rollNumberExists = studentKeys.some(
            (key) => yearData[key].rollNumber === rollNumber
          );
          if (rollNumberExists) {
            alert('User already exists with the same roll number!');
            return;
          }

          // Check if email already exists
          const emailExists = studentKeys.some(
            (key) => yearData[key].email === email
          );
          if (emailExists) {
            alert('User already exists with the same email!');
            return;
          }

          // Check if phone number already exists
          const phoneNumExists = studentKeys.some(
            (key) => yearData[key].mobileNumber === phoneNum
          );
          if (phoneNumExists) {
            alert('User already exists with the same phone number!');
            return;
          }

          // If all validations pass, add the student details
          yearData[registrationNumber] = studentDetails;
          this.updateDataForApproval(studentDetails, academicYear)
        } else {
          // Academic year does not exist, create it and add the student details inside it
          data[academicYear] = {
            [registrationNumber]: studentDetails,
          };
          this.updateDataForApproval(studentDetails, academicYear)
        }

      },
      (error: any) => {
        console.error('Error fetching student data:', error);
      }
    );
  }

  updateDataForApproval(studentDetails: any, academicYear: string): void{
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const registrationNumber = studentDetails.registrationNumber;
  

    const approvalUrl = 'http://localhost:5984/sapas/Approval';

    this.http.get(approvalUrl, { headers }).subscribe(
      (data: any) => {
        if (data[academicYear]) {
          const yearData = data[academicYear];
          yearData[registrationNumber] = studentDetails;
          this.updateDocument(approvalUrl, data, headers);

          localStorage.setItem('registration',JSON.stringify(studentDetails));
          this.route.navigate(['/face-register']);
        } else {

          data[academicYear] = {
            [registrationNumber]: studentDetails,
          };

          this.updateDocument(approvalUrl, data, headers);
          localStorage.setItem('registration', JSON.stringify(studentDetails));
          this.route.navigate(['/face-register']);
        }

      },
      (error: any) => {
        console.error('Error fetching student data:', error);
      }
    );
  }


  faceUpdate(studentDetails: any, academicYear: string): void{

    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const registrationNumber = studentDetails.registrationNumber;


    this.http.get(this.faceUpdateUrl, { headers }).subscribe(
      (faceData: any) => {
        if (faceData[academicYear]) {
          const newYearData = faceData[academicYear];
          newYearData[registrationNumber] =
            this.createFaceUpdate(studentDetails);
        } else {
          faceData[academicYear] = {
            [registrationNumber]: this.createFaceUpdate(studentDetails),
          };
        }

        this.updateDocument(this.faceUpdateUrl, faceData, headers);
        
      },
      (error: any) => {
        console.error('Error fetching faceUpdate:', error);
      }
    );
  }

  updateDocument(url: string, data: any, headers: HttpHeaders) {
    this.http.put(url, data, { headers }).subscribe(
      (response: any) => {
        console.log('Student details added successfully:', response);
      },
      (error: any) => {
        console.error('Error adding student details:', error);
      }
    );
  }

  fetchBatchData(url: string): Observable<string[]> {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });
  
    return this.http.get<any>(url, { headers }).pipe(
      map((data: any) => {
        if (data) {
          let batches = Object.keys(data).filter((key) => !key.startsWith('_'));
          batches.reverse();
          return batches;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching batches:', error);
        return [];
      })
    );
  }

  updateFaceData(
    descriptor: any,
    registrationNumber: string,
    year: string
  ): void {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const approvalUrl = 'http://localhost:5984/sapas/Approval';

    this.http.get(approvalUrl, { headers }).subscribe(
      (data: any) => {
        data[year][registrationNumber].face = descriptor;

        this.updateDocument(approvalUrl, data, headers);
      },
      (error) => {
        console.log('Error fetching student data', error);
      }
    );
  }

  createFaceUpdate(studentDetails: any): FaceUpdate {
    let studentFaceUpdate: FaceUpdate = {
      name: studentDetails.firstName,
      faceUpdate: false,
      faceUpdateCount: 0,
      faceUpdatePortal: false,
    };

    return studentFaceUpdate;
  }


  validateInfoFromStaff(studentDetails: any): Observable<boolean> {
    const url = 'http://localhost:5984/sapas/StaffData';
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    return this.http.get<any>(url, { headers }).pipe(
      map(staffData => {
        // Iterate through staffData
        for (const staffId in staffData) {
          const staffInfo = staffData[staffId];
          // Compare email, phoneNumber, and alternatePhoneNumber with student details

          if(studentDetails.email === staffInfo.email){
            alert("Email Already Exists !")
            return true
          }
          else if(studentDetails.mobileNumber === staffInfo.phoneNumber ){
            alert("Mobile Number  already exists! Please use Some Other Mobile number.")
          }
          else if(studentDetails.alternateMobileNumber === staffInfo.alternatePhoneNumber){
            alert("Alternate Mobile Number already exists! Please use Some Other mobile number.")
          }
          else{
            return false
          }
        }
        // No match found
        return false;
      })
    );
  }
}
