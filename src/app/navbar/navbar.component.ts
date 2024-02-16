import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  username: string = 'John Doe'; // Sample username, replace with actual user data

  logout() {
    // Implement logout functionality here
    console.log('Logging out...');
  }
}
