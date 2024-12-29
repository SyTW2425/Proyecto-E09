import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [RouterModule],
})
export class HomeComponent {

  constructor( private router: Router ) {}

  public start() {
    if (document.cookie.includes('token') && document.cookie.toString() !== 'token=;') {
      this.router.navigate(['/new_game']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}