import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mobile-login',
  templateUrl: './mobile-login.component.html',
  styleUrls: ['./mobile-login.component.css']
})
export class MobileLoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.loading = true;
    this.error = '';
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/mobile']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Credenciales incorrectas o error de red.';
      }
    });
  }
}
