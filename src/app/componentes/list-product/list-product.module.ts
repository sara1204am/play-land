import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ListProductComponent } from './list-product.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
    { path: '', component: ListProductComponent, data: { title: 'Productos' } }
];
  

@NgModule({
  declarations: [
    ListProductComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ListProductModule { }
