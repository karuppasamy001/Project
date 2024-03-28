import { Router } from '@angular/router';
import { Component,  OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-view-marks',
  templateUrl: './view-marks.component.html',
  styleUrls: ['./view-marks.component.scss'],
})
export class ViewMarksComponent implements OnInit {

  studentName: string = '';
  studentRegistrationNumber: string = '';
  finalResults: boolean = false;
  selectedSemester: string = '';
  selectedAssessment: string = '';
  normalResult: boolean = false
  semesters = [
    { label: 'Semester 1', value: 'Semester1' },
    { label: 'Semester 2', value: 'Semester2' },
    { label: 'Semester 3', value: 'Semester3' },
    { label: 'Semester 4', value: 'Semester4' },
  ];

  assessments: any[] = [];
  tableData: any[] = [];
  finalResultTableData: any[] = [];
  gpa: string = '';
  cgpa: string = '';
  studentBatch!: string;
  courseList: any;
  markList: any;
  resultPublished: boolean = false

  constructor(private http: HttpClient, private stud: StudentService, private router: Router) {}

  ngOnInit(): void {
    this.studentName = this.stud.studentData.firstName;
    this.studentBatch = this.stud.studentData.batch;
    this.studentRegistrationNumber = this.stud.studentData.registrationNumber;
  }

  onAssessmentChange(): void {
    this.finalResults = false
    this.normalResult = true
    this.resultPublished = false

    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });
    const courseUrl = 'http://localhost:5984/sapas/Courses';
    const markUrl = 'http://localhost:5984/sapas/Marks';

    this.http.get(markUrl, { headers }).subscribe(
      (data: any) => {
        this.markList = data[this.studentBatch][this.selectedSemester];
        this.http.get(courseUrl, { headers }).subscribe(
          (course: any) => {
            this.courseList = Object.entries(
              course[this.studentBatch][this.selectedSemester]
            );

            this.processData();
          },
          (error) => {
            console.log('Error fetching data:', error);
          }
        );
      },
      (error) => {
        console.log('Error fetching data:', error);
      }
    );
  }

  processData(): void {
    this.tableData = [];

    for (let i of this.courseList) {
      let newRow: any = {}; // You can also specify a more specific type if you know the structure of newRow
      const courseCode = i[0];
      const courseName = i[1][0];
      const assessmentData =
        this.markList[courseCode][this.selectedAssessment][
          this.studentRegistrationNumber
        ];

      newRow.courseCode = courseCode;
      newRow.courseName = courseName;

      if (this.selectedAssessment === 'finalResult') {
        newRow.mark = assessmentData;
      } else {
        newRow.mark = assessmentData.mark;
        newRow.assignment = assessmentData.assignment;
      }

      this.tableData.push(newRow);
    }
  }


  fetchFullResults(): void {
    this.normalResult = false

    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });
    
    const markUrl = 'http://localhost:5984/sapas/Marks';
    const resultUrl = 'http://localhost:5984/sapas/Result';
    const studentUrl = 'http://localhost:5984/sapas/StudentData';


    this.http.get(markUrl, { headers }).subscribe(
      (data: any) => {
        const semester = data[this.studentBatch][this.selectedSemester];

        const isPublished = data[this.studentBatch][this.selectedSemester]["publishResult"]

        if(!isPublished){
          this.resultPublished = true
        }
        else{
          this.finalResults = true
          this.http.get(resultUrl, {headers}).subscribe(
            (result : any) => {
              const resultData = result[this.studentBatch][this.selectedSemester][this.studentRegistrationNumber].results;
              this.finalResultTableData = resultData

              this.gpa = result[this.studentBatch][this.selectedSemester][this.studentRegistrationNumber].gpa
              
              this.http.get(studentUrl, {headers}).subscribe(
                (student: any) => {
                  this.cgpa = student[this.studentBatch][this.studentRegistrationNumber].cgpa
                }, 
                (error) => {
                  console.error("Error in getting Student Data", error);
                }
              )
            },
            (error) => {
              console.error("Error getting Result from DB", error);
            }
          )
        }
      },
      (error) => {
        console.error('Error Fetching Data for  Full Result', error);
      }
    );
  }
  onSemesterChange(): void {
    this.assessments = []
    this.assessments = [
      { label: 'CAT 1', value: 'cat1' },
      { label: 'CAT 2', value: 'cat2' },
      { label: 'Final Assessment', value: 'finalResult' },
    ];
    this.selectedAssessment = '';
    this.tableData = [];
    this.finalResultTableData = [];
    this.resultPublished = false
    this.finalResults = false
    this.normalResult = false
   
  }

  

  onPrint(): void {
    this.stud.printData = this.finalResultTableData
    this.stud.gpa = this.gpa
    this.stud.cgpa = this.cgpa

    this.router.navigate(['/print-result'])
  }
}
