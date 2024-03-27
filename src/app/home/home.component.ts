import { AdminService } from './../admin/admin.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentLogService } from '../student-log.service';
import { StaffService } from '../staff/staff.service';
import { RefreshService } from './refresh.service';

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
  
  constructor(private route: Router, 
    public studentLog: StudentLogService, 
    private router: Router, 
    public Admin: AdminService,
    public staff: StaffService,
    private refreshService: RefreshService
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

    this.fetchImage()
  }

  
  announcements = [
    { 
        title: 'New Registration 2024', 
        details: 'Registration for the student batch of 2024 is now open. Click here to proceed with the registration process.', 
        date: new Date(), 
        link: '../registration'
    },
    { 
        title: 'Batch 2023 Result Published', 
        details: 'The results for the 2023 batch have been published. You can access your results in your portal under "View Marks" and then "Final Results".', 
        date: new Date(), 
        link: '' 
    },
];

  logout() {

    if(this.Admin.isLoggedIn) this.Admin.logout()
    else if(this.staff.isLoggedIn) this.staff.logout()
    else this.studentLog.logout()


    this.router.navigate(['']);
  }

  studentPortal() {
    if(this.studentLog.isLoggedIn) {
      this.router.navigate(['/student'])
    }
    else if(this.Admin.isLoggedIn){
      this.route.navigate(['/admin'])
    }

    else if(this.staff.isLoggedIn){
      this.route.navigate(['/staff'])
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
