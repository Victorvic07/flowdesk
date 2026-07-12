import { Routes } from '@angular/router';

import { authGuard } from './guards/auth-guard';
import { AppLayout } from './layout/app-layout/app-layout';
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
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
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
        path: 'users',
        component: Users,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];