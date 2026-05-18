import { Component, inject, OnInit } from '@angular/core';
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
    PlayTableComponent
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent implements OnInit {

  private dialogService: DialogService = inject(DialogService);
  public ref?: DynamicDialogRefWithContent<ModalSalesComponent>;

  private service: HomeService = inject(HomeService);

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
      key: 'nota',
      header: 'Método de Pago / Nota',
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

  async getData() {
    try {
      const resp = await lastValueFrom(this.service.getSales());
      const final: any = [];
      resp.forEach((item: any) => {
        const nombres = item.detail?.map((item: any) => item.nombre).join(', ') || '';
        final.push({ 
          id: item.id, 
          nombre: nombres, 
          total: item.total, 
          fecha: item.fecha, 
          detail: item.detail,
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
    if (event.detail && event.detail.length > 0) {
      try {
        const oldProductIds = event.detail.map((v: any) => v.productoId);
        const oldProducts = await lastValueFrom(this.service.getProductosByFilter(oldProductIds));
        await this.restoreStock(oldProducts, event);
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
    const updatedList = listArt.map((articulo: any) => {
      const venta = listVenta.productos.find((v: any) => v.productoId === articulo.id);

      if (!venta) return articulo;

      const tipoVenta = venta.tipoVenta;

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
        articulo.stock_by_option = options;
      } else if (typeof articulo.cantidad === 'number') {
        if (tipoVenta === 'e23f61c2-9025-4761-8a75-a5146de03473') {
          articulo.cantidad = Math.max(0, articulo.cantidad - venta.cantidad);
        }
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
    const updatedList = listArt.map((articulo: any) => {
      const venta = listVenta.detail.find((v: any) => v.productoId === articulo.id);

      if (!venta) return articulo;

      const tipoVenta = venta.tipoVenta;

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
        articulo.stock_by_option = options;
      } else if (typeof articulo.cantidad === 'number') {
        if (tipoVenta === 'e23f61c2-9025-4761-8a75-a5146de03473') {
          articulo.cantidad = articulo.cantidad + venta.cantidad;
        }
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
