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
<div class="wrapper">
    <form action="#">
      <h2>SIGN IN</h2>
        <div class="input-field">
        <input type="text" required>
        <label>Enter your email</label>
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
        <p>Don't have an account? <a href="#" class="register-title">Register</a></p>
      </div>
    </form>
  </div>
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