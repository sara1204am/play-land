import { Component, inject, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlayTableComponent } from '../../table/play-table.component';
import { HomeService } from '../home.service';
import { lastValueFrom } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ModalUbicacionComponent } from './modal-ubicacion.component';
import { ModalConteoComponent } from './modal-conteo.component';
import { SalesDashboardComponent } from '../sales-dashboard/sales-dashboard.component';

@Component({
  selector: 'app-physical-inventory',
  standalone: true,
  imports: [
    CommonModule,
    PlayTableComponent,
    ToastModule,
    ButtonModule,
    TooltipModule,
    SalesDashboardComponent
  ],
  providers: [DialogService, MessageService],
  templateUrl: './physical-inventory.component.html',
  styleUrl: './physical-inventory.component.css'
})
export class PhysicalInventoryComponent implements OnInit {
  private service = inject(HomeService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<any>;

  public activeTab: 'dashboard' | 'stock' | 'ubicaciones' | 'conteos' = 'dashboard';

  public config = {
    globalSearch: true,
    resetButton: true,
    configColumns: true
  };

  // --- Columnas Stock Físico ---
  public columnsStock: any[] = [
    { key: 'producto', header: 'Producto', type: 'text', hidden: false, sortable: true, filterable: true, globalSearch: true },
    { key: 'variante', header: 'Variante', type: 'text', hidden: false, sortable: true, filterable: true },
    { key: 'ubicacion', header: 'Ubicación', type: 'text', hidden: false, sortable: true, filterable: true },
    { key: 'cantidad', header: 'Cantidad', type: 'number', hidden: false, sortable: true, filterable: true }
  ];
  public dataStock: any[] = [];

  // --- Columnas Ubicaciones ---
  public columnsUbi: any[] = [
    { key: 'nombre', header: 'Nombre', type: 'text', hidden: false, sortable: true, filterable: true, globalSearch: true },
    { key: 'descripcion', header: 'Descripción', type: 'text', hidden: false },
    { key: 'activo', header: 'Estado', type: 'boolean', hidden: false, sortable: true }
  ];
  public dataUbi: any[] = [];

  // --- Columnas Conteos ---
  public columnsConteo: any[] = [
    { key: 'nombre', header: 'Nombre / Motivo', type: 'text', hidden: false, sortable: true, filterable: true, globalSearch: true },
    { key: 'fecha', header: 'Fecha', type: 'date', hidden: false, sortable: true },
    { key: 'observacion', header: 'Observación', type: 'text', hidden: false }
  ];
  public dataConteo: any[] = [];

  ngOnInit(): void {
    this.loadAll();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.columnsConteo = [
        { key: 'nombre', header: 'Nombre / Motivo', type: 'text', hidden: false, sortable: true, filterable: true, globalSearch: true },
        { key: 'fecha', header: 'Fecha', type: 'date', hidden: false, sortable: true },
        { key: 'observacion', header: 'Observación', type: 'text', hidden: false },
        { key: 'acciones', header: 'Acciones', type: 'template', cellTemplate: this.actionsTpl, hidden: false }
      ];
    });
  }

  async loadAll() {
    await Promise.all([
      this.loadStock(),
      this.loadUbicaciones(),
      this.loadConteos()
    ]);
  }

  async loadStock() {
    try {
      const res = await lastValueFrom(this.service.getStockFisico());
      this.dataStock = res.map(item => ({
        ...item,
        producto: item.articulo?.nombre || 'N/A',
        ubicacion: item.ubicacion?.nombre || 'N/A'
      }));
    } catch (e) {
      console.error(e);
    }
  }

  async loadUbicaciones() {
    try {
      this.dataUbi = await lastValueFrom(this.service.getUbicaciones());
    } catch (e) {
      console.error(e);
    }
  }

  async loadConteos() {
    try {
      this.dataConteo = await lastValueFrom(this.service.getConteos());
    } catch (e) {
      console.error(e);
    }
  }

  addStock() {
    // TODO: Implementar modal para agregar stock físico
    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Modal de stock físico próximamente' });
  }

  async addUbicacion() {
    const ref = this.dialogService.open(ModalUbicacionComponent, {
      header: 'Nueva Ubicación',
      width: '400px',
      modal: true
    });

    const res = await lastValueFrom(ref.onClose);
    if (res) {
      try {
        await lastValueFrom(this.service.saveUbicacion(res));
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ubicación creada' });
        this.loadUbicaciones();
      } catch (e) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear la ubicación' });
      }
    }
  }

  async editUbicacion(event: any) {
    const ref = this.dialogService.open(ModalUbicacionComponent, {
      header: 'Editar Ubicación',
      width: '400px',
      modal: true,
      data: { initial: event }
    });

    const res = await lastValueFrom(ref.onClose);
    if (res) {
      try {
        await lastValueFrom(this.service.editUbicacion(event.id, res));
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ubicación actualizada' });
        this.loadUbicaciones();
      } catch (e) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la ubicación' });
      }
    }
  }

  async addConteo() {
    const ref = this.dialogService.open(ModalConteoComponent, {
      header: 'Nuevo Proceso de Conteo Físico',
      width: '90%',
      modal: true
    });

    const res = await lastValueFrom(ref.onClose);
    if (res) {
      try {
        // 1. Guardar cabecera del conteo
        const conteoSaved = await lastValueFrom(this.service.saveConteo(res.conteo));
        
        // 2. Preparar detalles con el ID del conteo guardado
        // Importante: Eliminar campos que no existen en el modelo de BD (como articuloNombre)
        const detalles = res.detalles.map((d: any) => ({
          conteoId: conteoSaved.id,
          articuloId: d.articuloId,
          variante: d.variante || '',
          ubicacionId: d.ubicacionId,
          cantidadContada: d.cantidadContada || 0,
          cantidadSistema: d.cantidadSistema || 0,
          diferencia: d.cantidadContada || 0
        }));

        // 3. Guardar detalles en bulk
        await lastValueFrom(this.service.saveConteoDetallesBulk(detalles));

        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Conteo guardado correctamente' });
        this.loadConteos();
      } catch (e) {
        console.error(e);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el conteo' });
      }
    }
  }

  async editConteo(event: any) {
    // Solo abrimos el modal de edición si se hace click en la fila (selectItem)
    // Pero si el usuario quiere 'VER' específicamente el reporte agrupado, usará el botón de acciones.
    const ref = this.dialogService.open(ModalConteoComponent, {
      header: 'Editar Conteo Físico',
      width: '90%',
      modal: true,
      data: { initial: event }
    });

    const res = await lastValueFrom(ref.onClose);
    if (res) {
      try {
        // 1. Actualizar cabecera (Solo campos editables para evitar error de Prisma con ID/CreatedAt)
        const conteoData = {
          nombre: res.conteo.nombre,
          observacion: res.conteo.observacion
        };
        await lastValueFrom(this.service.editConteo(event.id, conteoData));
        
        // 2. Limpiar detalles anteriores para evitar duplicados
        await lastValueFrom(this.service.deleteConteoDetalles(event.id));

        // 3. Preparar nuevos detalles (Limpiando campos no válidos para BD)
        const detalles = res.detalles.map((d: any) => ({
          conteoId: event.id,
          articuloId: d.articuloId,
          variante: d.variante || '',
          ubicacionId: d.ubicacionId,
          cantidadContada: d.cantidadContada || 0,
          cantidadSistema: d.cantidadSistema || 0,
          diferencia: d.cantidadContada || 0
        }));
        
        // 4. Guardar nuevos detalles en bulk
        await lastValueFrom(this.service.saveConteoDetallesBulk(detalles));

        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Conteo actualizado' });
        this.loadConteos();
      } catch (e) {
        console.error(e);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el conteo' });
      }
    }
  }

  viewReport(id: string) {
    this.router.navigate(['/home/physical-inventory/report', id]);
  }
}
