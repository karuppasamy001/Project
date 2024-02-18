import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentLogService } from '../student-log.service';
import { CouchDBService } from '../backend/couchDB/couch-db.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent  {


  
  constructor(private route: Router, public studentLog: StudentLogService, private router: Router, private couchDBService: CouchDBService){
  }



  
  announcements = [
    { title: 'New Registration 2024', details: 'Details about announcement 1', date: new Date() , link: '../registration'},
    { title: 'Important Announcement 2', details: 'Details about announcement 2', date: new Date(), link: '' },
    // Add more announcements as needed
  ];

  logout() {
    this.studentLog.logout()
    this.router.navigate(['']);
  }

  studentPortal() {
    if(this.studentLog.isLoggedIn) {
      this.router.navigate(['/navbar'])
    }
  }


  announcementClick(link: string){
    if(link){
      this.route.navigate([link])
    }
  }
  
}
