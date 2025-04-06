import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const username = this.loginForm.get('username')?.value ?? '';
      const password = this.loginForm.get('password')?.value ?? '';
      console.log('Submitting login with:', { username, password });

      this.authService.login(username, password).subscribe({
        next: (result) => {
          console.log('Login successful, result:', result);
          this.authService.setToken(result.token);
          this.router.navigate(['/employees']);
        },
        error: (error) => {
          console.error('Login failed with error:', error);
          this.errorMessage = error.graphQLErrors?.[0]?.message || 'Invalid username or password';
        }
      });
    } else {
      console.log('Form invalid:', this.loginForm.errors);
    }
  }
}