import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminService } from './admin.service';
import { AdminComponent } from './admin.component';
import { FaceUpdateComponent } from './face-update/face-update.component';
import { CourseEnrollComponent } from './course-enroll/course-enroll.component';
import { StaffEnrollComponent } from './staff-enroll/staff-enroll.component';


const routes: Routes = [
    {
      path: '',
      component: AdminComponent,
      children: [
        { path: 'face-update', component: FaceUpdateComponent },
        { path: 'course-enroll', component: CourseEnrollComponent },
        { path: 'staff-enroll', component: StaffEnrollComponent },
      ]
    }
  ];


@NgModule({
  // imports: [RouterModule.forChild(routes)],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers:[AdminService]
})
export class AdminRoutingModule { }