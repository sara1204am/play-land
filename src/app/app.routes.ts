import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'store',
    loadComponent: () =>
      import('./modules/store/store.component').then(
        (m) => m.StoreComponent,
      ),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./modules/login/login.routes').then((m) => m.loginRoutes),
    title: 'Login',
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./modules/home/home.routes').then((m) => m.homeRoutes),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./modules/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent,
      ),
  },
  { path: '', redirectTo: 'store', pathMatch: 'full' },
  {
    path: '**',
    pathMatch: 'full',
    loadComponent: () =>
      import('./modules/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
    title: 'Not Found',
  },
];
