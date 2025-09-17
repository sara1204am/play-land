import { Component, ElementRef, inject, OnInit, Signal, TemplateRef, viewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PlayTableComponent } from '../../../table/play-table.component';
import { lastValueFrom } from 'rxjs';
import { HomeService } from '../../home.service';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-modal-sales',
  imports: [
    RadioButtonModule,
    FormsModule,
    PlayTableComponent,
    DropdownModule,
    ReactiveFormsModule,
    InputTextModule
  ],
  templateUrl: './modal-sales.component.html',
  styleUrls: ['./modal-sales.component.css']
})
export class ModalSalesComponent implements OnInit {
  public ref: DynamicDialogRef = inject(DynamicDialogRef);

  public quantityTemplate: Signal<TemplateRef<ElementRef>> =
    viewChild.required<TemplateRef<ElementRef>>('quantityTemplate');

  public buttonTemplate: Signal<TemplateRef<ElementRef>> =
    viewChild.required<TemplateRef<ElementRef>>('buttonTemplate');

  tipoVenta: string = 'tienda';
  tiposPago = [
    { label: 'Efectivo', value: 'efectivo' },
    { label: 'Tarjeta', value: 'tarjeta' },
    { label: 'QR', value: 'transferencia' }
  ];

  public catalogs: Record<string, any[]> = {
    typeCt: [
      { value: '1', label: 'Juguetes' },
      { value: '2', label: 'Peluche' },
      { value: '3', label: 'Bebes' },
      { value: '4', label: 'Otros' },
    ]
  };

  public data: unknown[] = [];

  public columns!: any[];

  public config = {
    globalSearch: true,
    resetButton: true,
    configColumns: true
  };

  private service: HomeService = inject(HomeService);

  form!: FormGroup;
  modelosDisponibles: any[][] = [];
  viewProduct = false;
  allData :any[] = []

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      productos: this.fb.array([])
    });

    this.columns = [
      { key: 'id', header: 'ID', type: 'text', hidden: true, sortable: true, filterable: true, globalSearch: true },
      { key: 'photo', header: 'Photo (Img)', type: 'img', hidden: false },
      { key: 'nombre', header: 'Nombre del Producto', type: 'text', hidden: false, sortable: true, filterable: true, globalSearch: true },
      { key: 'precio', header: 'Precio Venta', type: 'number', hidden: false, sortable: true, filterable: true, globalSearch: false, prefix: 'Bs ', format: '1.2-2' },
      { key: 'buttons', type: 'template', header: 'Cantidad', hidden: false, sortable: false, filterable: false, headerClass: '!bg-transparent', cellTemplate: this.buttonTemplate() },
    ];

    this.getData();
  }

  async getData() {
    try {
      this.data = await lastValueFrom(this.service.getProductos());
      this.allData = [...this.data]
    } catch (e) {
      console.error(e);
    }
  }

  get productos() {
    return this.form.get('productos') as FormArray;
  }

  addProduct(event: any) {
    const index = this.productos.length;

    const group = this.fb.group({
      tipoVenta: [this.tipoVenta || '-', Validators.required],
      nombre: [event?.nombre || '-', Validators.required],
      productoId: [event?.id || null, Validators.required],
      modelo: [null, Validators.required],
      modeloNombre: [null, Validators.required],
      cantidad: [0, [Validators.required, Validators.min(1)]],
      precio: [null, [Validators.required, Validators.min(0)]],
      tipoPago: ['efectivo', Validators.required],
      nota: [null]
    });

    // Validación de cantidad según stock
    group.get('cantidad')?.valueChanges.subscribe((val:any) => {
      const modeloId = group.get('modelo')?.value;
      const productoId = group.get('productoId')?.value;

      if (modeloId && productoId) {
        const stockDisponible = this.getStockDisponible(productoId, modeloId, index);
        if (val > stockDisponible) {
          group.get('cantidad')?.setValue(stockDisponible, { emitEvent: false });
          alert(`No puedes superar el stock disponible (${stockDisponible})`);
        }
      }
    });

    this.productos.push(group);

    if (event?.id) {
      this.cargarModelos(event, index);
    } else {
      this.modelosDisponibles[index] = [];
    }

    this.viewProduct = true;
  }

  cargarModelos(producto: any, index: number) {
    const catalog: any = [];
    producto.stock_by_option.forEach((e: any) => {
      const cantidadVisible = this.tipoVenta === 'tienda' ? e.cantidad : e.cantidad_almacen;
      catalog.push({ value: e.id, label: `${e.color} (${cantidadVisible})` });
    });
    this.modelosDisponibles[index] = [...catalog, {value:'0001', label: 'No especificado'}];
  }

  // Stock disponible restante, excluyendo la fila actual
  getStockDisponible(productoId: string, modeloId: string, filaActual?: number): number {
    const producto:any = this.data.find((p: any) => p.id === productoId);
    if (!producto) return 0;
    const stockOriginal = producto.stock_by_option.find((o: any) => o.id === modeloId)?.cantidad || 0;

    const cantidadAgregada = this.productos.controls.reduce((acc, control, idx) => {
      const pId = control.get('productoId')?.value;
      const mId = control.get('modelo')?.value;
      const cantidad = Number(control.get('cantidad')?.value) || 0;

      if (idx !== filaActual && pId === productoId && mId === modeloId) {
        return acc + cantidad;
      }
      return acc;
    }, 0);

    return stockOriginal - cantidadAgregada;
  }

  onModeloChange(index: number) {
    const control = this.productos.at(index);
    const productoId = control.get('productoId')?.value;
    const modeloId = control.get('modelo')?.value;

    if (modeloId && productoId) {
      const stockDisponible = this.getStockDisponible(productoId, modeloId, index);
      const cantidad = control.get('cantidad')?.value || 0;
      if (cantidad > stockDisponible) {
        control.get('cantidad')?.setValue(stockDisponible);
        alert(`No puedes superar el stock disponible (${stockDisponible})`);
      }
      const modeloLabel = this.modelosDisponibles[index]?.find((m:any) => m.value === modeloId)?.label || '';
      control.get('modeloNombre')?.setValue(modeloLabel);
    }
  }

  get totalCompra(): number {
    return this.productos.controls.reduce((acc, control) => {
      const cantidad = Number(control.get('cantidad')?.value) || 0;
      const precio = Number(control.get('precio')?.value) || 0;
      return acc + cantidad * precio;
    }, 0);
  }

  onTipoVentaChange(){
    this.data = this.allData.filter((producto: any) => {
      return producto.stock_by_option.some((opcion: any) => {
        const stock = this.tipoVenta === 'tienda' ? opcion.cantidad : opcion.cantidad_almacen;
        return stock > 0;
      });
    });
    
  }

  save() {
    const formData = this.form.value;
    this.ref.close(formData);
  }

  removeProduct(index: number) {
    this.productos.removeAt(index);
    this.modelosDisponibles.splice(index, 1);
  }
}
