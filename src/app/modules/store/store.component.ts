import { Component, inject, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { SearchPipe } from './search.pipe';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [FormsModule, DropdownModule, SearchPipe, ProgressSpinnerModule],
  templateUrl: './store.component.html',
  styleUrl: './store.component.css'
})
export class StoreComponent implements OnInit {

  private service: HomeService = inject(HomeService);

  list: any = [];

  seleccionado: any = null;
  ordenSeleccionado!: any;

  searchTerm: string = '';

  opcionesOrden = [
    { label: 'Precio: Mayor a Menor', value: 'desc' },
    { label: 'Precio: Menor a Mayor', value: 'asc' },
    { label: 'Nombre: A-Z', value: 'nombreAsc' },
    { label: 'Nombre: Z-A', value: 'nombreDesc' }
  ];
  selectCategory  = 'juguete';

  loading = false;

  categories = [
  { key: 'juguete', label: 'Juguetes', icon: 'toys' },
  { key: 'peluche', label: 'Peluches', icon: 'pets' },
  { key: 'amigurumi', label: 'Amigurumis', icon: 'favorite' },
  { key: 'bebes', label: 'Bebes', icon: 'child_care' },
  { key: 'otro', label: 'Varios',   icon: 'category' },
];


  calcularPrecioFinal(precio: number, descuento: number) {
    return precio - (precio * descuento) / 100;
  }

  abrirModal(peluche: any) {
    this.seleccionado = peluche;
  }

  cerrarModal() {
    this.seleccionado = null;
  }

  ngOnInit() {
    this.getData()
  }
  async getData() {
    this.loading = true;
    try {
      this.list = await lastValueFrom(this.service.getProductStore(this.selectCategory))

      this.loading = false;
    } catch (e) {
      console.log(e)
      this.loading = false;
    }

  }

  ordenarPeluches() {

    switch (this.ordenSeleccionado.value) {
      case 'desc':
        this.list.sort((a: any, b: any) => b.precio - a.precio);
        break;
      case 'asc':
        this.list.sort((a: any, b: any) => a.precio - b.precio);
        break;
      case 'nombreAsc':
        this.list.sort((a: any, b: any) => (a.nombre || '').localeCompare(b.nombre || ''));
        break;
      case 'nombreDesc':
        this.list.sort((a: any, b: any) => (b.nombre || '').localeCompare(a.nombre || ''));
        break;
    }

  }



}
