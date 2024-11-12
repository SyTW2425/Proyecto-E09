import { Component, effect, EventEmitter, input, Output } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import {User} from '../user';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [
		CommonModule,
    ReactiveFormsModule,
		RouterModule
  ],
	template: `
<main>
  <div class="wrapper">
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <h2>SIGN IN</h2>
      <div class="input-field">
        <input type="text" required>
        <label>Enter your username</label>
      </div>
      <div class="input-field">
        <input type="password" required>
        <label>Enter your password</label>
      </div>
      <div class="forget">
        <a href="#">Forgot password?</a>
      </div>
      <button type="submit">Log In</button>
      <div class="register">
        <p>Don't have an account?</p> 
				<a routerLink="/register" class="register-title">Register an account</a>
      </div>
    </form>
  </div>
</main>
	`,
	styleUrls: ['./login.component.css']
})
export class LoginFormComponent {
  @Output() loginSubmitted = new EventEmitter<{ username: string; password: string }>();

  loginForm = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(private formBuilder: FormBuilder) {}

  onSubmit() {
    if (this.loginForm.valid) {
      this.loginSubmitted.emit(this.loginForm.value as { username: string; password: string });
    }
  }
}