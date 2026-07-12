import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Tickets } from './pages/tickets/tickets';
import { TicketDetails } from './pages/ticket-details/ticket-details';
import { NewTicket } from './pages/new-ticket/new-ticket';
import { Categories } from './pages/categories/categories';

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
    path: 'categories',
    component: Categories,
  },
  {
    path: '**',
    redirectTo: '',
  },
];