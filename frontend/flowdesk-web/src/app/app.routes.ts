import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { NewTicket } from './pages/new-ticket/new-ticket';
import { Tickets } from './pages/tickets/tickets';
import { TicketDetails } from './pages/ticket-details/ticket-details';

export const routes: Routes = [
  {
    path: '',
    component: Login,
  },
  {
    path: 'dashboard',
    component: Dashboard,
  },
  {
    path: 'tickets',
    component: Tickets,
  },

  {
    path: 'tickets/:id',
    component: TicketDetails,
  },

  {
    path: 'new-ticket',
    component: NewTicket,
  },
  {
    path: '**',
    redirectTo: '',
  },
];