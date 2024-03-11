import { Component, OnInit } from '@angular/core';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'app-register-face',
  templateUrl: './register-face.component.html',
  styleUrls: ['./register-face.component.scss'],
})
export class RegisterFaceComponent implements OnInit {
  public videoWidth = 640;
  public videoHeight = 480;
  public trigger: Subject<void> = new Subject<void>();
  public capturedImages: string[] = [];
  public currentImageIndex: number = 0;

  public ngOnInit(): void {
    this.trigger.next();
  }

  public triggerObservable: Observable<void> = this.trigger.asObservable();

  public handleInitError(error: WebcamInitError): void {
    console.error(error);
  }

  public captureImage(webcamImage: WebcamImage): void {
    if (this.currentImageIndex < 4) {
      this.capturedImages[this.currentImageIndex] = webcamImage.imageAsDataUrl;
      this.currentImageIndex++;
    }
    if (this.currentImageIndex === 4) {
      // All images captured, show the submit button
      this.trigger.next();
    }
  }

  public captureImageManually(): void {
    this.trigger.next();
  }

  public retakeImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.capturedImages[this.currentImageIndex] = '';
      this.trigger.next();
    }
  }

  public submitImages(): void {
    // Implement logic to submit capturedImages
  }
}
