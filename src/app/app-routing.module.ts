import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { OfertasComponent } from './componentes/ofertas/ofertas.component';
import { ContactComponent } from './componentes/contact/contact.component';
import { LoginModule } from './componentes/admin/login/login.module';
import { LayoutAdminComponent } from './layout-admin/layout-admin.component';
import { ShoppingCartComponent } from './componentes/shopping-cart/shopping-cart.component';
import { AuthGuard } from './guards/auth.guard';
import { CredentialsGuard } from './guards/credentials.guard';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
      path: '',
      component: LayoutComponent,
      children: [
        {
          path: 'list',
          loadChildren: () => import('./componentes/list-product/list-product.module').then((m) => m.ListProductModule),
        },
        {
          path: 'ofertas',
          component: OfertasComponent
        },
        {
          path: 'contactos',
          component: ContactComponent
        },
        {
          path: 'shopping',
          loadChildren: () => import('./componentes/shopping-cart/shopping-cart.module').then((m) => m.ShoppingCartModule),
        },
      ],
  },
  {
    path: 'login',
    loadChildren: () => import('./componentes/admin/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: '',
    component: LayoutAdminComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard, CredentialsGuard],
    children: [
      {
        path: 'admin',
        loadChildren: () => import('./componentes/admin/admin.module').then((m) => m.AdminModule),
      }
    ],
},
]


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
