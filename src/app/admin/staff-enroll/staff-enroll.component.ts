import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-staff-enroll',
  templateUrl: './staff-enroll.component.html',
  styleUrls: ['./staff-enroll.component.scss'],
})
export class StaffEnrollComponent {


  constructor(private admin: AdminService, private router: Router) {
    if (!admin.isAuthenticated()) router.navigate(['/login']);
  }


}
