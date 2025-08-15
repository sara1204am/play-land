import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';

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
