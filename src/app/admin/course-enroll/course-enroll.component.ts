import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CouchDBService } from 'src/app/backend/couchDB/couch-db.service';

@Component({
  selector: 'app-course-enroll',
  templateUrl: './course-enroll.component.html',
  styleUrls: ['./course-enroll.component.scss'],
})
export class CourseEnrollComponent implements OnInit {
  selectedBatch: string = '';
  selectedSemester: string = '';
  subjectCode: string = '';
  subjectName: string = '';
  courses: any[] = [];
  batches: string[] = [];
  semesters: string[] = [];

  changes: string[] = []

  constructor(private http: HttpClient, private Couch: CouchDBService) { }

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

  fetchSemesterData() {
    if (!this.selectedBatch) {
      return;
    }
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });
  
    const url = `http://localhost:5984/sapas/Courses`;
  
    this.http.get<any>(url, { headers }).subscribe(
      (data: any) => {
        if (data[this.selectedBatch]) {
          this.semesters = Object.keys(data[this.selectedBatch])
        }
      },
      (error) => {
        console.error('Error fetching semesters:', error);
      }
    );
  }

  fetchCourse() {
    if (!this.selectedBatch || !this.selectedSemester) {
      return;
    }
  
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });
  
    const url = `http://localhost:5984/sapas/Courses`;
  
    this.http.get<any>(url, { headers }).subscribe(
      (data: any) => {
        if (data && data[this.selectedBatch] && data[this.selectedBatch][this.selectedSemester]) {
          this.courses = Object.entries(data[this.selectedBatch][this.selectedSemester]).map(([code, name]) => ({ code, name }));
        } else {
          this.courses = []; // Initialize courses as empty array if no data found
        }
      },
      (error) => {
        console.error('Error fetching courses:', error);
      }
    );
  }
  
  
  addCourse() {
    const course: any = {
      code: this.subjectCode,
      name: this.subjectName
    };
    this.courses.push(course);
    this.subjectCode = '';
    this.subjectName = '';
  }

  deleteCourse(course: any) {
    this.courses = this.courses.filter(c => c !== course);
  }

  submit() {
    if (!this.selectedBatch || !this.selectedSemester) {
      return;
    }
  
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
      'Content-Type': 'application/json' // Specify JSON content type
    });
  
    const url = `http://localhost:5984/sapas/Courses`;
  
    this.http.get<any>(url, { headers }).subscribe(
      (data: any) => {
        if (data) {
          data[this.selectedBatch][this.selectedSemester] = this.courses.reduce((acc, course) => {
            acc[course.code] = course.name;
            return acc;
          }, {});

          const newCourses = this.courses.reduce((acc, course) => {
            acc[course.code] = course.name;
            return acc;
          }, {});

          this.changes.push(`Changes for ${this.selectedBatch} ${this.selectedSemester}: ${JSON.stringify(newCourses)}`);
          this.Couch.updateDocument(url, data, headers);

          this.openModal()
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
      // Reset input fields
      this.selectedBatch = '';
      this.selectedSemester = '';
      this.subjectCode = '';
      this.subjectName = '';
      this.courses = [];
    }
  }


  
  
}
