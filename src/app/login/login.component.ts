// login.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { StudentLogService } from '../student-log.service';
import { AdminService } from '../admin/admin.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private studentLog: StudentLogService,
    private admin: AdminService
  ) {}

  onSubmit(): void {
    if (this.username && this.password) {
      if (this.username === 'admin' && this.password === 'admin') {
        localStorage.setItem('isAdmin', "true");
        this.admin.isLoggedIn = true
        this.studentLog.currentUserName = "Admin"
        this.router.navigate(['']);

      } else {
        this.authService.login(this.username, this.password).subscribe(
          (response) => {
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
              this.openModal(
                'validationModal',
                'Incorrect username or password'
              );
            }
          },
          (error) => {
            console.error('Error occurred:', error);
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
}
