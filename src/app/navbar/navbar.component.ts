import { StudentLogService } from './../student-log.service';
import { AdminService } from './../admin/admin.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  

  constructor(
    public Admin: AdminService,
    public Student: StudentLogService,
    private router: Router
  ) {
    if(Admin.isAuthenticated()) this.sideBarItems = this.adminSideBar
    if(Student.isLoggedIn) this.sideBarItems = this.studentSideBar;
  }

  adminSideBar: any[] = [{name: 'Face Update', path: '/admin/face-update'}, {name: 'Course Enroll', path: '/admin/course-enroll'}, {name: 'Staff Enroll', path:'/admin/staff-enroll'}, {name: 'Staff Registration', path:'/admin/staff-registration'}]
  staffSideBar: any[] = [{name: 'Update Marks', path: '/admin/update-marks'}]
  studentSideBar: any[] = [{name: 'View Profile', path: '/admin/view-profile'}, {name: 'View Marks', path: '/admin/view-marks'}]
  sideBarItems: any[] | undefined


  logout() {
    
    if (this.Admin.isLoggedIn)  localStorage.removeItem("isAdmin");
    else localStorage.removeItem("currentUser");

    this.Student.currentUserName = ""
    this.router.navigate([""])
  }

  goTo(page: string) {
    this.router.navigate([page]);
  }

  loggedIN() {
    if (this.Admin.isAuthenticated()) return true;
    if (this.Student.isAuthenticated()) return true;

    return false;
  }
}
