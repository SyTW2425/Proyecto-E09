import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';  // Import MatIconModule
import { AuthService } from '../user.service';

@Component({
  selector: 'app-userhome',
  templateUrl: './userhome.component.html',
  styleUrls: ['./userhome.component.css'],
  imports: [CommonModule, MatIconModule],  // Add MatIconModule here
  standalone: true
})
export class UserHomeComponent implements OnInit {
  userName!: string;

  constructor(private userService: AuthService) {}

  ngOnInit() {
    this.userName = 'John Doe';
    /*this.userService.getUserName().subscribe((name: string) => {
      this.userName = name || 'John Doe';
    });*/
  }
}
