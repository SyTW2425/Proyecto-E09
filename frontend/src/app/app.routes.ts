import { Routes } from '@angular/router';
import { LoginFormComponent } from './login/login.component';
import { HomeComponent } from './homepage/home.component';

export const routes: Routes = [

	{ path: '', component: HomeComponent },
	{ path: 'login', component: LoginFormComponent },
];
