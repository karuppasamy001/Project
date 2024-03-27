import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-toppers',
  templateUrl: './toppers.component.html',
  styleUrls: ['./toppers.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateX(0)'
      })),
      transition(':enter', [
        style({
          transform: 'translateX(-100%)'
        }),
        animate('0.3s ease-out')
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({
          transform: 'translateX(100%)'
        }))
      ])
    ])
  ]
})
export class ToppersComponent implements OnInit {
  topStudents2023: any[] = [];
  topStudents2024: any[] = [];
  showBatch2023: boolean = true;
  showBatch2024: boolean = false;
  valid2023: boolean = true
  valid2024: boolean = true

  invalidBatchMessage: string = "Currently No Result is Updated"

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });
    const url = 'http://localhost:5984/sapas/StudentData';
  
    this.http.get(url, { headers }).subscribe(
      (data: any) => {
        const student2023 = Object.values(data['2023']);
        const student2024 = Object.values(data['2024']);

        const hasValidCGPA2023 = student2023.some((student: any) => student.batch === '2023' && student.cgpa !== "" && student.cgpa !== null);

        const hasValidCGPA2024 = student2024.some((student: any) => student.batch === '2024' && student.cgpa !== "" && student.cgpa !== null);
  
        // Sort students for batch 2023

        if(hasValidCGPA2023){
          this.topStudents2023 = student2023
          .filter((student: any) => student.batch === '2023')
          .sort((a: any, b: any) => parseFloat(b.cgpa) - parseFloat(a.cgpa)) // Convert cgpa to numbers and sort
          .slice(0, 3);
        }else this.valid2023 = false
        
        
  
        // Sort students for batch 2024

        if(hasValidCGPA2024){
          this.topStudents2024 = student2024
          .filter((student: any) => student.batch === '2024')
          .sort((a: any, b: any) => parseFloat(b.cgpa) - parseFloat(a.cgpa)) // Convert cgpa to numbers and sort
          .slice(0, 3);
        }else this.valid2024 = false
        
      },
      (error: any) => {
        console.error('Error fetching student data:', error);
      }
    );
  
    // Toggle batches every 5 seconds
    setInterval(() => {
      this.showBatch2023 = !this.showBatch2023;
      this.showBatch2024 = !this.showBatch2024;
    }, 5000);
  }


  fetchImage(photo: any): string {

    
    const attachmentData=photo._attachments.filename.data
    const contentType=photo._attachments.filename.content_type
    return ('data:' + contentType + ';base64,' + attachmentData);

  


   
  }
  
}
