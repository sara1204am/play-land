import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { HomeService } from '../home.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-modal-conteo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    TableModule,
    AutoCompleteModule
  ],
  template: `
    <div class="flex flex-col gap-4 p-2">
      <!-- Datos del Conteo -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="font-semibold text-sm">Nombre / Motivo</label>
          <input pInputText [(ngModel)]="conteo.nombre" placeholder="Ej: Auditoría Mensual" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-semibold text-sm">Observación</label>
          <input pInputText [(ngModel)]="conteo.observacion" placeholder="..." />
        </div>
      </div>

      <hr />

      <!-- Buscador de Productos -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">Buscar Producto para agregar</label>
        <div class="flex gap-2">
          <p-autoComplete 
            [(ngModel)]="selectedProduct" 
            [suggestions]="filteredProducts" 
            (completeMethod)="searchProduct($event)" 
            field="nombre" 
            placeholder="Escriba nombre del producto..."
            [style]="{'width':'100%'}"
            [inputStyle]="{'width':'100%'}"
            (onSelect)="onProductSelect($event)"
          >
            <ng-template let-item pTemplate="item">
              <div class="flex items-center gap-2">
                <img [src]="item.img || 'assets/imagenes/no-image.png'" class="w-8 h-8 rounded shadow" />
                <div class="flex flex-col">
                  <span class="font-bold text-sm">{{item.nombre}}</span>
                  <span class="text-xs text-gray-500">{{item.descripcion | slice:0:50}}...</span>
                </div>
              </div>
            </ng-template>
          </p-autoComplete>
        </div>
      </div>

      <!-- Detalle del Conteo -->
      <div class="border rounded-lg overflow-hidden shadow-sm bg-white">
        <p-table #dt [value]="detalles" [scrollable]="true" scrollHeight="350px" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="articuloNombre">
                <div class="flex items-center gap-1">
                  Producto <p-sortIcon field="articuloNombre"></p-sortIcon>
                  <p-columnFilter type="text" field="articuloNombre" display="menu" class="ml-auto"></p-columnFilter>
                </div>
              </th>
              <th style="width: 180px" pSortableColumn="ubicacionNombre">
                <div class="flex items-center gap-1">
                  Ubicación <p-sortIcon field="ubicacionNombre"></p-sortIcon>
                  <p-columnFilter type="text" field="ubicacionNombre" display="menu" class="ml-auto"></p-columnFilter>
                </div>
              </th>
              <th style="width: 180px" pSortableColumn="variante">
                <div class="flex items-center gap-1">
                  Variante / Detalle <p-sortIcon field="variante"></p-sortIcon>
                  <p-columnFilter type="text" field="variante" display="menu" class="ml-auto"></p-columnFilter>
                </div>
              </th>
              <th style="width: 120px" pSortableColumn="cantidadContada">
                <div class="flex items-center gap-1">
                  Cantidad <p-sortIcon field="cantidadContada"></p-sortIcon>
                  <p-columnFilter type="numeric" field="cantidadContada" display="menu" class="ml-auto"></p-columnFilter>
                </div>
              </th>
              <th style="width: 50px"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item let-i="rowIndex">
            <tr [ngClass]="{'bg-amber-50/70 border-l-4 border-l-amber-500': !item.id, 'hover:bg-slate-50': item.id}">
              <td class="pl-3">
                <div class="flex flex-col">
                  <span class="font-bold text-xs flex items-center gap-1.5">
                    {{item.articuloNombre}}
                    @if(!item.id) {
                      <span class="text-[9px] font-extrabold uppercase bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full tracking-wider shadow-sm animate-pulse border border-amber-200">Pendiente</span>
                    }
                  </span>
                  <span class="text-[10px] text-gray-400 font-mono">{{item.articuloId}}</span>
                </div>
              </td>
              <td style="width: 180px">
                <p-dropdown 
                  [options]="ubicaciones" 
                  [(ngModel)]="item.ubicacionId" 
                  optionLabel="nombre" 
                  optionValue="id"
                  placeholder="Selec..."
                  appendTo="body"
                  [style]="{'width':'100%'}"
                  (onChange)="item.ubicacionNombre = getUbicacionNombre(item.ubicacionId)"
                ></p-dropdown>
              </td>
              <td style="width: 180px">
                <input pInputText [(ngModel)]="item.variante" placeholder="Color, talla..." class="p-inputtext-sm w-full" />
              </td>
              <td style="width: 120px">
                <p-inputNumber [(ngModel)]="item.cantidadContada" [min]="0" class="p-inputtext-sm w-full"></p-inputNumber>
              </td>
              <td style="width: 50px">
                <button class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-50 text-red-600 transition-colors" (click)="removeItem(i)">
                  <span class="material-symbols-outlined text-sm">delete</span>
                </button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center p-4 text-gray-500 italic">No hay productos agregados. Busque un producto arriba para comenzar.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Acciones -->
      <div class="flex justify-end gap-2 mt-2">
        <button class="px-4 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition flex items-center gap-2" (click)="close()">
          <span class="material-symbols-outlined">close</span>
          Cancelar
        </button>
        <button class="px-6 py-2 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" [disabled]="!canSave()" (click)="save()">
          <span class="material-symbols-outlined">check</span>
          Finalizar y Guardar Conteo
        </button>
      </div>
    </div>
  `,
})
export class ModalConteoComponent implements OnInit {
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private service = inject(HomeService);

  public conteo: any = {
    nombre: '',
    observacion: ''
  };

  public detalles: any[] = [];
  public ubicaciones: any[] = [];
  
  public selectedProduct: any;
  public filteredProducts: any[] = [];
  public isEdit: boolean = false;

  ngOnInit(): void {
    this.loadUbicaciones();
    if (this.config.data?.initial) {
      this.isEdit = true;
      this.conteo = { ...this.config.data.initial };
      this.loadDetalles(this.conteo.id);
    }
  }

  async loadUbicaciones() {
    this.ubicaciones = await lastValueFrom(this.service.getUbicaciones());
  }

  getUbicacionNombre(id: string): string {
    const ubi = this.ubicaciones.find(u => u.id === id);
    return ubi ? ubi.nombre : 'N/A';
  }

  async loadDetalles(conteoId: string) {
    const rawDetalles = await lastValueFrom(this.service.getConteoDetalles(conteoId));
    const ids = rawDetalles.map(d => d.articuloId);
    const articulos = await lastValueFrom(this.service.getProductosByFilter(ids));
    
    this.detalles = rawDetalles.map(d => {
      const art = articulos.find(a => a.id === d.articuloId);
      const ubi = this.ubicaciones.find(u => u.id === d.ubicacionId);
      return {
        ...d,
        articuloNombre: art?.nombre || 'Producto Desconocido',
        ubicacionNombre: ubi?.nombre || 'N/A'
      };
    });
  }

  async searchProduct(event: any) {
    const query = event.query;
    this.filteredProducts = await lastValueFrom(this.service.getProductStoreBySearchWithTagAll(query));
  }

  onProductSelect(event: any) {
    const product = event.value || event;
    const ubiId = this.ubicaciones.length > 0 ? this.ubicaciones[0].id : null;
    const ubiNombre = this.ubicaciones.length > 0 ? this.ubicaciones[0].nombre : 'N/A';
    this.detalles.unshift({
      articuloId: product.id,
      articuloNombre: product.nombre,
      variante: '',
      ubicacionId: ubiId,
      ubicacionNombre: ubiNombre,
      cantidadContada: 1,
      cantidadSistema: 0,
      diferencia: 0
    });
    this.selectedProduct = null;
  }

  removeItem(index: number) {
    this.detalles.splice(index, 1);
  }

  canSave(): boolean {
    return this.conteo.nombre && this.detalles.length > 0 && this.detalles.every(d => d.ubicacionId);
  }

  close() {
    this.ref.close();
  }

  save() {
    this.ref.close({
      conteo: this.conteo,
      detalles: this.detalles
    });
  }
}
