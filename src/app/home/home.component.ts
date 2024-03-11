import { AdminService } from './../admin/admin.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentLogService } from '../student-log.service';
import { StaffService } from '../staff/staff.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  
  constructor(private route: Router, 
    public studentLog: StudentLogService, 
    private router: Router, 
    public Admin: AdminService,
    public staff: StaffService
    ){
  }

  ngOnInit(): void {
      // window.location.reload()
  }

  
  announcements = [
    { title: 'New Registration 2024', details: 'Details about announcement 1', date: new Date() , link: '../registration'},
    { title: 'Important Announcement 2', details: 'Details about announcement 2', date: new Date(), link: '' },
    // Add more announcements as needed
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
    if(this.Admin.isLoggedIn){
      this.route.navigate(['/admin'])
    }

    if(this.staff.isLoggedIn){
      this.route.navigate(['/staff'])
    }
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
}
