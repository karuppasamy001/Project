import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { WebcamModule } from 'ngx-webcam';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegistrationComponent } from './registration/registration.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterFaceComponent } from './registration/register-face/register-face.component';
import { ToppersComponent } from './toppers/toppers.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { MatIconModule } from '@angular/material/icon';
import { FaceUpdateComponent } from './admin/face-update/face-update.component';
import { CourseEnrollComponent } from './admin/course-enroll/course-enroll.component';
import { StaffEnrollComponent } from './admin/staff-enroll/staff-enroll.component';
import { AdminHomeComponent } from './admin/admin-home/admin-home.component';
import { StaffRegistrationComponent } from './admin/staff-registration/staff-registration.component';
import { StaffComponent } from './staff/staff.component';
import { StaffProfileComponent } from './staff/staff-profile/staff-profile.component';
import { AddMarksComponent } from './staff/add-marks/add-marks.component';


@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    RegisterFaceComponent,
    ToppersComponent,
    FooterComponent,
    HomeComponent,
    NavbarComponent,
    LoginComponent,
    AdminComponent,
    FaceUpdateComponent,
    CourseEnrollComponent,
    StaffEnrollComponent,
    AdminHomeComponent,

    StaffRegistrationComponent,
     StaffComponent,
     StaffProfileComponent,
     AddMarksComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    WebcamModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CommonModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
