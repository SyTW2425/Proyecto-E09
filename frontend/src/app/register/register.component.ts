import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  template: `
<main>
  <div class="wrapper">
    <form [formGroup]="registerForm" (ngSubmit)="submitForm()">
      <h2>REGISTER AN ACCOUNT</h2>
      
      <div class="input-field">
        <input matInput formControlName="email" required>
        <label>Enter your email</label>
      </div>
      
      <div class="input-field">
        <input matInput formControlName="username" required>
        <label>Enter a username</label>
      </div>
      
      <div class="input-field">
        <input matInput type="password" formControlName="password" required>
        <label>Enter a password</label>
      </div>
      
      <div class="input-field">
        <input matInput type="password" formControlName="passwordConfirm" required>
        <label>Confirm your password</label>
      </div>

      <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid || loading">
        {{ loading ? 'Registering...' : 'Register' }}
      </button>
      <div *ngIf="registerForm.errors?.['mismatch']">
        <p class="error">Passwords do not match</p>
      </div>
      <div class="login">
        <p>Already have an account?</p>
        <a routerLink="/login" class="register-title">Sign in</a>
      </div>
    </form>
  </div>
</main>
  `,
  styleUrls: ['./register.component.css']
})
export class RegisterFormComponent {
  registerForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required],
      passwordConfirm: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  get email() {
    return this.registerForm.get('email')!;
  }

  get username() {
    return this.registerForm.get('username')!;
  }

  get password() {
    return this.registerForm.get('password')!;
  }

  private passwordMatchValidator(form: any) {
    const password = form.get('password').value;
    const passwordConfirm = form.get('passwordConfirm').value;
    return password === passwordConfirm ? null : { mismatch: true };
  }

  loading = false;

  submitForm() {
    if (this.registerForm.valid) {
      this.loading = true;
      const { email, username, password } = this.registerForm.value;
      this.authService.register(username, password, email).subscribe(
        (user) => {
          this.loading = false;
          const decodedToken = jwtDecode<any>(user.token);
          document.cookie = `token=${user.token}; path=/; expires=${new Date(decodedToken.exp * 1000).toUTCString()}`;
          localStorage.setItem('username', decodedToken.publicData.username);
          localStorage.setItem('email', decodedToken.publicData.email);
          this.router.navigate(['/new_game']);
        },
        (error) => {
          console.error('Registration error:', error);
          this.loading = false;
        }
      );
    }
  }
}