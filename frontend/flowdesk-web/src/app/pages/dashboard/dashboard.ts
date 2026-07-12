import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_USER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category_id: number | null;
  requester_id: number;
  technician_id: number | null;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  tickets: Ticket[] = [];
  loading = true;
  errorMessage = '';

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  get openCount(): number {
    return this.tickets.filter((ticket) => ticket.status === 'OPEN').length;
  }

  get inProgressCount(): number {
    return this.tickets.filter(
      (ticket) => ticket.status === 'IN_PROGRESS',
    ).length;
  }

  get waitingUserCount(): number {
    return this.tickets.filter(
      (ticket) => ticket.status === 'WAITING_USER',
    ).length;
  }

  get resolvedCount(): number {
    return this.tickets.filter(
      (ticket) => ticket.status === 'RESOLVED',
    ).length;
  }

  private loadTickets(): void {
    const token = localStorage.getItem('flowdesk_token');

    if (!token) {
      this.errorMessage = 'Sessão não encontrada. Faça login novamente.';
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<Ticket[]>('http://127.0.0.1:8000/tickets', { headers })
      .subscribe({
        next: (tickets) => {
          this.tickets = tickets;
          this.loading = false;
        },
        error: (error) => {
          console.error(error);
          this.errorMessage = 'Não foi possível carregar os chamados.';
          this.loading = false;
        },
      });
  }
}