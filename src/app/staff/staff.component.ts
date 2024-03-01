import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StaffService } from './staff.service';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss']
})
export class StaffComponent {
  constructor(private staff: StaffService, private router: Router){
    if(!staff.isAuthenticated()) this.router.navigate(['/login']);
  }
}
