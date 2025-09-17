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
      resp.forEach((item: any, index: number) => {
        const nombres = item.detail.map((item: any) => item.nombre).join(', ');
        final.push({ id: item.id, nombre: nombres, total: item.total, fecha: item.fecha, detail: item.detail })
      });

      this.data = final;

    } catch (e) {
      console.log(e)
    }
  }

  public async onSelectItem(event: any) {
    this.ref = this.dialogService.open(ModalViewComponent, {
      header: 'Ver venta',
      width: '50vw',
      modal: true,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
      data: {
        initial: event
      }
    });

    const resp = await firstValueFrom(this.ref.onClose);
    if (!resp) return;
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

    const dataSales = {
      fecha: new Date(),
      total: total,
      detail: resp.productos
    };

    await lastValueFrom(this.service.saveVenta(dataSales));

    const idsVentas = resp.productos.map((v: any) => v.productoId);
    const listArt = await lastValueFrom(this.service.getProductosByFilter(idsVentas));
    this.reduceStock(listArt, resp);
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

      const tipoVenta = venta.tipoVenta; // ahora usamos el tipo de venta de la fila

      if (Array.isArray(articulo.stock_by_option) && venta.modelo) {
        articulo.stock_by_option = articulo.stock_by_option.map((opt: any) => {
          if (opt.id === venta.modelo) {
            return {
              ...opt,
              cantidad: tipoVenta === 'tienda' ? opt.cantidad - venta.cantidad : opt.cantidad,
              cantidad_almacen: tipoVenta === 'almacen' ? opt.cantidad_almacen - venta.cantidad : opt.cantidad_almacen
            };
          }
          return opt;
        });
      }
      else if (typeof articulo.cantidad === 'number') {
        if (tipoVenta === 'tienda') {
          articulo.cantidad = articulo.cantidad - venta.cantidad;
        } else if (tipoVenta === 'almacen') {
          articulo.cantidad_almacen = (articulo.cantidad_almacen || 0) - venta.cantidad;
        }
      }

      return articulo;
    });

    for (const product of updatedList) {
      try {
        const tipoVenta = listVenta.productos.find((v: any) => v.productoId === product.id)?.tipoVenta;

        const stock = product.stock_by_option;
        const totalStock = stock?.reduce((sum: any, item: any) =>
          sum + (tipoVenta === 'tienda' ? (item.cantidad || 0) : (item.cantidad_almacen || 0)), 0
        ) || (tipoVenta === 'tienda' ? product.cantidad : product.cantidad_almacen) || 0;

        product.active = totalStock > 0;

        await lastValueFrom(this.service.editProduct(product));
      } catch (error) {
        console.error('Error actualizando producto', product.id, error);
      }
    }
  }



}
