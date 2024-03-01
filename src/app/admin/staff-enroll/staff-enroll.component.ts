import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-staff-enroll',
  templateUrl: './staff-enroll.component.html',
  styleUrls: ['./staff-enroll.component.scss'],
})
export class StaffEnrollComponent implements OnInit {
  selectedStaffId!: string;
  selectedBatch!: string;
  selectedCourse!: string;
  staffList: any[] = [];
  batchList: string[] = [];
  courseList: any[] = [];
  selectedStaff: any;
  enrolledCourses: any[] = [];

  constructor(private http: HttpClient, private router: Router, private admin: AdminService ) {
    if(!admin.isAuthenticated()) router.navigate(['/login'])
  }

  ngOnInit(): void {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    // Fetch staff list
    this.http.get<any>('http://localhost:5984/sapas/StaffData', { headers }).subscribe(
      (data: any) => {
        const filteredData = Object.keys(data).reduce((acc: any, key: string) => {
          if (key !== '_id' && key !== '_rev') {
            acc.push(data[key]);
          }
          return acc;
        }, []);
        this.staffList = filteredData;
      },
      (error) => {
        console.error('Error fetching staff list:', error);
      }
    );

    // Fetch batch list
    this.http.get('http://localhost:5984/sapas/Courses', { headers }).subscribe(
      (data: any) => {
        this.batchList = Object.keys(data).filter((key: string) => !key.startsWith('_'));
      },
      (error) => {
        console.error('Error fetching batch list:', error);
      }
    );
  }

  onStaffChange(): void {
    this.selectedStaff = this.staffList.find((staff) => staff.staffId === this.selectedStaffId);
    const url = "http://localhost:5984/sapas/StaffEnroll"
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    this.http.get(url, { headers }).subscribe(
      (data: any) => {
        const enrolledLists = data[this.selectedStaffId]
        console.log(enrolledLists)
        this.enrolledCourses = Object.entries(enrolledLists).map(([code, name]) => ({ code, name }));

      },
      (error) => {
        console.error('Error fetching batch list:', error);
      }
    );

  }

  onBatchChange(): void {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    this.http.get<any>('http://localhost:5984/sapas/Courses', { headers }).subscribe(
      (data: any) => {
        const courses = data[this.selectedBatch];
        const courseLists = { ...courses["Semester1"], ...courses["Semester2"], ...courses["Semester3"], ...courses["Semester4"]}
        
        // Filter out courses that are already enrolled
        const nonEnrolledCourses = Object.entries(courseLists).filter(([code, _]) => !this.enrolledCourses.some(course => course.code === code));
        
        // Map filtered courses to course list
        this.courseList = nonEnrolledCourses.map(([code, name]) => ({ code, name }));
      },
      (error) => {
        console.error('Error fetching course list:', error);
      }
    );
}


  submitEnrollment(): void {
    const enrolledCourse = this.courseList.find((course) => course.code === this.selectedCourse);
    if (enrolledCourse) {
      this.enrolledCourses.push(enrolledCourse);
      // Remove enrolled course from courseList

      this.courseList = this.courseList.filter((course) => course.code !== this.selectedCourse);
    }
  }

  deleteCourse(courseCode: string): void {
    // Add course back to courseList
    const course = this.enrolledCourses.find((c) => c.code === courseCode);
    if (course) {
      this.courseList.push(course);
      // Remove course from enrolledCourses
      this.enrolledCourses = this.enrolledCourses.filter((c) => c.code !== courseCode);
    }
  }


  submitEnrolledCourses(): void{
    const enrolledCoursesObject = this.enrolledCourses.reduce((acc, course) => {
      acc[course.code] = course.name;
      return acc;
    }, {});

    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const url = 'http://localhost:5984/sapas/StaffEnroll';

    this.http.get(url, { headers }).subscribe(
      (data: any) => {
        data[this.selectedStaffId] = enrolledCoursesObject

        this.http.put(url, data,  {headers}).subscribe(
          (response : any) => {
            console.log("Updated  Staff Enrollments");
            this.openModal()
          },
          (error) => {
            console.error("Error Updating Staff Enrollment", error);
          }
        )
      },
      (error) => {
        console.error('Error fetching course list:', error);
      }
    );
    
  }

  openModal() {
    const modal = document.getElementById('myModal');
    modal!.classList.add('show');
    modal!.style.display = 'block';
    document.body.classList.add('modal-open');
  }

  closeModal() {
    const modal = document.getElementById('myModal');
    modal!.classList.remove('show');
    modal!.style.display = 'none';
    document.body.classList.remove('modal-open');

    window.location.reload()
  }

  preventClose(event: any) {
    event.stopPropagation();
  }


  
}
