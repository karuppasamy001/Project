import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StudentLogService } from 'src/app/student-log.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  constructor(private student: StudentLogService, private router: Router){
    if(!student.isAuthenticated())  this.router.navigate(['login']);
  }
}
