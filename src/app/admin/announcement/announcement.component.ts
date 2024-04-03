import { AdminService } from './../admin.service';
// announcement.component.ts

import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss']
})
export class AnnouncementComponent implements OnInit {
  announcements: any[] = [];
  newAnnouncementForm!: FormGroup;
  modalVisible: boolean = false;

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private router: Router,
    private AdminService: AdminService
  ) { 
    if(!AdminService.isAuthenticated()) this.router.navigate(['/login'])
  }

  ngOnInit(): void {
    this.getAnnouncements();
    this.newAnnouncementForm = this.formBuilder.group({
      title: ['', Validators.required],
      details: ['', Validators.required],
      link: ['']
    });

    
  }

  get form() { return this.newAnnouncementForm.controls; }

  getAnnouncements() {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const url = 'http://localhost:5984/sapas/Announcements';

    this.http.get(url, { headers }).subscribe(
      (data : any) => {
        this.announcements = Object.values(data["lists"]);
      },
      (error) => {
        console.error("Error fetching announcement details ", error);
      } 
    )
  }

  addAnnouncement() {
    if (this.newAnnouncementForm.invalid) {
      this.newAnnouncementForm.controls['title'].markAsTouched();
      this.newAnnouncementForm.controls['details'].markAsTouched();
      return;
    }

    const newAnnouncement = this.newAnnouncementForm.value;
    newAnnouncement.date = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
    this.announcements.push(newAnnouncement);
    this.newAnnouncementForm.reset(); // Reset the form after successfully adding announcement
  }

  deleteAnnouncement(index: number) {
    this.announcements.splice(index, 1);
  }

  submitAnnouncements() {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const url = 'http://localhost:5984/sapas/Announcements';

    this.http.get(url, {headers}).subscribe(
      (data : any) => {
        data['lists'] = {}
        for(let i = 0; i < this.announcements.length; i ++){
          data['lists'][String(i)] = this.announcements[i];
        }

        this.http.put(url, data, {headers}).subscribe(
          (res : any) => {
            console.log("Successfully submitted announcements");
            this.modalVisible = true;
          },
          (err) => {
            console.error("Error uploading announcements data", err);
          }
        )
      },
      (error) => {
        console.error("Error fetching announcement details for upload", error);
      }
    );
    console.log("Announcements submitted:", this.announcements);
  }

  closeModal() {
    this.modalVisible = false;
    this.router.navigate(['/admin']);
  }
}
