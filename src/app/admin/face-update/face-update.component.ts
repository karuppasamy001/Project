import { CouchDBService } from './../../backend/couchDB/couch-db.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { AdminService } from '../admin.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-face-update',
  templateUrl: './face-update.component.html',
  styleUrls: ['./face-update.component.scss'],
})
export class FaceUpdateComponent implements OnInit {
  students: any[] = [];
  originalStudents: any[] = [];
  statusFilter: string = 'all';
  filteredStudents: any[] = [];
  selectedStudents: Set<string> = new Set();
  checked: boolean = false;
  selectedBatch: string = '';
  batches: string[] = [];
  studentsCheck: any[] = []
  searchTerm: string = '';
  searchControl: FormControl = new FormControl();
  searchButton: boolean = false


  selectedStudentsName: any[] = []

  constructor(private http: HttpClient, private Couch: CouchDBService, private admin: AdminService, private router: Router) {
    if(!admin.isAuthenticated()) router.navigate(['/login'])
  }

  ngOnInit(): void {
    this.fetchBatches();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Delay processing of user input by 300 milliseconds
        distinctUntilChanged(), // Only emit if the value has changed since the last event
        switchMap((searchTerm) => {
          this.searchTerm = searchTerm.trim();
          return of(this.filterStudents());
        })
      )
      .subscribe();
  }

  fetchBatches() {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const url = 'http://localhost:5984/sapas/FaceUpdate';

    this.http.get<any>(url, { headers }).subscribe(
      (data: any) => {
        if (data) {
          this.batches = Object.keys(data).filter(
            (key) => !key.startsWith('_')
          ).reverse(); 
          this.selectedBatch = this.batches[0]; // Select the first batch by default

          this.fetchStudentData(); // Fetch student data for the selected batch
        }
      },
      (error) => {
        console.error('Error fetching batches:', error);
      }
    );
  }

  fetchStudentData() {
    if (!this.selectedBatch) {
      return; // No batch selected, do nothing
    }
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    this.http
      .get<any>('http://localhost:5984/sapas/FaceUpdate', { headers })
      .subscribe(
        (data: any) => {
          // Assuming your CouchDB data is in the format { year: { registrationNumber: studentData } }
          const currentYear = this.selectedBatch;
          if (data[currentYear]) {
            this.originalStudents = Object.keys(data[currentYear]).map(
              (registrationNumber) => ({
                registrationNumber,
                ...data[currentYear][registrationNumber],
                checked: false,
              })
            );
            this.applyStatusFilter();
          }
        },
        (error) => {
          console.error('Error fetching student data:', error);
        }
      );
  }

  applyStatusFilter() {
    if (this.statusFilter === 'all') {
      this.students = [...this.originalStudents];
      this.studentsCheck = [...this.originalStudents]
    } else {
      // this.fetchStudentData();
      this.students = this.originalStudents.filter((student) => {
        if (this.statusFilter === 'updated') {
          return student.faceUpdate === true;
        } else if (this.statusFilter === 'not-updated') {
          return student.faceUpdate === false;
        }
        return false; // Add this return statement
      });

      this.studentsCheck = [...this.students]
    }
  }

  filterStudents() {
    // If the search term is empty, show all students
    if (!this.searchTerm) {
      this.filteredStudents = [...this.students];
      return;
    }
  
    // Filter students whose registration number contains the search term
    this.filteredStudents = this.students.filter(
      (student) =>
        student.registrationNumber && // Check if registrationNumber is defined
        student.registrationNumber.toLowerCase().includes(this.searchTerm)
    );
  }


  toggleSelection(registrationNumber: string) {
    if (this.selectedStudents.has(registrationNumber)) {
      this.selectedStudents.delete(registrationNumber);
    } else {
      this.selectedStudents.add(registrationNumber);
    }
  }

  updateStatus() {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const currentYear = this.selectedBatch;
    const updatedStudents = this.students.map((student) => {
      if (this.selectedStudents.has(student.registrationNumber)) {
        return { ...student, faceUpdatePortal: true };
      }
      return student;
    });

    console.log(updatedStudents);

    const updatedData = {
      ...this.originalStudents.reduce((acc, student) => {
        acc[student.registrationNumber] = student;
        return acc;
      }, {}),
      ...updatedStudents.reduce((acc, student) => {
        acc[student.registrationNumber] = student;
        return acc;
      }, {}),
    };


    const selectedStudentNames = this.students
    .filter((student) => this.selectedStudents.has(student.registrationNumber))
    .map((student) => ({ name: student.name }));

    this.selectedStudentsName = selectedStudentNames
  

      this.studentsCheck.forEach((student) => {
        student.checked = false;
        this.selectedStudents.delete(student.registrationNumber); // Remove all students when deselecting all
      });
      this.checked = false;


    const url = 'http://localhost:5984/sapas/FaceUpdate';

    this.http.get<any>(url, { headers }).subscribe(
      (data: any) => {
        if (data) {
          data[currentYear] = updatedData;
          this.Couch.updateDocument(url, data, headers);
        }
      },
      (error) => {
        console.error('Error fetching batches:', error);
      }
    );


    this.openModal()
    
  }


  selectAllStudents() {
    if (this.checked) {
      this.originalStudents.forEach((student) => {
        student.checked = false;
        this.selectedStudents.delete(student.registrationNumber);
      });
      this.checked = false;
    } else {
      this.originalStudents.forEach((student) => {
        student.checked = true;
        this.selectedStudents.add(student.registrationNumber);
      });
      this.checked = true;
    }

    console.log(this.students)
  }


  searchStudent(){

    if(this.searchTerm == ""){
      this.students = [...this.originalStudents]
    }

    this.students = this.originalStudents.filter((student) => {
      return student.registrationNumber === this.searchTerm
    });
    
  }

  resetSearch() {
    this.applyStatusFilter()
  }
  

  
  openModal() {
    const modal = document.getElementById("faceUpdateModal")
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  closeModal() {
    const modal = document.getElementById("faceUpdateModal")
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

}
