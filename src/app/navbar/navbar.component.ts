import { StudentLogService } from './../student-log.service';
import { AdminService } from './../admin/admin.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StaffComponent } from '../staff/staff.component';
import { StaffService } from '../staff/staff.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  

  constructor(
    public Admin: AdminService,
    public Student: StudentLogService,
    private router: Router,
    private staff: StaffService
  ) {
    if(Admin.isAuthenticated()) this.sideBarItems = this.adminSideBar
    if(Student.isLoggedIn) this.sideBarItems = this.studentSideBar;
    if(staff.isAuthenticated()) this.sideBarItems = this.staffSideBar;
  }

  adminSideBar: any[] = [{name: 'Face Update', path: '/admin/face-update'}, {name: 'Course Enroll', path: '/admin/course-enroll'}, {name: 'Staff Enroll', path:'/admin/staff-enroll'}, {name: 'Staff Registration', path:'/admin/staff-registration'}, {name: 'Publish Result', path:'/admin/publish-result'}]
  staffSideBar: any[] = [{name: 'Add Marks', path: '/staff/add-marks'}]
  studentSideBar: any[] = [{name: 'View Profile', path: '/student/profile'}, {name: 'View Marks', path: '/student/view-marks'}, {name: 'Set Goals', path: '/student/set-goal'}]
  sideBarItems: any[] | undefined


  logout() {
    
    if (this.Admin.isLoggedIn)  localStorage.removeItem("isAdmin");
    else if (this.Student.isLoggedIn) localStorage.removeItem("currentUser")
    else localStorage.removeItem("isStaff");

    this.Student.currentUserName = ""
    this.router.navigate([""])
  }

  goTo(page: string) {
    this.router.navigate([page]);
  }

  loggedIN() {
    if (this.Admin.isAuthenticated()) return true;
    if (this.Student.isAuthenticated()) return true;
    if (this.staff.isAuthenticated()) return true

    return false;
  }
}
