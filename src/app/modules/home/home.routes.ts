import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { AuthGuard } from '../../guards/auth.guard';

export const homeRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
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
        path: 'dashboard',
        loadComponent: () =>
          import('./sales-dashboard/sales-dashboard.component').then(
            (m) => m.SalesDashboardComponent,
          ),
      },
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
      {
        path: 'physical-inventory',
        loadComponent: () =>
          import('./physical-inventory/physical-inventory.component').then(
            (m) => m.PhysicalInventoryComponent,
          ),
      },
      {
        path: 'physical-inventory/report/:id',
        loadComponent: () =>
          import('./physical-inventory/conteo-reporte.component').then(
            (m) => m.ConteoReporteComponent,
          ),
      },
    ],
  },
];
