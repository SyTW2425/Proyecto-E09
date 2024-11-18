import { Component, OnInit } from '@angular/core';
import { provideRouter, RouterModule } from '@angular/router';
import { MatIcon, MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `,
  standalone: true,
  imports: [RouterModule, MatIconModule],
})
export class AppComponent implements OnInit {

  constructor(
    private matIconReg: MatIconRegistry
  ) {}

  ngOnInit(): void {
    this.matIconReg.setDefaultFontSetClass('material-symbols-outlined');
  }

}