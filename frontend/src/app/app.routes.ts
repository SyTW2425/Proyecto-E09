import { Routes } from '@angular/router';
import { LoginFormComponent } from './login/login.component';
import { HomeComponent } from './homepage/home.component';
import { RegisterFormComponent } from './register/register.component';
import { NewGameComponent } from './new_game/new_game.component';
import { GamepageComponent } from './gamepage/gamepage.component';


export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'login', component: LoginFormComponent },
	{ path: 'register', component: RegisterFormComponent },
	{ path: 'new_game', component: NewGameComponent },
	{ path: 'gamepage/:gameId', component: GamepageComponent },
];
