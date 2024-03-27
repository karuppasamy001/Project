import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { WebcamModule } from 'ngx-webcam';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { RegisterFaceComponent } from './home/registration/register-face/register-face.component';
import { RegistrationComponent } from './home/registration/registration.component';
import { ToppersComponent } from './home/toppers/toppers.component';
import { StudentComponent } from './student/student.component';
import { ProfileComponent } from './student/profile/profile.component';
import { ViewMarksComponent } from './student/view-marks/view-marks.component';
import { SetGoalsComponent } from './student/set-goals/set-goals.component';
import { PublishResultComponent } from './admin/publish-result/publish-result.component';
import { FaceLoginComponent } from './login/face-login/face-login.component';
import { UpdateFaceComponent } from './student/update-face/update-face.component';


@NgModule({
  declarations: [
    AppComponent,
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
     RegistrationComponent,
     StudentComponent,
     ProfileComponent,
     ViewMarksComponent,
     SetGoalsComponent,
     PublishResultComponent,
     FaceLoginComponent,
     UpdateFaceComponent,
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
