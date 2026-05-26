import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'pages', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes) },
  { path: 'pages', loadChildren: () => import('./pages/pages.routes').then(m => m.pagesRoutes) },
  { path: '**', redirectTo: 'pages' }
];
