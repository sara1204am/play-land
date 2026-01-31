import { Component, inject, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { SearchPipe } from './search.pipe';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NgClass, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [FormsModule, DropdownModule, SearchPipe, ProgressSpinnerModule, NgClass, NgOptimizedImage],
  templateUrl: './store.component.html',
  styleUrl: './store.component.css'
})
export class StoreComponent implements OnInit {

  private service: HomeService = inject(HomeService);

  list: any = [];

  seleccionado: any = null;
  viewMap: boolean = false;
  ordenSeleccionado!: any;

  searchTerm: string = '';

  opcionesOrden = [
    { label: 'Precio: Mayor a Menor', value: 'desc' },
    { label: 'Precio: Menor a Mayor', value: 'asc' },
    { label: 'Nombre: A-Z', value: 'nombreAsc' },
    { label: 'Nombre: Z-A', value: 'nombreDesc' }
  ];
  selectCategory = 'peluche';

  loading = false;

  categories = [
    { key: 'juguete', label: 'Juguetes', icon: 'toys' },
    { key: 'vehiculos', label: 'Vehículos Infantiles', icon: 'directions_car' },
    { key: 'peluche', label: 'Peluches', icon: 'pets' },
    { key: 'amigurumi', label: 'Amigurumis', icon: 'favorite' },
    { key: 'bebes', label: 'Bebes', icon: 'child_care' },
    { key: 'otro', label: 'Varios', icon: 'category' },
  ];

  categoriesObj: any = {
    juguete: 'Juguetes',
    peluche: 'Peluches',
    amigurumi: 'Amigurumis',
    bebes: 'Bebes',
    otro: 'Varios'
  }
  categoryStyles: any = {
    juguete: 'bg-blue-100 text-blue-700 border-blue-300',
    peluche: 'bg-pink-100 text-pink-700 border-pink-300',
    amigurumi: 'bg-purple-100 text-purple-700 border-purple-300',
    bebes: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    otro: 'bg-gray-100 text-gray-700 border-gray-300'
  };

  viewPromotion = false;

  private debounceTimer: any;

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
    this.searchTerm = '';
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


  onSearchChange() {
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      if (this.searchTerm === '') {
        this.getData()
      } else {
        this.onSearch();
      }

    }, 800
    );
  }

  async onSearch() {
    this.loading = true;
    try {
      this.list = await lastValueFrom(this.service.getProductStoreBySearch(this.searchTerm))
      this.loading = false;
    } catch (e) {
      console.log(e)
      this.loading = false;
    }
  }
}
