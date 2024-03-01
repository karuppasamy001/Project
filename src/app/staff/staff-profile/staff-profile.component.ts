import { Component } from '@angular/core';
import { StaffService } from '../staff.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-staff-profile',
  templateUrl: './staff-profile.component.html',
  styleUrls: ['./staff-profile.component.scss']
})
export class StaffProfileComponent {
  constructor(private staff: StaffService, private router: Router){
    if(!staff.isAuthenticated()) this.router.navigate(['/login']);
  }
}
