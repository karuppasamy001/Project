
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';



declare const faceapi: any

@Injectable({
  providedIn: 'root'
})
export class FaceService {

  public video: HTMLVideoElement | undefined;
  public descriptions: any[] = [];
  public flag: boolean = false;
  public results: any;
  public count: number = 0;
  public timeInterval: any;

  constructor(private http: HttpClient) { }

  async loadModels(): Promise<void> {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('./assets/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./assets/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./assets/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('./assets/models')
      ]);
    } catch (error) {
      console.error("Error loading models:", error);
    }
  }
  async FaceDetection(video: HTMLVideoElement, registerNumber: string, divElement:HTMLDivElement): Promise<any> {
    divElement.innerHTML="Please don't Move Your Face"

    try {
      await this.loadModels()
    } catch (error) {
      console.log("error of the model", error);
    }

    this.results = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
    const labeledDescriptors = this.results.map((result: { descriptor: any; }) => {
      return new faceapi.LabeledFaceDescriptors(registerNumber, [result.descriptor]);
    });

   
    if (labeledDescriptors.length > 0) {
      this.clearIntervalTimer();
      divElement.innerHTML="Face Scanned Successfully"
    }
    return labeledDescriptors;
  }

  startInterval(video: HTMLVideoElement, registerNumber: string,divTag:HTMLDivElement): Promise<any> {
    return new Promise((resolve) => {
      this.timeInterval = setInterval(async () => {
        const labeledDescriptors = await this.FaceDetection(video, registerNumber,divTag);
        resolve(labeledDescriptors);
      }, 100);
    });
  }

  clearIntervalTimer() {
    clearInterval(this.timeInterval);
  }

  async confirmImage(video: HTMLVideoElement, divTag: HTMLDivElement): Promise<any> {
    try {
      await this.loadModels();
  
      return new Promise((resolve) => {
        let clearId: any;
  
        clearId = setInterval(async () => {
          let resultsDes = await this.detectFace(video, divTag);
          if (resultsDes.length > 0) {
            console.log(resultsDes);
            this.clearIntervalId(clearId);
            resolve(resultsDes);
          }
        }, 1000);
      });
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  
  async detectFace(video: HTMLVideoElement, divTag: HTMLDivElement): Promise<any> {
    divTag.innerHTML = "Don't move face until face scanned";
    let resultsVal = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
    return resultsVal.map((res: any) => res.descriptor);
    
  }
  
  clearIntervalId(id: any) {
    clearInterval(id);
  }



  async matchFace(descriptor: any): Promise<string | null> {
    const url = 'http://localhost:5984/sapas/StudentData';
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    try {
      const data: any = await this.http.get(url, { headers }).toPromise();
      const batches = Object.keys(data).filter(key => !key.startsWith('_'));

      for (const batchKey of batches) {
        const students = data[batchKey];
        console.log(students)
        for (const studentKey of Object.keys(students)) {
          const student = students[studentKey];
          if (student.face && student.face.length > 0) {
            console.log(student)
            const descriptors = student.face;
            console.log("Stored descriptor : ", descriptors)
            const result = await this.faceMatch(descriptors, descriptor);
            if (result !== 'false') {
              console.log("Result  - ", result)
              return studentKey; 
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching students data", error);
    }

    return null;
  }



  adminFaceMatch(descriptorStored:any, descriptors:any):Promise<string>{
    return new Promise<string>(
      
      async(resolve)=>{
        let result=await this.faceMatch(descriptorStored,descriptors)
        console.log(result)
          resolve(result.toString());
    })
  }
 

  faceMatch(descriptorStored: any, descriptor: any) : any {
        let floatArray = new Float32Array(descriptorStored[0].descriptors[0]);
        console.log("Label: ", descriptorStored[0].label);
        const labeledDes = new faceapi.LabeledFaceDescriptors(descriptorStored[0].label, [floatArray]);
        const faceMatcher = new faceapi.FaceMatcher([labeledDes]);
        let result = faceMatcher.findBestMatch(descriptor[0]);

        console.log(result, 'matching completed');
        console.log(result.label)
        if (result.label === "unknown") {

          console.log("Rejected")
            return ("false"); // or reject(null);
        } else {
            return (result.toString());
        }
    
}
  


}
