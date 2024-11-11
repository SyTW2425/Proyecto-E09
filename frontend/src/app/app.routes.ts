import { Routes } from '@angular/router';
import { LoginFormComponent } from './login/login.component';

export const routes: Routes = [

	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: 'login', component: LoginFormComponent },
	//{ path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
];
