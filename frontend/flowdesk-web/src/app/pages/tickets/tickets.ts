import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';


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
  selector: 'app-tickets',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './tickets.html',
  styleUrl: './tickets.scss',
})
export class Tickets implements OnInit {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];

  statusFilter = '';
  priorityFilter = '';

  loading = true;
  errorMessage = '';

  constructor(
  private readonly http: HttpClient,
  private readonly changeDetector: ChangeDetectorRef,
) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  applyFilters(): void {
    this.filteredTickets = this.tickets.filter((ticket) => {
      const matchesStatus =
        !this.statusFilter || ticket.status === this.statusFilter;

      const matchesPriority =
        !this.priorityFilter || ticket.priority === this.priorityFilter;

      return matchesStatus && matchesPriority;
    });
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.priorityFilter = '';
    this.filteredTickets = [...this.tickets];
  }

  private loadTickets(): void {
    const token = localStorage.getItem('flowdesk_token');

    if (!token) {
      this.errorMessage = 'Sessão não encontrada.';
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
  this.filteredTickets = [...tickets];
  this.loading = false;
  this.changeDetector.detectChanges();
},
error: () => {
  this.errorMessage = 'Não foi possível carregar os chamados.';
  this.loading = false;
  this.changeDetector.detectChanges();
},
      });
  }
}