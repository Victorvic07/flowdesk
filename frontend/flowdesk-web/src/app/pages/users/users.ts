import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'TECHNICIAN' | 'REQUESTER';
  is_active: boolean;
  created_at: string;
}

@Component({
  selector: 'app-users',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  users: User[] = [];

  name = '';
  email = '';
  password = '';
  role: User['role'] = 'REQUESTER';

  loading = true;
  saving = false;

  errorMessage = '';
  successMessage = '';

  private readonly apiUrl = 'http://127.0.0.1:8000';

logout(): void {
  localStorage.removeItem('flowdesk_token');
  this.router.navigate(['/']);
}


  constructor(
  private readonly http: HttpClient,
  private readonly changeDetector: ChangeDetectorRef,
  private readonly router: Router,
) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  createUser(): void {
    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.password.trim()
    ) {
      this.errorMessage = 'Preencha todos os campos.';
      this.successMessage = '';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http
      .post<User>(
        `${this.apiUrl}/users`,
        {
          name: this.name.trim(),
          email: this.email.trim(),
          password: this.password,
          role: this.role,
        },
        {
          headers: this.getHeaders(),
        },
      )
      .pipe(take(1))
      .subscribe({
        next: (user) => {
          this.users = [...this.users, user];

          this.name = '';
          this.email = '';
          this.password = '';
          this.role = 'REQUESTER';

          this.successMessage = 'Usuário cadastrado com sucesso.';
          this.saving = false;

          this.changeDetector.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao cadastrar usuário:', error);

          if (error.status === 409) {
            this.errorMessage =
              'Já existe um usuário com esse e-mail.';
          } else if (error.status === 403) {
            this.errorMessage =
              'Você não tem permissão para cadastrar usuários.';
          } else {
            this.errorMessage =
              'Não foi possível cadastrar o usuário.';
          }

          this.saving = false;
          this.changeDetector.detectChanges();
        },
      });
  }

  private loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http
      .get<User[]>(`${this.apiUrl}/users`, {
        headers: this.getHeaders(),
      })
      .pipe(take(1))
      .subscribe({
        next: (users) => {
          this.users = [...users];
          this.loading = false;

          this.changeDetector.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao carregar usuários:', error);

          if (error.status === 403) {
            this.errorMessage =
              'Apenas administradores podem visualizar usuários.';
          } else {
            this.errorMessage =
              'Não foi possível carregar os usuários.';
          }

          this.loading = false;
          this.changeDetector.detectChanges();
        },
      });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('flowdesk_token');

    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });
  }
}