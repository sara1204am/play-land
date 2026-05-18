import { Component, inject, OnInit, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayTableComponent } from '../../table/play-table.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ModalSalesComponent } from './modal-sales/modal-sales.component';
import { HomeService } from '../home.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { ModalViewComponent } from './modal-view/modal-view.component';
import { ModalSalesGenericoComponent } from './modal-sales-generico/modal-sales-generico.component';

interface DynamicDialogRefWithContent<T = any> extends DynamicDialogRef {
  content?: T;
}

@Component({
  selector: 'app-sales',
  imports: [
    PlayTableComponent,
    CommonModule
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent implements OnInit, AfterViewInit {

  private dialogService: DialogService = inject(DialogService);
  public ref?: DynamicDialogRefWithContent<ModalSalesComponent>;

  private service: HomeService = inject(HomeService);

  @ViewChild('deleteTemplate', { static: true }) deleteTemplate!: TemplateRef<any>;

  public columns: any[] = [
    {
      key: 'id',
      header: 'ID',
      type: 'text',
      hidden: true,
      sortable: true,
      filterable: true,
      globalSearch: true
    },
    {
      key: 'detail',
      header: 'Detalle',
      type: 'text',
      hidden: true,
      sortable: false,
      filterable: false,
      globalSearch: false
    },
    {
      key: 'fecha',
      header: 'Fecha',
      type: 'date',
      hidden: false,
      sortable: true,
      filterable: true,
      globalSearch: true
    },
    {
      key: 'nombre',
      header: 'Nombre del Producto',
      type: 'text',
      hidden: false,
      sortable: true,
      filterable: true,
      globalSearch: true
    },
    {
      key: 'total',
      header: 'Total Venta',
      type: 'number',
      hidden: false,
      sortable: true,
      filterable: true,
      globalSearch: false,
      prefix: 'Bs ',
      format: '1.2-2'
    },
    {
      key: 'actions',
      header: 'Acciones',
      type: 'template',
      cellTemplate: null,
      hidden: false,
      sortable: false,
      filterable: false,
      globalSearch: false
    }
  ];

  public data: any = {};

  public config = {
    globalSearch: true,
    resetButton: true,
    configColumns: true
  };

  ngOnInit(): void {
    this.getData();
  }

  ngAfterViewInit(): void {
    const actionsCol = this.columns.find(c => c.key === 'actions');
    if (actionsCol) {
      actionsCol.cellTemplate = this.deleteTemplate;
      this.columns = [...this.columns];
    }
  }

  async getData() {
    try {
      const resp = await lastValueFrom(this.service.getSales());
      const final: any = [];
      resp.forEach((item: any) => {
        let detailArr: any[] = [];
        if (typeof item.detail === 'string') {
          try {
            detailArr = JSON.parse(item.detail);
          } catch (e) {
            detailArr = [];
          }
        } else if (Array.isArray(item.detail)) {
          detailArr = item.detail;
        }

        const nombres = detailArr?.map((item: any) => item.nombre).join(', ') || '';
        final.push({ 
          id: item.id, 
          nombre: nombres, 
          total: item.total, 
          fecha: item.fecha, 
          detail: detailArr,
          nota: item.nota || '-'
        });
      });

      // Always sort sales from most recent to oldest
      final.sort((a: any, b: any) => {
        const dateA = a.fecha ? new Date(a.fecha).getTime() : 0;
        const dateB = b.fecha ? new Date(b.fecha).getTime() : 0;
        return dateB - dateA;
      });

      this.data = final;

    } catch (e) {
      console.log(e)
    }
  }

  public async onSelectItem(event: any) {
    this.ref = this.dialogService.open(ModalSalesComponent, {
      header: 'Editar venta',
      width: '70vw',
      modal: true,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
      data: {
        initial: event
      },
      focusOnShow: false,
    });

    const resp = await firstValueFrom(this.ref.onClose);
    if (!resp) return;

    const total = resp.productos.reduce((acc: any, producto: any) => {
      return acc + (producto.cantidad * producto.precio);
    }, 0);

    const parts: string[] = [];
    if (resp.pago_efectivo > 0) parts.push(`Efectivo: ${resp.pago_efectivo} Bs`);
    if (resp.pago_qr > 0) parts.push(`QR: ${resp.pago_qr} Bs`);
    if (resp.pago_tarjeta > 0) parts.push(`Tarjeta: ${resp.pago_tarjeta} Bs`);
    const paymentNote = parts.length > 0 ? parts.join(' | ') : 'Efectivo';

    // 1. Restore the old stock of original items
    let detailArr: any[] = [];
    if (typeof event.detail === 'string') {
      try {
        detailArr = JSON.parse(event.detail);
      } catch (e) {
        detailArr = [];
      }
    } else if (Array.isArray(event.detail)) {
      detailArr = event.detail;
    }

    if (detailArr && detailArr.length > 0) {
      try {
        const oldProductIds = detailArr.map((v: any) => v.productoId).filter(id => !!id);
        const oldProducts = await lastValueFrom(this.service.getProductosByFilter(oldProductIds));
        await this.restoreStock(oldProducts, { ...event, detail: detailArr });
      } catch (error) {
        console.error('Error restoring old stock during edit', error);
      }
    }

    // 2. Reduce stock for the new items
    if (resp.productos && resp.productos.length > 0) {
      try {
        const newProductIds = resp.productos.map((v: any) => v.productoId);
        const newProducts = await lastValueFrom(this.service.getProductosByFilter(newProductIds));
        await this.reduceStock(newProducts, resp);
      } catch (error) {
        console.error('Error reducing new stock during edit', error);
      }
    }

    const dataSales = {
      id: event.id,
      fecha: resp.fecha || event.fecha || new Date(), // Use selected date or keep original
      total: total,
      detail: resp.productos,
      nota: paymentNote
    };

    await lastValueFrom(this.service.editSale(dataSales));
    this.getData();
  }

  public async add() {
    this.ref = this.dialogService.open(ModalSalesComponent, {
      header: 'Agregar venta',
      width: '70vw',
      modal: true,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });

    const resp = await firstValueFrom(this.ref.onClose);
    if (!resp) return;

    const total = resp.productos.reduce((acc: any, producto: any) => {
      return acc + (producto.cantidad * producto.precio);
    }, 0);

    const parts: string[] = [];
    if (resp.pago_efectivo > 0) parts.push(`Efectivo: ${resp.pago_efectivo} Bs`);
    if (resp.pago_qr > 0) parts.push(`QR: ${resp.pago_qr} Bs`);
    if (resp.pago_tarjeta > 0) parts.push(`Tarjeta: ${resp.pago_tarjeta} Bs`);
    const paymentNote = parts.length > 0 ? parts.join(' | ') : 'Efectivo';

    const dataSales = {
      fecha: resp.fecha || new Date(), // Use selected date from modal
      total: total,
      detail: resp.productos,
      nota: paymentNote
    };

    await lastValueFrom(this.service.saveVenta(dataSales));
    const idsVentas = resp.productos.map((v: any) => v.productoId);
    const listArt = await lastValueFrom(this.service.getProductosByFilter(idsVentas));
    await this.reduceStock(listArt, resp);
    this.getData();
  }

  public canDelete(fecha: string | Date): boolean {
    if (!fecha) return false;
    const saleDate = new Date(fecha);
    const today = new Date();
    
    // Clear hours to compare calendar dates
    const d1 = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate());
    const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 2;
  }

  public async deleteSale(row: any) {
    if (!this.canDelete(row.fecha)) {
      alert('Solo se pueden eliminar ventas de hasta 2 días de antigüedad.');
      return;
    }

    if (!confirm('¿Está seguro de eliminar esta venta? Esta acción no se puede deshacer y restaurará el stock de los productos.')) {
      return;
    }

    try {
      let detailArr: any[] = [];
      if (typeof row.detail === 'string') {
        try {
          detailArr = JSON.parse(row.detail);
        } catch (e) {
          detailArr = [];
        }
      } else if (Array.isArray(row.detail)) {
        detailArr = row.detail;
      }

      if (detailArr && detailArr.length > 0) {
        const oldProductIds = detailArr.map((v: any) => v.productoId).filter(id => !!id);
        const oldProducts = await lastValueFrom(this.service.getProductosByFilter(oldProductIds));
        await this.restoreStock(oldProducts, { ...row, detail: detailArr });
      }

      await lastValueFrom(this.service.deleteVenta(row.id));
      this.getData();
    } catch (error) {
      console.error('Error deleting sale', error);
      alert('Ocurrió un error al eliminar la venta.');
    }
  }

  public async addGenerico() {
    this.ref = this.dialogService.open(ModalSalesGenericoComponent, {
      header: 'Agregar venta generica',
      width: '70vw',
      modal: true,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
      focusOnShow: false,
    });

    const { resp, fecha } = await firstValueFrom(this.ref.onClose);

    if (!resp) return;
    const total = resp.productos.reduce((acc: any, producto: any) => {
      return acc + (producto.cantidad * producto.precio);
    }, 0);

    const dataSales = {
      fecha: fecha,
      total: total,
      detail: resp.productos
    };

    await lastValueFrom(this.service.saveVenta(dataSales));

    this.getData();
  }

  async reduceStock(listArt: any, listVenta: any) {
    let productosArr: any[] = [];
    if (listVenta && listVenta.productos) {
      if (typeof listVenta.productos === 'string') {
        try {
          productosArr = JSON.parse(listVenta.productos);
        } catch (e) {
          productosArr = [];
        }
      } else if (Array.isArray(listVenta.productos)) {
        productosArr = listVenta.productos;
      }
    }

    const updatedList = listArt.map((articulo: any) => {
      const ventasProducto = productosArr.filter((v: any) => v.productoId === articulo.id);

      if (ventasProducto.length === 0) return articulo;

      let options: any[] = [];
      if (articulo.stock_by_option) {
        if (Array.isArray(articulo.stock_by_option)) {
          options = articulo.stock_by_option;
        } else if (typeof articulo.stock_by_option === 'string') {
          try {
            options = JSON.parse(articulo.stock_by_option);
          } catch (e) {
            options = [];
          }
        }
      }

      for (const venta of ventasProducto) {
        const tipoVenta = venta.tipoVenta;
        if (options && options.length > 0 && venta.modelo) {
          options = options.map((opt: any) => {
            if (opt.id === venta.modelo) {
              return {
                ...opt,
                cantidad: Math.max(0, (Number(opt.cantidad) || 0) - venta.cantidad)
              };
            }
            return opt;
          });
        } else if (typeof articulo.cantidad === 'number') {
          if (tipoVenta === 'e23f61c2-9025-4761-8a75-a5146de03473') {
            articulo.cantidad = Math.max(0, (articulo.cantidad || 0) - venta.cantidad);
          }
        }
      }

      if (options && options.length > 0) {
        articulo.stock_by_option = options;
      }

      return articulo;
    });

    for (const product of updatedList) {
      try {
        let options: any[] = [];
        if (product.stock_by_option) {
          if (Array.isArray(product.stock_by_option)) {
            options = product.stock_by_option;
          } else if (typeof product.stock_by_option === 'string') {
            try {
              options = JSON.parse(product.stock_by_option);
            } catch (e) {
              options = [];
            }
          }
        }

        const totalStock = options && options.length > 0
          ? options.reduce((sum: any, item: any) => sum + (Number(item.cantidad) || 0), 0)
          : Number(product.cantidad) || 0;

        product.cantidad = totalStock;
        product.active = totalStock > 0;

        delete product.imagenes;
        delete product.photo;

        await lastValueFrom(this.service.editProduct(product));
      } catch (error) {
        console.error('Error actualizando producto', product.id, error);
      }
    }
  }

  async restoreStock(listArt: any, listVenta: any) {
    let detailArr: any[] = [];
    if (listVenta && listVenta.detail) {
      if (typeof listVenta.detail === 'string') {
        try {
          detailArr = JSON.parse(listVenta.detail);
        } catch (e) {
          detailArr = [];
        }
      } else if (Array.isArray(listVenta.detail)) {
        detailArr = listVenta.detail;
      }
    }

    const updatedList = listArt.map((articulo: any) => {
      const ventasProducto = detailArr.filter((v: any) => v.productoId === articulo.id);

      if (ventasProducto.length === 0) return articulo;

      let options: any[] = [];
      if (articulo.stock_by_option) {
        if (Array.isArray(articulo.stock_by_option)) {
          options = articulo.stock_by_option;
        } else if (typeof articulo.stock_by_option === 'string') {
          try {
            options = JSON.parse(articulo.stock_by_option);
          } catch (e) {
            options = [];
          }
        }
      }

      for (const venta of ventasProducto) {
        const tipoVenta = venta.tipoVenta;
        if (options && options.length > 0 && venta.modelo) {
          options = options.map((opt: any) => {
            if (opt.id === venta.modelo) {
              return {
                ...opt,
                cantidad: (Number(opt.cantidad) || 0) + venta.cantidad
              };
            }
            return opt;
          });
        } else if (typeof articulo.cantidad === 'number') {
          if (tipoVenta === 'e23f61c2-9025-4761-8a75-a5146de03473') {
            articulo.cantidad = (articulo.cantidad || 0) + venta.cantidad;
          }
        }
      }

      if (options && options.length > 0) {
        articulo.stock_by_option = options;
      }

      return articulo;
    });

    for (const product of updatedList) {
      try {
        let options: any[] = [];
        if (product.stock_by_option) {
          if (Array.isArray(product.stock_by_option)) {
            options = product.stock_by_option;
          } else if (typeof product.stock_by_option === 'string') {
            try {
              options = JSON.parse(product.stock_by_option);
            } catch (e) {
              options = [];
            }
          }
        }

        const totalStock = options && options.length > 0
          ? options.reduce((sum: any, item: any) => sum + (Number(item.cantidad) || 0), 0)
          : Number(product.cantidad) || 0;

        product.cantidad = totalStock;
        product.active = totalStock > 0;

        delete product.imagenes;
        delete product.photo;

        await lastValueFrom(this.service.editProduct(product));
      } catch (error) {
        console.error('Error restaurando producto', product.id, error);
      }
    }
  }

}
