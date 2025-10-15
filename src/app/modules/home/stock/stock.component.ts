import { Component, ElementRef, inject, OnInit, Signal, TemplateRef, viewChild } from '@angular/core';
import { PlayTableComponent } from '../../table/play-table.component';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { HomeService } from '../home.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ModalStockComponent } from './modal-stock/modal-stock.component';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface DynamicDialogRefWithContent<T = any> extends DynamicDialogRef {
  content?: T;
}

@Component({
  selector: 'app-stock',
  imports: [
    PlayTableComponent,
    FormsModule,
    NgClass,
    ToastModule
  ],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css'
})
export class StockComponent implements OnInit {

  public quantityTemplate: Signal<TemplateRef<ElementRef>> =
    viewChild.required<TemplateRef<ElementRef>>('quantityTemplate');

  public quantityTotalTemplate: Signal<TemplateRef<ElementRef>> =
    viewChild.required<TemplateRef<ElementRef>>('quantityTotalTemplate');

  public buttonTemplate: Signal<TemplateRef<ElementRef>> =
    viewChild.required<TemplateRef<ElementRef>>('buttonTemplate');

  private dialogService: DialogService = inject(DialogService);
  public ref?: DynamicDialogRefWithContent<ModalStockComponent>;

  private service: HomeService = inject(HomeService);

  private messageService: MessageService = inject(MessageService);

  public columns!: any[];

  public data: unknown[] = [];

  public config = {
    globalSearch: true,
    resetButton: true,
    configColumns: true
  };

  public catalogs: Record<string, any[]> = {
    typeCt: [
      { value: '1', label: 'Juguetes' },
      { value: '2', label: 'Peluche' },
      { value: '3', label: 'Bebes' },
      { value: '4', label: 'Otros' },
    ]
  };
  view = false;
  editingIndex: number | null = null;
  editQuantity: any = { index: null, option: null, row: null, }
  editedOption: { id: string, color: string; cantidad: number } = { id: '', color: '', cantidad: 0 };
  viewQuantity = true;

  ngOnInit(): void {

    this.columns = [
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
        key: 'photo',
        header: 'Photo (Img)',
        type: 'img',
        hidden: false
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
        key: 'type',
        header: 'Tipo Producto',
        type: 'text',
        hidden: false,
        sortable: true,
        filterable: true,
        globalSearch: true
      },
      {
        key: 'cantidad',
        type: 'template',
        header: `Cantidad Total`,
        hidden: false,
        sortable: false,
        filterable: false,
        headerClass: '!bg-transparent',
        cellTemplate: this.quantityTotalTemplate(),
      },
  /*     {
        key: 'costo_unitario',
        header: 'Costo Unitario',
        type: 'number',
        hidden: false,
        sortable: true,
        filterable: true,
        globalSearch: false,
        prefix: 'Bs ',
        format: '1.2-2'
      }, */
      {
        key: 'precio',
        header: 'Precio Venta',
        type: 'number',
        hidden: false,
        sortable: true,
        filterable: true,
        globalSearch: false,
        prefix: 'Bs ',
        format: '1.2-2'
      },
    /*   {
        key: 'stock_by_option',
        type: 'template',
        header: `Cantidad`,
        hidden: false,
        sortable: false,
        filterable: false,
        headerClass: '!bg-transparent',
        cellTemplate: this.quantityTemplate(),
      }, */
      {
        key: 'buttons',
        type: 'template',
        header: `Cantidad`,
        hidden: false,
        sortable: false,
        filterable: false,
        headerClass: '!bg-transparent',
        cellTemplate: this.buttonTemplate(),
      },
    ];
    this.view = true;
    this.getData();
  }

  async getData() {
    try {
      this.data = await lastValueFrom(this.service.getProductosAll());
    } catch (e) {
      console.log(e)
    }
  }


  public async onSelectItem(event: any) {
    /*    this.ref = this.dialogService.open(ModalStockComponent, {
         data: { initial: event },
         header: 'Editar producto',
         width: '40vw',
         modal: true,
         closable: true,
         breakpoints: {
           '960px': '75vw',
           '640px': '90vw',
         },
       });
   
       await firstValueFrom(this.ref.onClose); */

  }

  public async edit(event: any) {

    this.ref = this.dialogService.open(ModalStockComponent, {
      data: { ...event },
      header: 'Editar producto',
      width: '40vw',
      modal: true,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });

    const data = await firstValueFrom(this.ref.onClose);


    const articulo: any = {
      nombre: data.nombre,
      nombre_corto: data.nombre_corto ?? data.nombre,
      descripcion: data.descripcion ?? '',
      costo_unitario: data.costo_unitario,
      precio: data.precio ?? 0,
      active: true,
      stock_by_option: data.colores,
      type: data.tipo,
      id_lote: data.lote
    };
    let respProduct;
    if (data.id) {
      respProduct = await lastValueFrom(this.service.editProduct({ id: data.id, ...articulo }));
    } else {
      respProduct = await lastValueFrom(this.service.saveProduct(articulo));
    }

    if (data?.imagen) {
      const file = data.imagen;
      const temp = await this.service.uploadImagen(file);
    
      const dataImg = { nombre: temp.body.url.split('/').pop(), id_articulo: respProduct.id, url: temp.body.url }
    /*   const dataImg = { nombre: temp, id_articulo: respProduct.id } */
      const respImagen = await lastValueFrom(this.service.saveImagen(dataImg));
    }
    this.messageService.add({
      severity: 'success',
      summary: 'Stock',
      detail: 'Datos editados  correctamente',
      life: 2000
    });
    this.getData();

  }

  public async add() {
    this.ref = this.dialogService.open(ModalStockComponent, {
      header: 'Agregar producto',
      width: '40vw',
      modal: true,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });

    const data = await firstValueFrom(this.ref.onClose);
    if (data?.imagen) {
      const file = data.imagen;

      const articulo: any = {
        nombre: data.nombre,
        nombre_corto: data.nombre_corto ?? data.nombre,
        descripcion: data.descripcion ?? '',
        costo_unitario: data.costo_unitario,
        precio: data.precio ?? 0,
        active: true,
        stock_by_option: data.colores,
        type: data.tipo,
        id_lote: data.lote
      };

      const respProduct = await lastValueFrom(this.service.saveProduct(articulo));
      const temp = await this.service.uploadImagen(file);

      const dataImg = { nombre: temp.body.url.split('/').pop(), id_articulo: respProduct.id, url: temp.body.url }
      const respImagen = await lastValueFrom(this.service.saveImagen(dataImg));
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Login',
      detail: 'Datos guardados correctamente',
      life: 2000
    });
    this.getData();
  }


  startEdit(event: any, index: number, option: any, row: any) {
    event.stopPropagation();
    this.editQuantity = { index, option, row }
    this.editedOption = {
      id: option.id,
      color: option.color,
      cantidad: option.cantidad
    };
  }

  async saveEdit(index: number, option: any, row: any) {

    if (this.editedOption.color.trim() === '') {
      alert('El color no puede estar vacío');
      return;
    }
    if (this.editedOption.cantidad < 0) {
      alert('La cantidad no puede ser negativa');
      return;
    }
    option = { ...this.editedOption }
    row.stock_by_option[index] = option;

    const finalRow = { ...row };
    const stock = finalRow.stock_by_option;
    const totalStock = stock?.reduce((sum: any, item: any) => sum + (item.cantidad || 0), 0) || 0;
    const totalStockAlmacen = stock?.reduce((sum: any, item: any) => sum + (item.cantidad_almacen || 0), 0) || 0;
    finalRow.active = totalStock + totalStockAlmacen > 0;

    delete finalRow.imagenes;
    delete finalRow.photo;

    await lastValueFrom(this.service.editProduct(finalRow));

    this.editQuantity = { index: null, option: null, row: null, }
  }
  async deleteOption(index: number, row: any) {

    const finalRow = { ...row };
    delete finalRow.imagenes;
    delete finalRow.photo;

    finalRow.stock_by_option.splice(index, 1);

    const stock = finalRow.stock_by_option;
    const totalStock = stock?.reduce((sum: any, item: any) => sum + (item.cantidad || 0), 0) || 0;
    const totalStockAlmacen = stock?.reduce((sum: any, item: any) => sum + (item.cantidad_almacen || 0), 0) || 0;
    finalRow.active = totalStock + totalStockAlmacen > 0;

    await lastValueFrom(this.service.editProduct(finalRow));
    this.messageService.add({
      severity: 'success',
      summary: 'Login',
      detail: 'Datos eliminados correctamente',
      life: 2000
    });
    this.getData();
  }

  addFile(row: any) {
    row.stock_by_option.push({
      id: new Date().getTime(),
      color: '',
      cantidad: 0,
      cantidad_almacen: 0
    })
    this.editQuantity = { index: null, option: null, row: null, }
  }

  cancelEdit() {
    this.editQuantity = { index: null, option: null, row: null, }
  }

  getTotalCantidad(stock: any[]): number {
    const tienda = stock?.reduce((total, item) => total + (item.cantidad || 0), 0) ?? 0;
    const almacen = stock?.reduce((total, item) => total + (item.cantidad_almacen || 0), 0) ?? 0;
    return tienda + almacen;
  }

}
