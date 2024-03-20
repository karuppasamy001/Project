import { Component, Renderer2} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CouchDBService } from 'src/app/backend/couchDB/couch-db.service';
import { FaceService } from 'src/app/face.service';

@Component({
  selector: 'app-register-face',
  templateUrl: './register-face.component.html',
  styleUrls: ['./register-face.component.scss']
})
export class RegisterFaceComponent{

  isButtonDisabled: boolean = true; // Initially disabled
  video!:HTMLVideoElement
  errorDiv!:HTMLDivElement
  scanned: boolean = false
  RegisterNumber:string = ""
  academicYear!: string
  index:number=0

  username!: string
  password! : string

  studentData: any

  constructor(
    private render:Renderer2,
    private faceApi:FaceService,
    private route:ActivatedRoute, 
    private couchdb: CouchDBService,
    private router: Router
  )
  {
    this.RegisterNumber = couchdb.password
    this.studentData = couchdb.studentData
    this.academicYear = couchdb.academicYear
  }

  ngOnInit(): void {
    
    this.video=this.render.selectRootElement('#myVideo') as HTMLVideoElement
    this.errorDiv=this.render.selectRootElement(".errorMessage")
    this.startVideo()
  }
  async startVideo(){
    // this.errorDiv.innerHTML=""
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (this.video) {
        this.video.srcObject = stream;
        this.video.addEventListener('play', async()=>{
          try{
            const results:[]=await this.faceApi.startInterval(this.video,this.RegisterNumber,this.errorDiv)
            if(results.length>0){
              console.log("results",results);
              this.studentData.face = results
              console.log("student data",this.studentData)
              this.couchdb.updateFaceData(results, this.RegisterNumber, this.academicYear)
              this.scanned = true
              this.isButtonDisabled = false
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

  navigateToLoginPage(){
    this.router.navigate(['/login'])
  }

  closeFaceModal(){
    const modal = document.getElementById("faceModal");

    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }

    this.openModal("myModal")
  }
  
}

