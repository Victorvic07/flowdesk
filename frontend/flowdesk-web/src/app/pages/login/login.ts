import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  login(): void {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Preencha o e-mail e a senha.';
      return;
    }

    this.loading = true;

    this.http
      .post<LoginResponse>('http://127.0.0.1:8000/auth/login', {
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (response) => {
          localStorage.setItem(
            'flowdesk_token',
            response.access_token,
          );

          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;

          if (error.status === 401) {
            this.errorMessage = 'E-mail ou senha inválidos.';
            return;
          }

          this.errorMessage =
            'Não foi possível entrar. Tente novamente.';
        },
      });
  }
}