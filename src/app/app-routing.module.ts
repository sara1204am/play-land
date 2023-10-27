import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
      path: '',
      component: LayoutComponent,
      children: [
        {
          path: 'list',
          loadChildren: () => import('./componentes/list-product/list-product.module').then((m) => m.ListProductModule),
        }
      ],
  },
]


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
