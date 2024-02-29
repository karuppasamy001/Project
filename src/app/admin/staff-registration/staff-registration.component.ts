import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

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
  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      staffName: ['', Validators.required],
      gender: ['male', Validators.required],
      dateOfBirth: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      alternatePhoneNumber: [''],
      email: ['', Validators.required],
      qualification: ['', Validators.required],
      currentPost: ['Assistant Professor', Validators.required],
    });
  }
  ngOnInit(): void {
    // this.openModal()
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
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
                console.log('Staff details added successfully:', response);
                this.registerForm.reset();
                this.openModal();
              },
              (error: any) => {
                console.error('Error adding staff details:', error);
              }
            );
          } else {
            console.error('StaffId, phoneNumber, or email already exists.');
            // Handle error: StaffId, phoneNumber, or email already exists
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
          // Handle error
        }
      );
    } else {
      // Mark form fields as touched to display validation errors
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
    this.router.navigate(['/admin/staff-enroll']);
  }
}
