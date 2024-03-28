import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CouchDBService } from 'src/app/backend/couchDB/couch-db.service';
import { AdminService } from '../admin.service';
import { data, error } from 'jquery';

@Component({
  selector: 'app-publish-result',
  templateUrl: './publish-result.component.html',
  styleUrls: ['./publish-result.component.scss'],
})
export class PublishResultComponent implements OnInit {
  semesters: any[] = [];
  batches!: any[];
  selectedSemester!: string;
  selectedBatch: any;
  submitButton!: boolean;
  courseList: any[] = [];
  studentList: any[] = [];

  constructor(
    private http: HttpClient,
    private Couch: CouchDBService,
    private admin: AdminService,
    private router: Router
  ) {
    if (!admin.isAuthenticated()) router.navigate(['/login']);
  }

  ngOnInit(): void {
    this.fetchBatchData();
  }
  
  fetchBatchData() {
    const url = 'http://localhost:5984/sapas/Courses';
    this.Couch.fetchBatchData(url)
  }

  publishResult(): void {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const url = 'http://localhost:5984/sapas/Marks';

    this.http.get(url, { headers }).subscribe(
      (data: any) => {
        const marksData = data[this.selectedBatch][this.selectedSemester];
        const isAllMarksAdded = this.validateMarks(marksData);

        if (isAllMarksAdded) {
          marksData['publishResult'] = true;

          this.result(marksData);

          this.http.put(url, data, { headers }).subscribe(
            (response: any) => {
              console.log('Result Published for ', this.selectedSemester);
              this.openModal();
            },
            (error) => {
              console.error('Error updating Marks data', error);
            }
          );
        } else {
          alert('Not all marks have been updated.');
        }
      },
      (error) => {
        console.log('Error Fetching Marks Data', error);
      }
    );
  }

  result(marksData: any): void {
    
    const studentResultTable: any = {}
    for (let studentRegistrationNumber of this.studentList) {
      
      let sampleFinalResult: any[] = [];
      let totalCreditHours = 0;
      let totalGradePoints = 0;

      for (let i of this.courseList) {
        let newRow: any = {};

        const courseCode = i[0];
        const courseName = i[1][0];
        const cat1Data =
          marksData[courseCode]['cat1'][studentRegistrationNumber];
        const cat2Data =
          marksData[courseCode]['cat2'][studentRegistrationNumber];
        const externalMarks =
          marksData[courseCode]['finalResult'][studentRegistrationNumber];
        const credit = parseFloat(i[1][1]);

        if(cat1Data.mark === 'AB') cat1Data.mark = 0
        if(cat2Data.mark === 'AB') cat2Data.mark = 0

        const cat1Marks = parseFloat(cat1Data.mark) + parseFloat(cat1Data.assignment);
        const cat2Marks = parseFloat(cat2Data.mark) + parseFloat(cat2Data.assignment);

        let updatedExternalMarks = 0

        const internalMarks = Math.ceil(((cat1Marks + cat2Marks) / 200) * 40);

        if(externalMarks !== 'AB') {
          updatedExternalMarks = Math.ceil(
            (parseFloat(externalMarks) / 100) * 60
          );
        }

        newRow.courseCode = courseCode;
        newRow.courseName = courseName;
        newRow.internalMarks = internalMarks;
        newRow.externalMarks = updatedExternalMarks
        newRow.creditHours = credit;

      
        const totalMarks = internalMarks + updatedExternalMarks;

        newRow.totalMarks = totalMarks

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

      
      newRow.gradePoints = gradePoints
      newRow.grade = grade
      newRow.result = result

      // Accumulate total credit hours and grade points
      totalCreditHours += credit;
      totalGradePoints += gradePoints * credit;

      sampleFinalResult.push(newRow);

      }
      let gpa = totalGradePoints / totalCreditHours;
      gpa = parseFloat(gpa.toFixed(2));
      const results = sampleFinalResult
      studentResultTable[studentRegistrationNumber] = {results, gpa}
    }

    console.log(studentResultTable)
    this.uploadResultDocument(studentResultTable)
    this.updateCGPA(studentResultTable)

  }

  uploadResultDocument(studentResultTable: any): void {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const url = 'http://localhost:5984/sapas/Result';

    this.http.get(url, {headers}).subscribe(
      (data: any) => {
        const batch = data[this.selectedBatch]
        if(batch) {
          data[this.selectedBatch][this.selectedSemester] = studentResultTable
        }
        else{
          data[this.selectedBatch] = {
            "Semester1" : {},
            "Semester2" : {},
            "Semester3" : {},
            "Semester4" : {}
          }

          data[this.selectedBatch][this.selectedSemester] = studentResultTable
        }


        this.http.put(url, data, {headers}).subscribe(
          (response :  any) => {
            console.log("Data uploaded successfully", response)
          },
          (error) => {
            console.error("Error uploading result data", error)
          }
        )
      },
      (error) => {
        console.error("Error Fetching Result data", error)
      }
    )
  }

  updateCGPA(studentResult: any): void {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });
  
    const url = 'http://localhost:5984/sapas/StudentData';
  
    this.http.get(url, { headers }).subscribe(
      (data: any) => {
        for (const studentId of Object.keys(studentResult)) {
          const studentData = data[this.selectedBatch][studentId];
          const semester = this.selectedSemester.slice(-1); // Extract semester number from selected semester
          data[this.selectedBatch][studentId].currentSem = parseInt(semester) + 1
  
          // Update the GPA for the corresponding semester
          studentData[`sem${semester}Gpa`] = studentResult[studentId].gpa;
  
          // Calculate the total GPA and count of non-empty GPAs
          let totalGPA = 0;
          let gpaCount = 0;
  
          for (let i = 1; i <= 4; i++) {
            const gpaKey = `sem${i}Gpa`;
            if (studentData[gpaKey] !== "") {
              totalGPA += parseFloat(studentData[gpaKey]);
              gpaCount++;
            }
          }
  
          // Calculate CGPA
          const cgpa = (totalGPA / gpaCount).toFixed(2);
          studentData['cgpa'] = cgpa;
        }
  
        // Update the data on the server
        this.http.put(url, data, { headers }).subscribe(
          (response: any) => {
            console.log("CGPA and GPA updated", response);
          },
          (error) => {
            console.error("Error updating GPA and CGPA", error);
          }
        );
      },
      (error) => {
        console.error("Error fetching student Data", error);
      }
    );
  }
  

  validateMarks(marksData: any): boolean {
    const courseCodes = Object.keys(marksData);

    for (const courseCode of courseCodes) {
      const courseMarks = marksData[courseCode];
      if (
        !this.isAllMarksAdded(courseMarks['cat1']) ||
        !this.isAllMarksAdded(courseMarks['cat2']) ||
        !this.isAllMarksAddedFinalSem(courseMarks['finalResult'])
      ) {
        return false;
      }
    }

    return true;
  }

  isAllMarksAdded(marks: any): boolean {
    for (const studentId in marks) {
      if (
        marks[studentId]['mark'] === null ||
        marks[studentId]['mark'] === ''
      ) {
        return false;
      }
    }
    return true;
  }

  isAllMarksAddedFinalSem(marks: any): boolean {
    for (const studentId in marks) {
      if (marks[studentId] === null || marks[studentId] === '') {
        return false;
      }
    }
    return true;
  }

  fetchSemesterData() {
    this.semesters = ['Semester1', 'Semester2', 'Semester3', 'Semester4'];
    this.submitButton = false;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    this.http
      .get('http://localhost:5984/sapas/StudentData', { headers })
      .subscribe(
        (data: any) => {
          this.studentList = Object.keys(data[this.selectedBatch]);
        },
        (error) => {
          console.error('Error fetching student data', data);
        }
      );
  }

  fetchCourse() {
    this.submitButton = true;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const url = 'http://localhost:5984/sapas/Courses';

    this.http.get<any>(url, { headers }).subscribe(
      (data: any) => {
        if (data) {
          this.courseList = Object.entries(
            data[this.selectedBatch][this.selectedSemester]
          );
        }
      },
      (error) => {
        console.error('Error fetching batches:', error);
      }
    );
  }

  openModal() {
    const modal = document.getElementById('myModal');
    if (modal) {
      modal.style.display = 'block'; // Display the modal
    }
  }

  closeModal() {
    const modal = document.getElementById('myModal');
    if (modal) {
      modal.style.display = 'none'; // Hide the modal
      this.router.navigate(['/admin']);
    }
  }
}
