import { Component, inject, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { SearchPipe } from './search.pipe';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [FormsModule, DropdownModule, SearchPipe],
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
    { label: 'Descuento: Mayor a Menor', value: 'desc' },
    { label: 'Descuento: Menor a Mayor', value: 'asc' },
    { label: 'Nombre: A-Z', value: 'nombreAsc' },
    { label: 'Nombre: Z-A', value: 'nombreDesc' }
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
    try {
      this.list = await lastValueFrom(this.service.getProductStore())
    } catch (e) {
      console.log(e)
    }

  }

  ordenarPeluches() {

    switch (this.ordenSeleccionado.value) {
      case 'desc':
        this.list.sort((a: any, b: any) => b.descuento - a.descuento);
        break;
      case 'asc':
        this.list.sort((a: any, b: any) => a.descuento - b.descuento);
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
