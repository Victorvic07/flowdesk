import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface Category {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface TicketResponse {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  category_id: number | null;
  requester_id: number;
  technician_id: number | null;
  created_at: string;
  updated_at: string;
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
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  createTicket(): void {
    this.errorMessage = '';

    const title = this.title.trim();
    const description = this.description.trim();

    if (!title || !description || !this.categoryId) {
      this.errorMessage = 'Preencha todos os campos obrigatórios.';
      this.changeDetector.detectChanges();
      return;
    }

    this.loading = true;
    this.changeDetector.detectChanges();

    this.http
      .post<TicketResponse>(
        'http://127.0.0.1:8000/tickets',
        {
          title,
          description,
          priority: this.priority,
          category_id: this.categoryId,
        },
        {
          headers: this.getHeaders(),
        },
      )
      .subscribe({
        next: (ticket) => {
          console.log('Chamado criado:', ticket);

          this.loading = false;
          this.errorMessage = '';

          this.changeDetector.detectChanges();
          this.router.navigate(['/tickets', ticket.id]);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erro ao criar chamado:', error);

          this.loading = false;

          if (error.status === 401) {
            localStorage.removeItem('flowdesk_token');
            this.changeDetector.detectChanges();
            this.router.navigate(['/']);
            return;
          }

          if (error.status === 422) {
            this.errorMessage =
              'Verifique se todos os campos foram preenchidos corretamente.';
          } else if (error.status === 403) {
            this.errorMessage =
              'Você não tem permissão para criar chamados.';
          } else {
            this.errorMessage =
              'Não foi possível criar o chamado.';
          }

          this.changeDetector.detectChanges();
        },
      });
  }

  private loadCategories(): void {
    this.loadingCategories = true;
    this.errorMessage = '';

    this.http
      .get<Category[]>(
        'http://127.0.0.1:8000/categories',
        {
          headers: this.getHeaders(),
        },
      )
      .subscribe({
        next: (categories) => {
          this.categories = categories.filter(
            (category) => category.is_active,
          );

          this.loadingCategories = false;
          this.changeDetector.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erro ao carregar categorias:', error);

          this.loadingCategories = false;

          if (error.status === 401) {
            localStorage.removeItem('flowdesk_token');
            this.changeDetector.detectChanges();
            this.router.navigate(['/']);
            return;
          }

          this.errorMessage =
            'Não foi possível carregar as categorias.';

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