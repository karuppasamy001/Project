import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-view-marks',
  templateUrl: './view-marks.component.html',
  styleUrls: ['./view-marks.component.scss']
})
export class ViewMarksComponent implements OnInit {

  studentName: string = ""

  selectedSemester: string = 'Semester1';
  selectedAssessment: string = 'cat1';
  semesters: string[] = ['Semester1']; // Add other semesters if needed
  assessments = [
    { label: 'CAT 1', value: 'cat1' },
    { label: 'CAT 2', value: 'cat2' },
    { label: 'Final Assessment', value: 'finalAssessment' },
    { label: 'View Full Results', value: 'viewFullResults' }
  ];
  tableHeaders: string[] = ['Course Code', 'Course Name'];
  tableData: any[] = [];
  gpa: string = '';
  cgpa: string = '';


  constructor(private http: HttpClient, private stud: StudentService) {
  }

  ngOnInit(): void {
    this.fetchData();
    this.studentName = this.stud.studentData.firstName

  }

  fetchData(): void {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });
    const url = 'http://localhost:5984/sapas/Marks';
    this.http.get<any>(url, { headers }).subscribe(
      data => {
        this.processData(data);
      },
      error => {
        console.log('Error fetching data:', error);
      }
    );
  }

  processData(data: any): void {
    
  }

  onSemesterChange(): void {
    this.fetchData();
  }

  onAssessmentChange(): void {
    this.fetchData();
  }
}
