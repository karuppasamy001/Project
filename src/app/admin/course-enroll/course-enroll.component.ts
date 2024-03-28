import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CouchDBService } from 'src/app/backend/couchDB/couch-db.service';
import { AdminService } from '../admin.service';
import { Router } from '@angular/router';

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
  subjectCredit: string = '';
  courses: any[] = [];
  batches: string[] = [];
  semesters: string[] = [];

  changes: string[] = [];

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

          this.batches.reverse()
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
        if (data[this.selectedBatch][this.selectedSemester]) {
          this.courses = Object.entries<any[]>(data[this.selectedBatch][this.selectedSemester]).map(([code, [name, credit]]) => ({ code, name, credit }));
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
      name: this.subjectName,
      credit: this.subjectCredit
    };
    this.courses.push(course);
    this.subjectCode = '';
    this.subjectName = '';
    this.subjectCredit = '';
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
      'Content-Type': 'application/json', // Specify JSON content type
    });

    const coursesUrl = `http://localhost:5984/sapas/Courses`;
    const marksUrl = `http://localhost:5984/sapas/Marks`;
    const studentsUrl = `http://localhost:5984/sapas/StudentData`;

    // Fetch student registration numbers
    this.http.get<any>(studentsUrl, { headers }).subscribe(
      (studentsData: any) => {
        if (studentsData) {
          const studentRegistrationNumbers = Object.keys(studentsData[this.selectedBatch]);

          // Update Courses document
          this.http.get<any>(coursesUrl, { headers }).subscribe(
            (coursesData: any) => {
              if (coursesData) {
                const newCourses = this.courses.reduce((acc, course) => {
                  acc[course.code] = [course.name, course.credit];
                  return acc;
                }, {});

                coursesData[this.selectedBatch][this.selectedSemester] = newCourses;
                this.Couch.updateDocument(coursesUrl, coursesData, headers);

                // Update Marks document
                this.updateMarksDocument(newCourses, studentRegistrationNumbers, headers, marksUrl);
                this.openModal();
              }
            },
            (error) => {
              console.error('Error fetching courses:', error);
            }
          );
        }
      },
      (error) => {
        console.error('Error fetching student data:', error);
      }
    );
  }

  updateMarksDocument(newCourses: any, studentRegistrationNumbers: string[], headers: HttpHeaders, marksUrl: string) {
    this.http.get<any>(marksUrl, { headers }).subscribe(
      (marksData: any) => {
        if (marksData) {
          if (!marksData[this.selectedBatch]) {
            marksData[this.selectedBatch] = {};
          }
          if (!marksData[this.selectedBatch][this.selectedSemester]) {
            marksData[this.selectedBatch][this.selectedSemester] = {};
          }

          // Initialize marks for new courses and students in the Marks document
          Object.keys(newCourses).forEach((code) => {
            marksData[this.selectedBatch][this.selectedSemester][code] = {
              cat1: {},
              cat2: {},
              finalResult: {},
            };

            studentRegistrationNumbers.forEach((registrationNumber) => {
              // Initialize cat1 and cat2 with mark and assignment fields
              marksData[this.selectedBatch][this.selectedSemester][code]['cat1'][registrationNumber] = { mark: null, assignment: null };
              marksData[this.selectedBatch][this.selectedSemester][code]['cat2'][registrationNumber] = { mark: null, assignment: null };
              // Initialize finalResult with only mark field
              marksData[this.selectedBatch][this.selectedSemester][code]['finalResult'][registrationNumber] = null;
            });
          });

          // Remove entries for deleted subjects
          Object.keys(marksData[this.selectedBatch][this.selectedSemester]).forEach((code) => {
            if (!newCourses[code]) {
              delete marksData[this.selectedBatch][this.selectedSemester][code];
            }
          });

          marksData[this.selectedBatch][this.selectedSemester].publishResult = false

          console.log("this is marks data",marksData)

          this.Couch.updateDocument(marksUrl, marksData, headers);
        }
      },
      (error) => {
        console.error('Error fetching marks:', error);
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
