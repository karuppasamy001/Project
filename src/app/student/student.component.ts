import { Component } from '@angular/core';
import { StudentLogService } from '../student-log.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss']
})
export class StudentComponent {
  studentName!: string 
  constructor(private studentService: StudentLogService, private router: Router, private studentLog: StudentLogService) {
    if(!this.studentService.isAuthenticated()) this.router.navigate(['/login'])
      
    this.studentName = studentLog.currentUserName

  }
}
