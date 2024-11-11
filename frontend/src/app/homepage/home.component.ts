import { Component } from '@angular/core';
import { provideRouter, RouterModule } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [RouterModule],
})
export class HomeComponent {}