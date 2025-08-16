import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { AuthGuard } from '../../guards/auth.guard';

export const homeRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    component: HomeComponent,
    title: 'Home',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'stock',
        loadComponent: () =>
          import('./stock/stock.component').then(
            (m) => m.StockComponent,
          ),
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('./sales/sales.component').then(
            (m) => m.SalesComponent,
          ),
      },
    ],
  },
];
