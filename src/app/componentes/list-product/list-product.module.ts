import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ListProductComponent } from './list-product.component';

const routes: Routes = [
    { path: '', component: ListProductComponent, data: { title: 'Productos' } }
];
  

@NgModule({
  declarations: [
    ListProductComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ListProductModule { }
