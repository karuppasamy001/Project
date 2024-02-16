// login.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { StudentLogService } from '../student-log.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router, private studentLog: StudentLogService) { }

  onSubmit(): void {
    if (this.username && this.password) {
      this.authService.login(this.username, this.password).subscribe(
        (response) => {
          if (response.rows.length > 0) {
            console.log('Login successful');
            this.studentLog.isLoggedIn = true
            this.router.navigate([""])
          } else {
            // Login failed, response is empty
            console.log("incorrect username or password")
            alert("username or password is wrong")
          }
        },
        (error) => {
          console.error('Error occurred:', error);
          this.errorMessage = 'An error occurred during login';
        }
      );
    } else {
      this.errorMessage = 'Please enter both username and password';
    }
  }
}
