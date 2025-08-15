import { Component, inject, OnInit } from '@angular/core';
import { PlayTableComponent } from '../../table/play-table.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ModalSalesComponent } from './modal-sales/modal-sales.component';
import { HomeService } from '../home.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';

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
        final.push({ id: item.id, nombre: nombres, total: item.total, fecha: item.fecha })
      });

      this.data = final;

    } catch (e) {
      console.log(e)
    }
  }

  public async onSelectItem(event: any) {

  }

  public async add() {
    this.ref = this.dialogService.open(ModalSalesComponent, {
      header: 'Agregar producto',
      width: '70vw',
      modal: true,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });

    const resp = await firstValueFrom(this.ref.onClose);

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

 async reduceStock(listArt: any, listVenta: any) {

    const updatedList = listArt.map((articulo: any) => {
      const venta = listVenta.productos.find((v: any) => v.productoId === articulo.id);


      if (!venta) return articulo;

      if (Array.isArray(articulo.stock_by_option) && venta.modelo) {
        articulo.stock_by_option = articulo.stock_by_option.map((opt: any) => {
          if (opt.id === venta.modelo) {
            return {
              ...opt,
              cantidad: opt.cantidad - venta.cantidad
            };
          }
          return opt;
        });
      }

      else if (typeof articulo.cantidad === "number") {
        articulo.cantidad = articulo.cantidad - venta.cantidad;
      }

      return articulo;
    });
    
    for (const product of updatedList) {
      try {
        const stock = product.stock_by_option;
        const totalStock = stock?.reduce((sum:any, item:any) => sum + (item.cantidad || 0), 0) || 0;

        product.active = totalStock > 0;
        const respProduct = await lastValueFrom(
          this.service.editProduct(product)
        );
      } catch (error) {
        console.error('Error actualizando producto', product.id, error);
      }
    }
        
  }

}
