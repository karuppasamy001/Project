import { StaffProfileComponent } from './staff/staff-profile/staff-profile.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from './registration/registration.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { FaceUpdateComponent } from './admin/face-update/face-update.component';
import { CourseEnrollComponent } from './admin/course-enroll/course-enroll.component';
import { StaffEnrollComponent } from './admin/staff-enroll/staff-enroll.component';
import { AdminHomeComponent } from './admin/admin-home/admin-home.component';
import { StaffRegistrationComponent } from './admin/staff-registration/staff-registration.component';
import { StaffComponent } from './staff/staff.component';
import { AddMarksComponent } from './staff/add-marks/add-marks.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'navbar', component: NavbarComponent },
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      { path: 'face-update', component: FaceUpdateComponent },
      { path: 'course-enroll', component: CourseEnrollComponent },
      { path: 'staff-enroll', component: StaffEnrollComponent },
      { path: 'staff-registration', component: StaffRegistrationComponent },
      { path: 'admin-home', component: AdminHomeComponent },
      { path: '', redirectTo: 'admin-home', pathMatch: 'full' },
    ],
  },
  {
    path: 'staff',
    component: StaffComponent,
    children: [
      { path: 'staff-home', component: StaffProfileComponent },
      { path: 'add-marks', component: AddMarksComponent },
      { path: '', redirectTo: 'staff-home', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
