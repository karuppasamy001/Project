import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StaffService } from './staff.service';
import { StudentLogService } from '../student-log.service';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss']
})
export class StaffComponent {
  staffName!: string
  constructor(private staff: StaffService, private router: Router, private log: StudentLogService){
    if(!staff.isAuthenticated()) this.router.navigate(['/login']);
    this.staffName = this.log.currentUserName
  }
}
