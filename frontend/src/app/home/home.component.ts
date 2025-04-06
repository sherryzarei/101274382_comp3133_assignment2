import { Component } from '@angular/core';
import { LoginComponent } from '../components/user/login/login.component'; // adjust path if needed
import { AuthService } from '../services/auth.service'; 
import { CommonModule } from '@angular/common';
import { EmployeeComponent } from '../components/emp/employees/employees.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LoginComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private authService: AuthService) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}