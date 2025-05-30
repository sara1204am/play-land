import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentasComponent } from './ventas/ventas.component';
import { InventarioComponent } from './inventario/inventario.component';
import { RouterModule, Routes } from '@angular/router';
import { TableModule } from 'primeng/table';


const routes: Routes = [
  { path: 'ventas', component: VentasComponent, data: { title: 'Venta' } },
  { path: 'inventario', component: InventarioComponent, data: { title: 'Inventario' } }

];

@NgModule({
  declarations: [
    VentasComponent,
    InventarioComponent
  ],
  imports: [
    CommonModule,
    TableModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { }
