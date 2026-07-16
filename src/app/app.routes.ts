import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(c => c.Home),
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth').then(c => c.Auth),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(c => c.Dashboard),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then(c => c.NotFound),
  },
];
