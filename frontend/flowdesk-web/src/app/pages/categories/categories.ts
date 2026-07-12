import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';

interface Category {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

@Component({
  selector: 'app-categories',
  imports: [FormsModule, RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  categories: Category[] = [];

  name = '';
  description = '';

  loading = true;
  saving = false;
  deletingCategoryId: number | null = null;

  errorMessage = '';
  successMessage = '';

  private readonly apiUrl = 'http://127.0.0.1:8000';

  constructor(
    private readonly http: HttpClient,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  createCategory(): void {
    const name = this.name.trim();
    const description = this.description.trim();

    if (!name || !description) {
      this.errorMessage = 'Preencha o nome e a descrição.';
      this.successMessage = '';
      this.changeDetector.detectChanges();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http
      .post<Category>(
        `${this.apiUrl}/categories`,
        {
          name,
          description,
        },
        {
          headers: this.getHeaders(),
        },
      )
      .pipe(
        take(1),
        finalize(() => {
          this.saving = false;
          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: (category) => {
          this.categories = [...this.categories, category];

          this.name = '';
          this.description = '';

          this.successMessage = 'Categoria cadastrada com sucesso.';
          this.errorMessage = '';

          this.changeDetector.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao cadastrar categoria:', error);

          if (error.status === 401) {
            this.errorMessage =
              'Sua sessão expirou. Faça login novamente.';
          } else if (error.status === 403) {
            this.errorMessage =
              'Você não tem permissão para cadastrar categorias.';
          } else if (error.status === 409) {
            this.errorMessage =
              'Já existe uma categoria com esse nome.';
          } else {
            this.errorMessage =
              'Não foi possível cadastrar a categoria.';
          }

          this.changeDetector.detectChanges();
        },
      });
  }

  deleteCategory(category: Category): void {
    const confirmed = window.confirm(
      `Deseja realmente excluir a categoria "${category.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    this.deletingCategoryId = category.id;
    this.errorMessage = '';
    this.successMessage = '';
    this.changeDetector.detectChanges();

    this.http
      .delete<void>(
        `${this.apiUrl}/categories/${category.id}`,
        {
          headers: this.getHeaders(),
        },
      )
      .pipe(
        take(1),
        finalize(() => {
          this.deletingCategoryId = null;
          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.categories = this.categories.filter(
            (item) => item.id !== category.id,
          );

          this.successMessage = 'Categoria excluída com sucesso.';
          this.errorMessage = '';

          this.changeDetector.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao excluir categoria:', error);

          if (error.status === 401) {
            this.errorMessage =
              'Sua sessão expirou. Faça login novamente.';
          } else if (error.status === 403) {
            this.errorMessage =
              'Você não tem permissão para excluir categorias.';
          } else if (error.status === 404) {
            this.errorMessage = 'Categoria não encontrada.';
          } else if (error.status === 409) {
            this.errorMessage =
              'Esta categoria possui chamados vinculados e não pode ser excluída.';
          } else {
            this.errorMessage =
              'Não foi possível excluir a categoria.';
          }

          this.changeDetector.detectChanges();
        },
      });
  }

  private loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http
      .get<Category[]>(`${this.apiUrl}/categories`, {
        headers: this.getHeaders(),
      })
      .pipe(take(1))
      .subscribe({
        next: (categories) => {
          this.categories = [...categories];
          this.loading = false;

          this.changeDetector.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao carregar categorias:', error);

          if (error.status === 401) {
            this.errorMessage =
              'Sua sessão expirou. Faça login novamente.';
          } else {
            this.errorMessage =
              'Não foi possível carregar as categorias.';
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