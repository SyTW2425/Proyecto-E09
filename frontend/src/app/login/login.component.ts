import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../user.service';
import { jwtDecode,  JwtPayload } from 'jwt-decode';

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
        <input type="text" formControlName="email" required>
        <label>Enter your username</label>
        <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
          <small class="error">Email is required</small>
        </div>
      </div>
      <div class="input-field">
        <input type="password" formControlName="password" required>
        <label>Enter your password</label>
        <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
          <small class="error">Password is required</small>
        </div>
      </div>
      <div class="forget">
        <a href="#">Forgot password?</a>
      </div>
      <button type="submit" [disabled]="loginForm.invalid">Log In</button>
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

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router // Para redirigir después del login
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe(
        (response) => {
          const decodedToken = jwtDecode<any>(response.token);
          localStorage.setItem('username', decodedToken.publicData.username);
          localStorage.setItem('email', decodedToken.publicData.email);

          this.router.navigate(['/new_game']);
        },
        (error) => {
          console.error('Login error:', error); 
          alert('Invalid email or password');
        }
      );
    }
  }
}
