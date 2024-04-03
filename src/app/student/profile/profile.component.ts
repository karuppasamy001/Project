import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { StudentService } from '../student.service';
import { Router } from '@angular/router';
import { VideoRefreshService } from '../video-refresh.service';
import { StudentLogService } from 'src/app/student-log.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  student: any; 
  isPhotoAvailable: boolean = false;
  uploadFile: any
  couchFile: any
  showNotification: boolean = true;
  studentPhoto: any
  defaultPhoto: string = "../../../assets/studentLogo.jpg"


  constructor(private http: HttpClient, private studentLog: StudentService, private studentService: StudentLogService, refresh: VideoRefreshService, private router: Router) { 
    if(!this.studentService.isAuthenticated()) this.router.navigate(['/login'])
    this.student = studentLog.studentData

    if(localStorage.getItem("FaceUpdate") === 'true') {
      window.location.reload()
      localStorage.removeItem("FaceUpdate")
    }
  }


  ngOnInit(): void {

    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    this.http.get("http://localhost:5984/sapas/FaceUpdate", {headers}).subscribe(
      (data : any) => {
        const  faceUpdates = data[this.student.batch][this.student.registrationNumber]
        this.showNotification = faceUpdates.faceUpdatePortal

      },
      (error) => {
        console.error("Error fetching  Face Update data", error);
      }
    )

    this.fetchImage()

  }

  onFileSelected(event: any): void {
    this.uploadFile = event.target.files[0];
  
    const reader = new FileReader();
    reader.onloadend = () => {
      const fileContent = reader.result!.toString().split(',')[1]; 
      this.couchFile= {
        _attachments: {
          filename: {
            content_type: this.uploadFile.type,
            data: fileContent
          }
        }
      };

      this.uploadPhoto()


    };
    reader.readAsDataURL(this.uploadFile);
  }
  

  uploadPhoto() {
    const url = 'http://localhost:5984/sapas/StudentData'; // CouchDB URL
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    this.http.get(url, {headers}).subscribe(
      (data : any) => {
        data[this.student.batch][this.student.registrationNumber].photo = this.couchFile
        this.http.put(url, data, {headers}).subscribe(
          (response : any) => {
            localStorage.setItem("currentUser", JSON.stringify(data[this.student.batch][this.student.registrationNumber]))
            window.location.reload()


            console.log("Successfully uploaded the image.", response);
          },
          (error) => {
            console.log("Error uploading photo", error)
          }
        )
      },
      (error) => {
        console.log("Error fetching student data for photo upload", error)
      }
    )


  }

  startFaceUpdate(): void {
    localStorage.setItem("FaceUpdate", "true")
    this.router.navigate(['/student/update-face'])
  }

  fetchImage(): void {

    if(this.student.photo) {
      const attachmentData=this.student.photo._attachments.filename.data
      const contentType=this.student.photo._attachments.filename.content_type
      this.studentPhoto = 'data:' + contentType + ';base64,' + attachmentData;

      this.isPhotoAvailable = true
    }


   
  }



}
