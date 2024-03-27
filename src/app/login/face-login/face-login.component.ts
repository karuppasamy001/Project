import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CouchDBService } from 'src/app/backend/couchDB/couch-db.service';
import { FaceService } from 'src/app/face.service';
import { RefreshService } from 'src/app/home/refresh.service';
import { StudentLogService } from 'src/app/student-log.service';

@Component({
  selector: 'app-face-login',
  templateUrl: './face-login.component.html',
  styleUrls: ['./face-login.component.scss'],
})
export class FaceLoginComponent implements OnInit {
  retry: boolean = false;

  loginForm!: FormGroup;
  errorMessage!: HTMLDivElement;
  year: number = new Date().getFullYear();
  isLog!: boolean;
  video!: HTMLVideoElement;
  currentFaceDescriptor!: any;
  inputFlag: Boolean = false;
  styleFlag: boolean = false;
  constructor(
    private render: Renderer2,
    private refresh: RefreshService,
    private route: Router,
    private faceApi: FaceService,
    private studentLog: StudentLogService
  ) {}

  ngOnInit(): void {
    this.video = this.render.selectRootElement('#myVideo') as HTMLVideoElement;
    this.errorMessage = this.render.selectRootElement('.errorMessage');
    this.startVideo();
  }

  async startVideo(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (this.video) {
        this.video.srcObject = stream;

        await new Promise<any>((resolve) => {
          this.video.addEventListener('play', async () => {
            this.errorMessage.innerHTML = 'wait until scan....';
            try {
              const results = await this.faceApi.confirmImage(
                this.video,
                this.errorMessage
              );
              this.styleFlag = true;
              this.errorMessage.innerHTML = 'face scanned successfully';
              console.log(results);
              this.currentFaceDescriptor = results;

              let finalResult = await this.faceApi.matchFace(
                this.currentFaceDescriptor
              );
              
              if(finalResult){
                this.studentLog.isLoggedIn = true;
                this.studentLog.getStudentInfo(finalResult);
                this.route.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                  this.refresh.resetRefresh()
                  this.route.navigate(['']);
                  });
                console.log("Student reg no -", finalResult)
              }
              

              this.inputFlag = true;

              resolve(results);
            } catch (error) {
              console.log(error);
              resolve(false);
            }
          });
        });
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  }

  reloadPage(): void {
    window.location.reload();
  }
}
