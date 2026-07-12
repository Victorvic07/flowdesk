import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { NewTicket } from './pages/new-ticket/new-ticket';

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
    path: 'new-ticket',
    component: NewTicket,
  },
  {
    path: '**',
    redirectTo: '',
  },
];