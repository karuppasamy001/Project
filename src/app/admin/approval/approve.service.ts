import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CouchDBService } from 'src/app/backend/couchDB/couch-db.service';

@Injectable({
  providedIn: 'root'
})
export class ApproveService {

  currentYear: string = new Date().getFullYear().toString();
  approvalUrl: string = 'http://localhost:5984/sapas/Approval';


  
  getApprovalList() : Observable<any> {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    return this.http.get(this.approvalUrl, { headers });

  }

  removeApproval(registrationNumber: any) {

    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    this.http.get(this.approvalUrl, {headers}).subscribe(
      (data: any) => {
        const studentLists = data[this.currentYear]
        delete studentLists[registrationNumber]

        console.log(studentLists)
        data[this.currentYear] = studentLists
        this.couch.updateDocument(this.approvalUrl, data, headers)
        window.location.reload()
      },
      (error) => {
        console.error("Error fetching approval list", error)
      }
    )
  }


  addOrUpdateStudentDetails(studentDetails: any, academicYear: string) {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const registrationNumber = studentDetails.registrationNumber;
  

    const Url = 'http://localhost:5984/sapas/StudentData';

    this.http.get(Url, { headers }).subscribe(
      (data: any) => {
        if (data[academicYear]) {
          const yearData = data[academicYear];
          yearData[registrationNumber] = studentDetails;
          console.log(yearData)
          this.couch.updateDocument(Url, data, headers);
          this.removeApproval(registrationNumber)

        } else {

          data[academicYear] = {
            [registrationNumber]: studentDetails,
          };

          this.couch.updateDocument(Url, data, headers);
 
        }

      },
      (error: any) => {
        console.error('Error fetching student data:', error);
      }
    );

  }

  constructor(private http: HttpClient, private couch: CouchDBService) { }
}
