import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../student.service';
import { StudentLogService } from 'src/app/student-log.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-print-result',
  templateUrl: './print-result.component.html',
  styleUrls: ['./print-result.component.scss']
})
export class PrintResultComponent implements OnInit {


  table: any
  studentName: string = ""
  registrationNumber: string = ""
  semester: string = ""
  cgpa: string = ""
  gpa: string = ""


  constructor(private stud: StudentService, private studentService: StudentLogService, private router: Router){
    this.table = stud.printData
    this.studentName = stud.studentData.firstName
    this.registrationNumber = stud.studentData.registrationNumber
    this.semester=stud.studentData.currentSem
    this.gpa = stud.gpa
    this.cgpa = stud.cgpa

    if(!this.studentService.isAuthenticated()) this.router.navigate(['/login'])

  }

  ngOnInit(): void {
    setTimeout(() => {
      this.print();
    }, 1000);
  }

  print(): void{
    window.print()
  }


}
