import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { OfertasComponent } from './componentes/ofertas/ofertas.component';
import { ContactComponent } from './componentes/contact/contact.component';

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
        }
      ],
  },
]


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
