import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AdminService } from '../admin.service';
import { Observable, map, catchError, of } from 'rxjs';



@Component({
  selector: 'app-staff-registration',
  templateUrl: './staff-registration.component.html',
  styleUrls: ['./staff-registration.component.scss'],
})
export class StaffRegistrationComponent implements OnInit {



  registerForm!: FormGroup;
  qualifications: string[] = ['Graduate', 'PostGraduate', 'B-ED'];
  submitted: boolean = false;
  password: string = '';
  username: string = '';
  error: boolean = false;
  errorMessage: string = '';
  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private admin: AdminService,
  ) {
    if (!admin.isAuthenticated()) router.navigate(['/login']);

    this.registerForm = this.formBuilder.group({
      staffName: ['', Validators.required],
      gender: ['male', Validators.required],
      dateOfBirth: ["", Validators.required],      
      phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      alternatePhoneNumber: ['', [Validators.minLength(10), Validators.maxLength(10)]],
      email: ['',[ Validators.required, Validators.email]],
      qualification: ['', Validators.required],
      currentPost: ['Assistant Professor', Validators.required],
    });


  }
  ngOnInit(): void {
    // this.openModal()
  }
  
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.checkDetailsFromStudentData(this.registerForm.value).subscribe(
        (validationFromStudentData) => {
          if (validationFromStudentData) {
            this.error = true;
            this.errorMessage =
              'The Email id or Phone number already exists in our Student Data.';
            this.openModal();
          } else {
            // Your existing code for handling staff registration
            const url = 'http://localhost:5984/sapas/StaffData';
            const headers = new HttpHeaders({
              Authorization: 'Basic ' + btoa('admin:admin'),
            });

            // Prepare data to be uploaded
            let dataToUpload = { ...this.registerForm.value };

            // Check length of document
            this.http.get(url, { headers }).subscribe(
              (data: any) => {
                let documentLength: any = Object.keys(data).length - 1; // Exclude _id and _rev

                // Generate staffId
                if (documentLength < 10)
                  documentLength = '0' + String(documentLength);
                else documentLength = String(documentLength);

                const staffId = '6523' + documentLength;

                // Check if staffId, phoneNumber, and email already exist
                const idExists = data.hasOwnProperty(staffId);
                const phoneExists = Object.values(data).some(
                  (staff: any) =>
                    staff.phoneNumber === this.registerForm.value.phoneNumber
                );
                const emailExists = Object.values(data).some(
                  (staff: any) => staff.email === this.registerForm.value.email
                );

                if (!idExists && !phoneExists && !emailExists) {
                  // Add staffId and password to data
                  this.error = false;
                  const generatedPassword = this.generatePassword();
                  this.password = generatedPassword;
                  this.username = this.registerForm.value.email;
                  data[staffId] = {
                    ...dataToUpload,
                    staffId: staffId,
                    password: generatedPassword,
                  };
                  console.log(data);

                  // Upload data to CouchDB
                  this.http.put(url, data, { headers }).subscribe(
                    (response: any) => {
                      console.log(
                        'Staff details added successfully:',
                        response
                      );
                      this.registerForm.reset();
                      this.http
                        .get('http://localhost:5984/sapas/StaffEnroll', {
                          headers,
                        })
                        .subscribe(
                          (data: any) => {
                            data[staffId] = {
                              Semester1: {},
                              Semester2: {},
                              Semester3: {},
                              Semester4: {},
                            };

                            this.http
                              .put(
                                'http://localhost:5984/sapas/StaffEnroll',
                                data,
                                { headers }
                              )
                              .subscribe(
                                (response: any) => {
                                  console.log('Staff Enroll Updated');
                                },
                                (error) => {
                                  console.error(
                                    'Error Updating staff Enroll',
                                    error
                                  );
                                }
                              );
                          },
                          (error) => {
                            console.error('Error fetching staff Enroll', error);
                          }
                        );
                      this.openModal();
                    },
                    (error: any) => {
                      console.error('Error adding staff details:', error);
                    }
                  );
                } else {
                  console.error(
                    'StaffId, phoneNumber, or email already exists.'
                  );
                  this.error = true;
                  this.errorMessage = 'Email or phoneNumber is already exists';
                  this.openModal();
                  // Handle error: StaffId, phoneNumber, or email already exists
                }
              },
              (error) => {
                console.error('Error fetching data:', error);
                // Handle error
              }
            );
          }
        }
      );
    } else {
      // Mark form fields as touched to display validation errors
      console.log("not valid")
      this.markFormGroupTouched(this.registerForm);
    }
  }

  // Helper function to mark all fields in a form group as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Generate random password
  generatePassword(): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    const passwordLength = 10;
    let password = '';

    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters.charAt(randomIndex);
    }

    return password;
  }

  openModal() {
    const modal = document.getElementById('myModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  closeModal() {
    const modal = document.getElementById('myModal');

    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }

    if (!this.error) this.router.navigate(['/admin/staff-enroll']);

    this.error = false;
    this.errorMessage = '';
  }

  checkDetailsFromStudentData(staffData: any): Observable<boolean> {
    const url = 'http://localhost:5984/sapas/StudentData';
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    // Make HTTP request to fetch student data and return the result as an Observable
    return this.http.get(url, { headers }).pipe(
      map((data: any) => {
        for (const batchYear in data) {
          if (data.hasOwnProperty(batchYear)) {
            const students = data[batchYear];
            for (const studentId in students) {
              if (students.hasOwnProperty(studentId)) {
                const student = students[studentId];
                if (
                  student.email === staffData.email ||
                  student.mobileNumber === staffData.phoneNumber
                ) {
                  return true;
                }
              }
            }
          }
        }
        return false;
      }),
      catchError((error) => {
        console.log(
          'Error Fetching student data for validation on staff registration',
          error
        );
        return of(false); // Return false in case of error
      })
    );
  }

 
}