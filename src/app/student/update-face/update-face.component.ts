import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { CouchDBService } from 'src/app/backend/couchDB/couch-db.service';
import { FaceService } from 'src/app/face.service';
import { StudentLogService } from 'src/app/student-log.service';
import { StudentService } from '../student.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RefreshService } from 'src/app/home/refresh.service';

@Component({
  selector: 'app-update-face',
  templateUrl: './update-face.component.html',
  styleUrls: ['./update-face.component.scss']
})
export class UpdateFaceComponent implements OnInit {
  retry: boolean = false;
  studentData: any
  errorMessage!: HTMLDivElement;
  isLog!: boolean;
  video!: HTMLVideoElement;
  currentFaceDescriptor!: any;
  inputFlag: boolean = false;
  styleFlag: boolean = false;
  errorDiv!:HTMLDivElement
  faceUpdate: any

  constructor(
    private render: Renderer2,
    private route: Router,
    private faceApi: FaceService,
    private studentLog: StudentService,
    private http: HttpClient,
    private couchdb: CouchDBService,
    private refresh: RefreshService,
    private studentService: StudentLogService
  ) {
    if(!this.studentService.isAuthenticated()) this.route.navigate(['/login'])
    if(localStorage.getItem("FaceUpdate") !== 'true') this.route.navigate(['/student/profile'])
    this.studentData = studentLog.studentData
  }

 

  ngOnInit(): void {
    
    this.video=this.render.selectRootElement('#myVideo') as HTMLVideoElement
    this.errorDiv=this.render.selectRootElement(".errorMessage")
    this.startVideo()


    const faceUpdateURL = 'http://localhost:5984/sapas/FaceUpdate';
   
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const regNo = this.studentData.registrationNumber


    this.http.get(faceUpdateURL, {headers}).subscribe(
      (data:any) => {
        this.faceUpdate = data[this.studentData.batch][regNo]
      },
      (error) => {
        console.error("Error fetching face update data", error)
      }
    )
  }
  async startVideo(){
    this.errorDiv.innerHTML=""
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (this.video) {
        this.video.srcObject = stream;
        this.video.addEventListener('play', async()=>{
          try{
            const results:[] = await this.faceApi.startInterval(this.video,this.studentData.registrationNumber,this.errorDiv)
            if(results.length>0){
              this.studentData.face = results
              console.log("student data",this.studentData)
              this.couchdb.updateFaceData(results, this.studentData.registrationNumber, this.studentData.batch)
              this.updateNewFace()
              this.openModal("myModal")
            }
         
        }catch(error){
          console.log(error)
        }
        })
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  }

  reloadPage(): void {
    window.location.reload();
  }

  navigate(): void{
    this.route.navigate(['/student/profile'])
  }

  updateNewFace(): void{
    const faceUpdateURL = 'http://localhost:5984/sapas/FaceUpdate';
   
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const regNo = this.studentData.registrationNumber


    this.http.get(faceUpdateURL, {headers}).subscribe(
      (data:any) => {
        data[this.studentData.batch][regNo].faceUpdate = true
        data[this.studentData.batch][regNo].faceUpdateCount += 1        
        data[this.studentData.batch][regNo].faceUpdatePortal = false

        this.http.put(faceUpdateURL, data, {headers}).subscribe(
          (res: any) => {
            console.log("Successfully updated Face in DB", res);
          },
          (error) => {
            console.error("Error updating face in couchDB", error)
          }
        )
        
      },
      (error) => {
        console.error("Error fetching face update data", error)
      }
    )
  }

  openModal(id: string){
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }
  

  closeModal(id: string) {
    const modal = document.getElementById(id);

    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

}
