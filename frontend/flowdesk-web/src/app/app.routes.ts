import { Routes } from '@angular/router';

import { authGuard } from './guards/auth-guard';
import { Categories } from './pages/categories/categories';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { NewTicket } from './pages/new-ticket/new-ticket';
import { TicketDetails } from './pages/ticket-details/ticket-details';
import { Tickets } from './pages/tickets/tickets';
import { Users } from './pages/users/users';

export const routes: Routes = [
  {
    path: '',
    component: Login,
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },
  {
    path: 'tickets',
    component: Tickets,
    canActivate: [authGuard],
  },
  {
    path: 'tickets/:id',
    component: TicketDetails,
    canActivate: [authGuard],
  },
  {
    path: 'new-ticket',
    component: NewTicket,
    canActivate: [authGuard],
  },
  {
    path: 'categories',
    component: Categories,
    canActivate: [authGuard],
  },
  {
    path: 'users',
    component: Users,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];