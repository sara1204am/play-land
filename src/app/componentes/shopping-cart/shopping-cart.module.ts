import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShoppingCartComponent } from './shopping-cart.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SumPipe } from 'src/app/pipes/sum.pipe';

const routes: Routes = [
  { path: '', component: ShoppingCartComponent, data: { title: 'Productos' } }
];


@NgModule({
  declarations: [
    ShoppingCartComponent,
    SumPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ShoppingCartModule { }
