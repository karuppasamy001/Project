// registration.component.ts

import { GeoService } from '../../backend/GeoService/geo.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CouchDBService } from '../../backend/couchDB/couch-db.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  date: string = new Date().getFullYear().toString();
  flag: boolean = true;
  otp!: string;
  emailService: any;
  otpSent: boolean = false;
  otpVerified!: boolean;

  username!: string
  password!: string




  countries$!: Observable<any> 
  states$!: Observable<any>;
  cities$!: Observable<any>;

  currentGeneratedOtp!: string;

  constructor(
    private fb: FormBuilder,
    private couchDBService: CouchDBService,
    private route: Router,
    private geoService: GeoService,
    
  ) {
    this.registrationForm = this.fb.group({
      registrationNumber: ['', Validators.required],
      rollNumber: ['', Validators.required],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      alternateMobileNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      email: ['',[Validators.required, Validators.email]],
      bloodGroup: ['', Validators.required],
      address: this.fb.group({
        houseNumber: ['', Validators.required],
        street: ['', Validators.required],
        country: ['', Validators.required],
        state: ['', Validators.required],
        city: ['', Validators.required],
        pincode: ['', Validators.required],
      }),
    });
  }


  ngOnInit(): void {
    this.getCountries();
  }

  getCountries() {
    this.countries$ = this.geoService.getCountries();
  }

  getStates(countryName: string) {
    this.geoService.getGeonameIdByCountryName(countryName).subscribe((geonameId: string) => {
      if (geonameId) {
        this.states$ = this.geoService.getStates(geonameId);
      }
    });
  }

  getCities(countryCode: string, stateCode: string) {
    console.log(countryCode, stateCode)
    this.cities$ = this.geoService.getCities(countryCode, stateCode);
  }

  onCountryChange(event: any) {
    const countryName = event.target.value;
    this.getStates(countryName);
  }

  onStateChange(event: any) {
    const stateName = event.target.value;
    const countryGeoNameId = this.registrationForm.get('address.country')?.value;
  
    this.geoService.getAdminCodeByAdminName(stateName).subscribe((stateCode: string) => {
      this.geoService.getCountryCode(countryGeoNameId).subscribe((countryCode: string) => {
        if (countryCode) {
          this.getCities(countryCode, stateCode);
        }
      });
    });
  }
  
  
  


  onSubmit() {
    if (this.registrationForm.valid) {
      this.registrationForm.value.batch = this.date
      this.registrationForm.value.sem1Gpa = ""
      this.registrationForm.value.sem2Gpa = ""
      this.registrationForm.value.sem3Gpa = ""
      this.registrationForm.value.sem4Gpa = ""
      this.registrationForm.value.cgpa = ""
      this.registrationForm.value.currentSem = 1

      this.couchDBService.addOrUpdateStudentDetails(this.registrationForm.value, this.date)
      
      this.couchDBService.studentData = this.registrationForm.value
      this.couchDBService.userName = this.registrationForm.value.email
      this.couchDBService.password = this.registrationForm.value.registrationNumber
      this.couchDBService.academicYear = this.date


      this.route.navigate(['/face-register'])      
    } else {
      Object.keys(this.registrationForm.controls).forEach(field => {
        const control = this.registrationForm.get(field);
        if (control && !control.valid) {
          const label = document.querySelector(`label[for=${field}]`);
          if (label) {
            label.classList.add('text-danger');
          }
        }
      });

      this.openModal("validationModal")
  
      
    }
  }

  openModal(id: string){
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }
  

  closeModal(id: string) {
    const modal = document.getElementById(id);

    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  navigateToLoginPage(){
    this.route.navigate(["/login"])
  }


  
}
