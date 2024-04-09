import { AdminService } from './../admin/admin.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentLogService } from '../student-log.service';
import { StaffService } from '../staff/staff.service';
import { RefreshService } from './refresh.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  studentPhoto: any
  defaultPhoto: string = "../../../assets/studentLogo.jpg"
  isPhotoAvailable: boolean = false;
  student: any
  announcements: any[] = []
  
  constructor(private route: Router, 
    public studentLog: StudentLogService, 
    private router: Router, 
    public Admin: AdminService,
    public staff: StaffService,
    private refreshService: RefreshService,
    private http: HttpClient
    ){

      if(studentLog.isLoggedIn) {
        this.student = studentLog.getCurrentUser("student")
      }
  }

  ngOnInit(): void {
    if (!this.refreshService.isRefreshed()) {
      this.refreshService.markRefreshed();
      window.location.reload(); // Refresh the page
    }  

    if(this.studentLog.isAuthenticated())  this.fetchImage()

    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const url = 'http://localhost:5984/sapas/Announcements';

    this.http.get(url, { headers }).subscribe(
      (data : any) => {
        this.announcements = Object.values(data["lists"])
        this.announcements.reverse(); // Reverse the array
        console.log(this.announcements)
      },
      (error) => {
        console.error("Error fetching announcement details ", error)
      } 
    )
  }



  logout() {

    if(this.Admin.isLoggedIn) this.Admin.logout()
    else if(this.staff.isLoggedIn) this.staff.logout()
    else this.studentLog.logout()


    this.router.navigate(['']);
  }

  studentPortal() {
    if(this.studentLog.isLoggedIn) {
      this.router.navigate([`/student/${this.studentLog.currentUserName}`])
    }
    else if(this.Admin.isLoggedIn){
      this.route.navigate(['/admin'])
    }

    else if(this.staff.isLoggedIn){
      this.route.navigate([`/staff/${this.studentLog.currentUserName}`])
    }
    else this.route.navigate(['/login'])
  }


  announcementClick(link: string){
    if(link){
      this.route.navigate([link])
    }
  }
  

  loggedIN(): boolean{
    if(this.studentLog.isLoggedIn || this.Admin.isLoggedIn || this.staff.isLoggedIn ) return true;
    else return false
  }

  fetchImage(): void {

    if(this.student.photo) {
      const attachmentData=this.student.photo._attachments.filename.data
      const contentType=this.student.photo._attachments.filename.content_type
      this.studentPhoto = 'data:' + contentType + ';base64,' + attachmentData;

      this.isPhotoAvailable = true
    }


   
  }


  scrollToDepartmentToppers() {
    const element = document.getElementById('departmentToppers');
    if (element) {
      element.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }
}
