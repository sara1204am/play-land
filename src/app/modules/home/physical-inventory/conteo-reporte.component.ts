import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HomeService } from '../home.service';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-conteo-reporte',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    RouterModule,
    TooltipModule,
    InputTextModule,
    DialogModule
  ],
  template: `
    <div class="w-full h-full p-5 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div class="container mx-auto">
        
        <!-- Header -->
        <div class="flex items-center gap-4 mb-6">
          <button class="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-200 text-gray-700 transition-colors" [routerLink]="['/home/physical-inventory']">
            <span class="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <div class="flex flex-col">
            <h1 class="text-2xl font-bold text-gray-800">Reporte de Conteo Físico</h1>
            <p class="text-gray-500" *ngIf="conteo">{{conteo.nombre}} - {{conteo.fecha | date:'medium'}}</p>
          </div>
        </div>

        <!-- Resumen de Observaciones -->
        <div class="bg-white p-4 rounded-xl shadow-sm border mb-6" *ngIf="conteo?.observacion">
            <span class="font-bold text-gray-700 block mb-1">Observaciones:</span>
            <p class="text-gray-600">{{conteo.observacion}}</p>
        </div>

        <!-- Tabla Agrupada -->
        <div class="bg-white rounded-xl shadow-md border overflow-hidden">
          <p-table 
            [value]="groupedData" 
            dataKey="articuloId" 
            [rows]="10" 
            [paginator]="true" 
            [globalFilterFields]="['nombre']"
            #dt
            styleClass="p-datatable-lg"
          >
            <ng-template pTemplate="caption">
              <div class="flex justify-between items-center">
                <span class="text-lg font-bold text-gray-700">Resumen por Producto</span>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-2 top-2 text-gray-400">search</span>
                  <input type="text" pInputText placeholder="Buscar producto..." (input)="dt.filterGlobal($any($event.target).value, 'contains')" class="p-inputtext-sm border rounded p-2 pl-9 w-64" />
                </div>
              </div>
            </ng-template>

            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="nombre">Producto <p-sortIcon field="nombre"></p-sortIcon></th>
                <th pSortableColumn="total" style="width: 150px">Total Contado <p-sortIcon field="total"></p-sortIcon></th>
                <th style="width: 100px">Alerta</th>
                <th style="width: 100px" class="text-center">Ver</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-product>
              <tr [ngClass]="{'bg-red-50': product.total < 2}">
                <td>
                   <div class="flex items-center gap-3">
                      <span class="font-bold text-gray-800">{{product.nombre}}</span>
                      <span class="text-xs text-gray-400 font-mono">{{product.articuloId}}</span>
                   </div>
                </td>
                <td>
                  <span class="text-lg font-black" [ngClass]="{'text-red-600': product.total < 2, 'text-green-600': product.total >= 2}">
                    {{product.total}}
                  </span>
                </td>
                <td>
                    <span *ngIf="product.total < 2" class="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                         BAJO
                    </span>
                </td>
                <td class="text-center">
                   <button class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 text-blue-600 mx-auto transition-colors" (click)="showDetails(product)">
                      <span class="material-symbols-outlined">list</span>
                   </button>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>

        <!-- Modal de Detalle -->
        <p-dialog [(visible)]="displayDetails" [header]="'Detalle de Conteo: ' + selectedProduct?.nombre" [modal]="true" [style]="{width: '600px'}" [draggable]="false" [resizable]="false">
            <div *ngIf="selectedProduct">
                <p-table [value]="selectedProduct.detalles" styleClass="p-datatable-sm">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Variante / Detalle</th>
                            <th>Ubicación</th>
                            <th style="width: 100px">Cantidad</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-detalle>
                        <tr>
                            <td>{{detalle.variante || 'Sin detalle'}}</td>
                            <td>{{detalle.ubicacionNombre || 'N/A'}}</td>
                            <td class="font-bold">{{detalle.cantidadContada}}</td>
                        </tr>
                    </ng-template>
                </p-table>
                <div class="mt-4 flex justify-end">
                    <button pButton label="Cerrar" icon="pi pi-times" class="p-button-text" (click)="displayDetails = false"></button>
                </div>
            </div>
        </p-dialog>

      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr.bg-red-50 {
      background-color: #fef2f2 !important;
    }
  `]
})
export class ConteoReporteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(HomeService);

  public conteoId: string | null = null;
  public conteo: any = null;
  public groupedData: any[] = [];

  public displayDetails: boolean = false;
  public selectedProduct: any = null;

  ngOnInit(): void {
    this.conteoId = this.route.snapshot.paramMap.get('id');
    if (this.conteoId) {
      this.loadData();
    }
  }

  showDetails(product: any) {
    this.selectedProduct = product;
    this.displayDetails = true;
  }

  async loadData() {
    try {
      // 1. Cargar cabecera
      const conteos = await lastValueFrom(this.service.getConteos());
      this.conteo = conteos.find(c => c.id === this.conteoId);

      // 2. Cargar detalles
      const rawDetalles = await lastValueFrom(this.service.getConteoDetalles(this.conteoId!));
      
      // 3. Enriquecer con nombres (artículos y ubicaciones)
      const articulosIds = [...new Set(rawDetalles.map(d => d.articuloId))];
      const [articulos, ubicaciones] = await Promise.all([
        lastValueFrom(this.service.getProductosByFilter(articulosIds)),
        lastValueFrom(this.service.getUbicaciones())
      ]);

      // 4. Agrupar
      const groups: { [key: string]: any } = {};

      rawDetalles.forEach(d => {
        if (!groups[d.articuloId]) {
          const art = articulos.find(a => a.id === d.articuloId);
          groups[d.articuloId] = {
            articuloId: d.articuloId,
            nombre: art?.nombre || 'Producto Desconocido',
            total: 0,
            detalles: []
          };
        }
        
        const ubi = ubicaciones.find(u => u.id === d.ubicacionId);
        groups[d.articuloId].total += d.cantidadContada;
        groups[d.articuloId].detalles.push({
          ...d,
          ubicacionNombre: ubi?.nombre || 'N/A'
        });
      });

      this.groupedData = Object.values(groups);
    } catch (e) {
      console.error(e);
    }
  }
}
