import { Component, effect, EventEmitter, input, Output } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../user.service';

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
  loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe(
        (response) => {
          console.log('Login successful:', response.token);
        },
        (error) => {
          console.error('Login error:', error);
        }
      );
    }
  }
}