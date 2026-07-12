import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin, take } from 'rxjs';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category_id: number | null;
  requester_id: number;
  technician_id: number | null;
  created_at: string;
  updated_at: string;
}

interface TicketComment {
  id: number;
  content: string;
  ticket_id: number;
  author_id: number;
  created_at: string;
}

interface TicketHistory {
  id: number;
  ticket_id: number;
  user_id: number;
  action: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

@Component({
  selector: 'app-ticket-details',
  imports: [RouterLink, DatePipe, FormsModule],
  templateUrl: './ticket-details.html',
  styleUrl: './ticket-details.scss',
})
export class TicketDetails implements OnInit {
  ticket: Ticket | null = null;
  comments: TicketComment[] = [];
  history: TicketHistory[] = [];

  selectedStatus = '';
  newComment = '';

  loading = true;
  savingStatus = false;
  assigning = false;
  sendingComment = false;

  errorMessage = '';
  actionMessage = '';

  private ticketId = '';
  private readonly apiUrl = 'http://127.0.0.1:8000';

  constructor(
    private readonly http: HttpClient,
    private readonly route: ActivatedRoute,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.ticketId) {
      this.errorMessage = 'Chamado inválido.';
      this.loading = false;
      return;
    }

    this.loadPage();
  }

  changeStatus(): void {
    if (!this.selectedStatus || !this.ticket) {
      return;
    }

    this.savingStatus = true;
    this.actionMessage = '';

    this.http
      .patch<Ticket>(
        `${this.apiUrl}/tickets/${this.ticketId}/status`,
        {
          status: this.selectedStatus,
        },
        {
          headers: this.getHeaders(),
        },
      )
      .pipe(
        take(1),
        finalize(() => {
          this.savingStatus = false;
          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: (ticket) => {
          this.ticket = ticket;
          this.selectedStatus = ticket.status;
          this.actionMessage = 'Status atualizado com sucesso.';
          this.loadHistory();
        },
        error: (error) => {
          console.error('Erro ao alterar status:', error);
          this.actionMessage = 'Não foi possível alterar o status.';
        },
      });
  }

  assignToMe(): void {
    this.assigning = true;
    this.actionMessage = '';

    this.http
      .patch<Ticket>(
        `${this.apiUrl}/tickets/${this.ticketId}/assign-to-me`,
        {},
        {
          headers: this.getHeaders(),
        },
      )
      .pipe(
        take(1),
        finalize(() => {
          this.assigning = false;
          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: (ticket) => {
          this.ticket = ticket;
          this.actionMessage = 'Chamado atribuído para você.';
          this.loadHistory();
        },
        error: (error) => {
          console.error('Erro ao atribuir chamado:', error);
          this.actionMessage = 'Não foi possível atribuir o chamado.';
        },
      });
  }

  addComment(): void {
    const content = this.newComment.trim();

    if (!content) {
      return;
    }

    this.sendingComment = true;
    this.actionMessage = '';

    this.http
      .post<TicketComment>(
        `${this.apiUrl}/tickets/${this.ticketId}/comments`,
        {
          content,
        },
        {
          headers: this.getHeaders(),
        },
      )
      .pipe(
        take(1),
        finalize(() => {
          this.sendingComment = false;
          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: (comment) => {
          this.comments = [...this.comments, comment];
          this.newComment = '';
          this.actionMessage = 'Comentário adicionado com sucesso.';
          this.loadHistory();
        },
        error: (error) => {
          console.error('Erro ao adicionar comentário:', error);
          this.actionMessage = 'Não foi possível adicionar o comentário.';
        },
      });
  }

  private loadPage(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      ticket: this.http.get<Ticket>(
        `${this.apiUrl}/tickets/${this.ticketId}`,
        {
          headers: this.getHeaders(),
        },
      ),
      comments: this.http.get<TicketComment[]>(
        `${this.apiUrl}/tickets/${this.ticketId}/comments`,
        {
          headers: this.getHeaders(),
        },
      ),
      history: this.http.get<TicketHistory[]>(
        `${this.apiUrl}/tickets/${this.ticketId}/history`,
        {
          headers: this.getHeaders(),
        },
      ),
    })
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: ({ ticket, comments, history }) => {
          this.ticket = ticket;
          this.comments = comments;
          this.history = history;
          this.selectedStatus = ticket.status;
        },
        error: (error) => {
          console.error('Erro ao carregar chamado:', error);

          if (error.status === 404) {
            this.errorMessage = 'Chamado não encontrado.';
          } else if (
            error.status === 401 ||
            error.status === 403
          ) {
            this.errorMessage =
              'Sua sessão expirou. Faça login novamente.';
          } else {
            this.errorMessage =
              'Não foi possível carregar os dados do chamado.';
          }
        },
      });
  }

  private loadHistory(): void {
    this.http
      .get<TicketHistory[]>(
        `${this.apiUrl}/tickets/${this.ticketId}/history`,
        {
          headers: this.getHeaders(),
        },
      )
      .pipe(take(1))
      .subscribe({
        next: (history) => {
          this.history = history;
          this.changeDetector.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao atualizar histórico:', error);
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