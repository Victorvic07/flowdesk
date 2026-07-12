import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface Category {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

@Component({
  selector: 'app-new-ticket',
  imports: [FormsModule, RouterLink],
  templateUrl: './new-ticket.html',
  styleUrl: './new-ticket.scss',
})
export class NewTicket implements OnInit {
  title = '';
  description = '';
  priority = 'MEDIUM';
  categoryId: number | null = null;

  categories: Category[] = [];
  loading = false;
  loadingCategories = true;
  errorMessage = '';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  createTicket(): void {
    this.errorMessage = '';

    if (!this.title || !this.description || !this.categoryId) {
      this.errorMessage = 'Preencha todos os campos obrigatórios.';
      return;
    }

    this.loading = true;

    this.http
      .post(
        'http://127.0.0.1:8000/tickets',
        {
          title: this.title,
          description: this.description,
          priority: this.priority,
          category_id: this.categoryId,
        },
        {
          headers: this.getHeaders(),
        },
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;

          if (error.status === 401) {
            this.errorMessage =
              'Sua sessão expirou. Faça login novamente.';
            return;
          }

          this.errorMessage = 'Não foi possível criar o chamado.';
        },
      });
  }

  private loadCategories(): void {
    this.http
      .get<Category[]>('http://127.0.0.1:8000/categories', {
        headers: this.getHeaders(),
      })
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.loadingCategories = false;
        },
        error: () => {
          this.errorMessage =
            'Não foi possível carregar as categorias.';
          this.loadingCategories = false;
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