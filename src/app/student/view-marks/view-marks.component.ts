import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StudentService } from '../student.service';
import { error } from 'jquery';

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

  constructor(private http: HttpClient, private stud: StudentService) {}

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


  calculateFullResults(markDetails: any[]): void {
    const resultTableData: any[] = [];
    let totalCreditHours = 0;
    let totalGradePoints = 0;

    for (const markDetail of markDetails) {
      const totalMarks = markDetail.internalMarks + markDetail.externalMarks;

      let gradePoints: number;
      let grade: string;

      // Determine grade points and grade using switch statement based on totalMarks
      switch (true) {
        case totalMarks > 90:
          gradePoints = 10;
          grade = 'O';
          break;
        case totalMarks > 80:
          gradePoints = 9;
          grade = 'A+';
          break;
        case totalMarks > 70:
          gradePoints = 8;
          grade = 'A';
          break;
        case totalMarks > 60:
          gradePoints = 7;
          grade = 'B+';
          break;
        case totalMarks > 50:
          gradePoints = 6;
          grade = 'B';
          break;
        case totalMarks == 50:
          gradePoints = 5;
          grade = 'C';
          break;
        default:
          gradePoints = 0;
          grade = 'F'; // Below 50% is Fail
          break;
      }

      let result = ''
      if(grade === "F") result = 'Fail'
      else result = 'Pass'


      const resultRow = {
        courseCode: markDetail.courseCode,
        courseName: markDetail.courseName,
        internalMarks: markDetail.internalMarks,
        externalMarks: markDetail.externalMarks,
        totalMarks: totalMarks,
        gradePoints: gradePoints,
        grade: grade,
        credit: markDetail.creditHours,
        result: result
      };

      resultTableData.push(resultRow);
      // Accumulate total credit hours and grade points
      totalCreditHours += markDetail.creditHours;
      totalGradePoints += gradePoints * markDetail.creditHours;
    }

    // Assign the calculated result table data to your component property
    this.finalResultTableData = resultTableData;

    let gpa = totalGradePoints / totalCreditHours;
    gpa = parseFloat(gpa.toFixed(2));

    this.finalResultTableData = resultTableData;
    this.gpa = String(gpa);

    this.fetchCgpa(gpa);
  }

  fetchCgpa(gpa: number): void {
    const currentCgpa = parseFloat(this.stud.studentData.cgpa) || 0;

    if (currentCgpa == 0 ) {
      this.cgpa = String(gpa);
    } else {
      let nowCgpa = ((currentCgpa + gpa)/2).toFixed(2)
      this.cgpa =  String(nowCgpa)
    }

    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });
    const url = 'http://localhost:5984/sapas/StudentData';

    this.http.get(url, { headers }).subscribe(
      (data: any) => {
        data[this.studentBatch][this.studentRegistrationNumber].cgpa =
          this.cgpa;
        this.http.put(url, data, { headers }).subscribe(
          (response: any) => {
            console.log('Successfully Updated CGPA');
          },
          (error) => {
            console.error('Error Updating CGPA', error);
          }
        );
      },
      (error) => {
        console.log('Error fetching student data', error);
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
}
