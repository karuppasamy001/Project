import { Component, OnInit } from '@angular/core';
import { ApproveService } from './approve.service';
import { ModalService } from 'src/app/modal.service';

@Component({
  selector: 'app-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss'],
})
export class ApprovalComponent implements OnInit {
  approvalList: any[] = [];
  selectedStudent: any;
  action!: string;
  reload: boolean = false;


  constructor(private approve: ApproveService, private modal: ModalService) {}

  ngOnInit(): void {
    this.loadApprovalList();
    console.log(this.approvalList);
  }

  loadApprovalList() {
    this.approve.getApprovalList().subscribe(
      (data: any) => {
        console.log(data[this.approve.currentYear]);
        this.approvalList = Object.values(data[this.approve.currentYear]);
      },
      (error) => {
        console.error('Error fetching approval list', error);
      }
    );
  }

  viewDetails(student: any) {
    // Implement code to display modal with full details
    console.log('View details:', student);
    this.selectedStudent = student;
    this.openModal('myModal');
  }

  

  approveStudent(student: any) {
    this.selectedStudent = student;
    this.action = 'Approve';
    this.reload = true
    this.openModal('actionModal');
  }
  
  removeStudentFromApproval(registrationNumber: any) {}

  rejectStudent(student: any, registrationNum: string): void {
    this.selectedStudent = student;
    this.action = 'Reject';
    this.reload = true
    this.openModal('actionModal');
  }

  openModal(id: string) {
    const modal = document.getElementById(id);
    modal!.classList.add('show');
    modal!.style.display = 'block';
    document.body.classList.add('modal-open');
  }

  closeModal(id: string) {
    const modal = document.getElementById(id);
    modal!.classList.remove('show');
    modal!.style.display = 'none';
    document.body.classList.remove('modal-open');
  }


  Approve(student: any, batch: string): void {
    console.log(student, batch)
    this.approve.addOrUpdateStudentDetails(student, batch)

    this.closeModal("actionModal")
  }

  Reject(student: any){
    this.approve.removeApproval(student.registrationNumber)
    this.closeModal("actionModal")

  }
}
