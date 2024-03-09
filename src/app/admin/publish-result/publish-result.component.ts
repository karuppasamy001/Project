import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CouchDBService } from 'src/app/backend/couchDB/couch-db.service';
import { AdminService } from '../admin.service';
import { error } from 'jquery';

@Component({
  selector: 'app-publish-result',
  templateUrl: './publish-result.component.html',
  styleUrls: ['./publish-result.component.scss'],
})
export class PublishResultComponent implements OnInit{
  semesters: any[] = []
  batches!: any[];
  selectedSemester!: string;
  selectedBatch: any;
  submitButton! : boolean;

  constructor(private http: HttpClient, private Couch: CouchDBService, private admin: AdminService, private router: Router) {
    if (!admin.isAuthenticated()) router.navigate(['/login'])
  }


 ngOnInit(): void {
    this.fetchBatchData();
  }

  fetchBatchData() {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const url = 'http://localhost:5984/sapas/Courses';

    this.http.get<any>(url, { headers }).subscribe(
      (data: any) => {
        if (data) {
          this.batches = Object.keys(data).filter(
            (key) => !key.startsWith('_')
          );
        }
      },
      (error) => {
        console.error('Error fetching batches:', error);
      }
    );
  }


  publishResult(): void{
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const url = 'http://localhost:5984/sapas/Marks';

    this.http.get(url, {headers}).subscribe(
      (data: any) => {
        data[this.selectedBatch][this.selectedSemester]["publishResult"] = true

        this.http.put(url, data, {headers}).subscribe(
          (response: any) =>{
            console.log("Result Published for ", this.selectedSemester)
          },
          (error) =>{
            console.error("Error updating Marks data", error)
          }
        )
      },
      (error) => {
        console.log("Error Fetching Marks Data", error)
      }
    )

  }
  

  fetchSemesterData() {
    this.semesters = ['Semester1', 'Semester2', 'Semester3', 'Semester4'];
    this.submitButton = false
  }

  fetchCourse() {
    this.submitButton = true
  }
}
