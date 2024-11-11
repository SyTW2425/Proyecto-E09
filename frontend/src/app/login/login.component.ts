import { Component, effect, EventEmitter, input, Output } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import {User} from '../user';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [
		CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
  ],
	template: `
<main>
<form class="login-form" autocomplete="off" [formGroup]="loginForm" (submit)="submitForm()">
  <mat-form-field>
    <mat-label>Usuario</mat-label>
    <input matInput formControlName="username" placeholder="Usuario" required>
    <small *ngIf="username.invalid && (username.dirty || username.touched)">
      El usuario es requerido
    </small>
  </mat-form-field>
  
  <mat-form-field>
    <mat-label>Contraseña</mat-label>
    <input matInput formControlName="password" placeholder="Contraseña" required>
    <small *ngIf="password.invalid && (password.dirty || password.touched)">
      La contraseña es requerida
    </small>
  </mat-form-field>
  
  <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid">Iniciar sesión</button>
</form>
</main>
	`,
	styleUrls: ['./login.component.css']
})
export class LoginFormComponent {
	initialState = input<User>();

	@Output()
	formValuesChanged = new EventEmitter<User>();

	@Output()
	formSubmitted = new EventEmitter<User>();

	constructor(private formBuilder: FormBuilder) {
		effect(() => {
			this.loginForm.setValue({
				username: this.initialState()?.username || '',
				password: this.initialState()?.password || '',
			});
		});
	}

	loginForm = this.formBuilder.group({
		username: ['', Validators.required],
		password: ['', Validators.required]
	});

	get username() {
    return this.loginForm.get('username')!;
  }

	get password() {
		return this.loginForm.get('password')!;
	}

	get email() {
		return this.loginForm.get('email')!;
	}

  submitForm() {
    this.formSubmitted.emit(this.loginForm.value as User);
  }
}