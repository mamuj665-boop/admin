import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from '../core/guards/auth.guard';

export const pagesRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'categories', loadComponent: () => import('./categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'products', loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent) },
      { path: 'orders', loadComponent: () => import('./orders/orders.component').then(m => m.OrdersComponent) },
      { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) }
    ]
  }
];
