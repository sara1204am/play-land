import { Component } from '@angular/core';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent {
  products = [
    { name: 'Toy', price: 20 },
    { name: 'Book', price: 15 }
  ];
}
