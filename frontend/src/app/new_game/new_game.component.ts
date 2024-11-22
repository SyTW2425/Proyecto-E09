import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';  // Import MatIconModule
import { AuthService } from '../user.service';


@Component({
  selector: 'app-new_game',
  templateUrl: './new_game.component.html',
  styleUrls: ['./new_game.component.css'],
  imports: [CommonModule, MatIconModule],  // Add MatIconModule here
  standalone: true
})
export class NewGameComponent implements OnInit {
  userName!: string;

  constructor(private userService: AuthService) {}

  ngOnInit() {
    this.userName = localStorage.getItem('username') || 'John Doe';
  }

  newGame() {}
  newMultiGame() {}
}
