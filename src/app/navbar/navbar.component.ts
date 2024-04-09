import { StudentLogService } from './../student-log.service';
import { AdminService } from './../admin/admin.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaffService } from '../staff/staff.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RefreshService } from '../home/refresh.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit{
  
  announcement!: string
  student!: any
  showStaffEnrollmentDropdown: boolean = false;
  staffEnrollmentSelected: boolean = false
  studentPhoto: any
  defaultPhoto: string = "../../../assets/studentLogo.jpg"
  isPhotoAvailable: boolean = false;


  constructor(
    public Admin: AdminService,
    public Student: StudentLogService,
    private router: Router,
    private staff: StaffService,
    private http: HttpClient,
    private refreshService: RefreshService
  ) {
    if(Admin.isAuthenticated()) this.sideBarItems = this.adminSideBar
    if(Student.isLoggedIn) {
      this.sideBarItems = this.studentSideBar;
      this.student = Student.getCurrentUser("student")
    }
    if(staff.isAuthenticated()) this.sideBarItems = this.staffSideBar;
  }

  // adminSideBar: any[] = [{name: 'Face Update', path: '/admin/face-update'}, {name: 'Course Enroll', path: '/admin/course-enroll'}, {name: 'Staff Enroll', path:'/admin/staff-enroll'}, {name: 'Staff Registration', path:'/admin/staff-registration'}, {name: 'Publish Result', path:'/admin/publish-result'}]
  staffSideBar: any[] = [{name: 'Add Marks', path: '/staff/'+this.Student.currentUserName+'/add-marks'}]
  studentSideBar: any[] = [{name: 'View Profile', path: '/student/'+this.Student.currentUserName+'/profile'}, {name: 'View Marks', path: '/student/'+this.Student.currentUserName+'/view-marks'}, {name: 'Set Goals', path: '/student/'+this.Student.currentUserName+'/set-goal'}]
  sideBarItems: any[] | undefined
  adminSideBar: any[] = [
    { name: 'Face Update', path: '/admin/face-update' },
    { name: 'Course Enroll', path: '/admin/course-enroll' },
    { name: 'Publish Result', path:'/admin/publish-result'},
    { 
      name: 'Staff Enrollment', 
      dropdown: [
        { name: 'Staff Registration', path: '/admin/staff-registration' },
        { name: 'Staff Enroll', path: '/admin/staff-enroll' }
      ] 
    },
    { name: 'Announcements', path: '/admin/announcements' },
  ];

  ngOnInit(): void {
      this.checkAnnouncement()

      if(this.Student.isAuthenticated()) this.fetchImage()
  }

  logout() {
    
    if (this.Admin.isLoggedIn)  localStorage.removeItem("isAdmin");
    else if (this.Student.isLoggedIn) localStorage.removeItem("currentUser")
    else localStorage.removeItem("isStaff");

    this.Student.currentUserName = ""
    this.refreshService.resetRefresh()
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

  checkAnnouncement() {

    if(this.Student.isAuthenticated()){
      const regNo = this.student.registrationNumber
      const url = 'http://localhost:5984/sapas/FaceUpdate'
      const headers = new HttpHeaders({
        Authorization: 'Basic ' + btoa('admin:admin'),
      });


      this.http.get(url, {headers}).subscribe(
        (data: any) => {
          const faceData = data[this.student.batch][regNo]
          if(faceData.faceUpdatePortal){
            this.announcement = 'Your Face update portal is now open. Go to your Profile select Update Face and update your face.';
          }
          else{
            this.announcement = '';   
          }
        },
        (error) => {
          console.error("Error fetching face update data", error)
        }
      )
    }
  }

  toggleStaffEnrollmentDropdown() {
    this.showStaffEnrollmentDropdown = !this.showStaffEnrollmentDropdown;
    this.staffEnrollmentSelected = !this.staffEnrollmentSelected;
  }

  goToProfile(): void {

    let page = ""
    if(this.sideBarItems) page = this.sideBarItems[0].path 
    this.router.navigate([page])
  }

  fetchImage(): void {

    if(this.student.photo) {
      const attachmentData=this.student.photo._attachments.filename.data
      const contentType=this.student.photo._attachments.filename.content_type
      this.studentPhoto = 'data:' + contentType + ';base64,' + attachmentData;

      this.isPhotoAvailable = true
    }


   
  }


}
