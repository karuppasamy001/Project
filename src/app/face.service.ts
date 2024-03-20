
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

  constructor() { }

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
    divElement.innerHTML="Don't move util face have been scanned"

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
      divElement.innerHTML="face scanned successfully"
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


}
