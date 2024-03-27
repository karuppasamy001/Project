// login.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { StudentLogService } from '../student-log.service';
import { AdminService } from '../admin/admin.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StaffService } from '../staff/staff.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})


export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  reload: boolean = false

  constructor(
    private authService: AuthService,
    private router: Router,
    private studentLog: StudentLogService,
    private admin: AdminService,
    private http: HttpClient,
    private staff: StaffService
  ) {
    
  }

  // onSubmit(): void {
  //   if (this.username && this.password) {
  //     if (this.username === 'admin' && this.password === 'admin') {
  //       localStorage.setItem('isAdmin', 'true');
  //       this.admin.isLoggedIn = true;
  //       this.studentLog.currentUserName = 'Admin';
  //       this.router.navigate(['']);
  //     }

  //     else{

  //     this.authService.login(this.username, this.password).subscribe(
  //       (response) => {
  //         if (response.rows.length > 0) {
  //           console.log('Login successful');
  //           this.studentLog.isLoggedIn = true;
  //           this.studentLog.getStudentInfo(this.password);
  //           this.router
  //             .navigateByUrl('/', { skipLocationChange: true })
  //             .then(() => {
  //               this.router.navigate(['']);
  //             });
  //         } else {
  //           console.log('incorrect username or password');
  //           this.openModal('validationModal', 'Incorrect username or password');
  //         }
  //       },
  //       (error) => {
  //         console.error('Error occurred:', error);
  //         this.errorMessage = 'An error occurred during login';
  //       }
  //     );
  //     }



  //   } else {
  //     this.openModal(
  //       'validationModal',
  //       'Please enter both a username and password'
  //     );
  //   }
  // }

  

  onSubmit(): void {
    if (this.username && this.password) {
      if (this.username === 'admin' && this.password === 'admin') {
        localStorage.setItem('isAdmin', 'true');
        this.admin.isLoggedIn = true;
        this.studentLog.currentUserName = 'Admin';
        this.router.navigate(['']);
      } else {
        // Check for staff login
        const headers = new HttpHeaders({
          Authorization: 'Basic ' + btoa('admin:admin'),
        });
  
        this.http.get<any>('http://localhost:5984/sapas/StaffData', { headers }).subscribe(
          (data: any) => {
            const staff : any = Object.values(data).find((staff: any) => staff.email === this.username && staff.password === this.password);
            if (staff) {
              localStorage.setItem('isStaff', JSON.stringify(staff));
              this.studentLog.currentUserName = staff.staffName;
              this.staff.isLoggedIn = true
              this.router.navigate(['']);
            } else {
              // If not admin or staff, check for student login
              this.authService.login(this.username, this.password).subscribe(
                (response) => {
                  console.log(response)
                  if (response.rows.length > 0) {
                    console.log('Login successful');
                    this.studentLog.isLoggedIn = true;
                    this.studentLog.getStudentInfo(this.password);
                    this.router
                      .navigateByUrl('/', { skipLocationChange: true })
                      .then(() => {
                        this.router.navigate(['']);
                      });
                  } else {
                    console.log('incorrect username or password');
                    this.openModal('validationModal', 'Incorrect username or password');
                  }
                },
                (error) => {
                  console.error('Error occurred:', error);
                  this.errorMessage = 'An error occurred during login';
                }
              );
            }
          },
          (error) => {
            console.error('Error fetching staff data:', error);
            this.errorMessage = 'An error occurred during login';
          }
        );
      }
    } else {
      this.openModal(
        'validationModal',
        'Please enter both a username and password'
      );
    }
  }
  

  openModal(id: string, sentence: string) {
    const modal = document.getElementById(id);
    const sentences = document.getElementById('sentence');
    if (modal) {
      sentences!.innerHTML = sentence;
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

  faceLogin(): void{
    this.router.navigate(['/face-login'])
  }

  goToHome(){
    this.router.navigate([''])
  }
}
