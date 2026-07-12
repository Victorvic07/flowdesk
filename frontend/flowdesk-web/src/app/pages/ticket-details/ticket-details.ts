import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';

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

@Component({
  selector: 'app-ticket-details',
  imports: [RouterLink, DatePipe],
  templateUrl: './ticket-details.html',
  styleUrl: './ticket-details.scss',
})
export class TicketDetails implements OnInit {
  ticket: Ticket | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private readonly http: HttpClient,
    private readonly route: ActivatedRoute,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadTicket();
  }

  private loadTicket(): void {
    this.loading = true;
    this.errorMessage = '';
    this.ticket = null;

    const ticketId = this.route.snapshot.paramMap.get('id');
    const token = localStorage.getItem('flowdesk_token');

    if (!ticketId) {
      this.errorMessage = 'Chamado inválido.';
      this.loading = false;
      return;
    }

    if (!token) {
      this.errorMessage = 'Sessão não encontrada. Faça login novamente.';
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<Ticket>(
        `http://127.0.0.1:8000/tickets/${ticketId}`,
        { headers },
      )
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: (ticket) => {
          console.log('Chamado recebido da API:', ticket);

          this.ticket = ticket;
          this.errorMessage = '';
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
              'Não foi possível carregar o chamado.';
          }
        },
      });
  }
}