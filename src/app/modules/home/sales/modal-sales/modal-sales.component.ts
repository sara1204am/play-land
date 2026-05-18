import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { lastValueFrom } from 'rxjs';
import { HomeService } from '../../home.service';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-sales',
  imports: [
    RadioButtonModule,
    FormsModule,
    DropdownModule,
    ReactiveFormsModule,
    InputTextModule,
    AutoCompleteModule,
    CommonModule
  ],
  templateUrl: './modal-sales.component.html',
  styleUrls: ['./modal-sales.component.css']
})
export class ModalSalesComponent implements OnInit {
  public ref: DynamicDialogRef = inject(DynamicDialogRef);
  public dialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);

  locations: any[] = [];
  tipoVenta: string = 'e23f61c2-9025-4761-8a75-a5146de03473';
  fechaVenta: string = '';

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

  private service: HomeService = inject(HomeService);

  form!: FormGroup;
  modelosDisponibles: any[][] = [];
  viewProduct = false;
  allData: any[] = [];

  selectedProductSearch: any = null;
  filteredProducts: any[] = [];

  constructor(private fb: FormBuilder) { }

  async ngOnInit(): Promise<void> {
    try {
      this.locations = await lastValueFrom(this.service.getUbicaciones());
      if (this.locations && this.locations.length > 0) {
        const hasPasaje = this.locations.find((l: any) => l.id === 'e23f61c2-9025-4761-8a75-a5146de03473');
        this.tipoVenta = hasPasaje ? 'e23f61c2-9025-4761-8a75-a5146de03473' : this.locations[0].id;
      }
    } catch (e) {
      console.error('Error fetching locations in sales modal', e);
    }

    await this.getData();

    const initialSale = this.dialogConfig.data?.initial;
    if (initialSale) {
      // Load and format the original sale date
      if (initialSale.fecha) {
        const saleDate = new Date(initialSale.fecha);
        const year = saleDate.getFullYear();
        const month = String(saleDate.getMonth() + 1).padStart(2, '0');
        const day = String(saleDate.getDate()).padStart(2, '0');
        this.fechaVenta = `${year}-${month}-${day}`;
      } else {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        this.fechaVenta = `${year}-${month}-${day}`;
      }

      let cash = 0;
      let qr = 0;
      let card = 0;
      const nota = initialSale.nota || '';

      const cashMatch = nota.match(/Efectivo:\s*([\d.]+)/i);
      if (cashMatch) cash = Number(cashMatch[1]) || 0;

      const qrMatch = nota.match(/QR:\s*([\d.]+)/i);
      if (qrMatch) qr = Number(qrMatch[1]) || 0;

      const cardMatch = nota.match(/Tarjeta:\s*([\d.]+)/i);
      if (cardMatch) card = Number(cardMatch[1]) || 0;

      if (cash === 0 && qr === 0 && card === 0 && initialSale.total > 0) {
        if (nota.toLowerCase().includes('qr') || nota.toLowerCase().includes('transferencia')) {
          qr = initialSale.total;
        } else if (nota.toLowerCase().includes('tarjeta') || nota.toLowerCase().includes('card')) {
          card = initialSale.total;
        } else {
          cash = initialSale.total;
        }
      }

      this.form = this.fb.group({
        productos: this.fb.array([]),
        pago_efectivo: [cash, [Validators.required, Validators.min(0)]],
        pago_qr: [qr, [Validators.required, Validators.min(0)]],
        pago_tarjeta: [card, [Validators.required, Validators.min(0)]]
      });

      if (initialSale.detail && initialSale.detail.length > 0) {
        this.tipoVenta = initialSale.detail[0].tipoVenta || 'e23f61c2-9025-4761-8a75-a5146de03473';
        
        for (const item of initialSale.detail) {
          const product = this.allData.find((p: any) => p.id === item.productoId);
          this.addProductFromInitial(item, product);
        }
      }
    } else {
      // Set to today's local date by default
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      this.fechaVenta = `${year}-${month}-${day}`;

      this.form = this.fb.group({
        productos: this.fb.array([]),
        pago_efectivo: [0, [Validators.required, Validators.min(0)]],
        pago_qr: [0, [Validators.required, Validators.min(0)]],
        pago_tarjeta: [0, [Validators.required, Validators.min(0)]]
      });
    }
  }

  getLocationName(locationId: string): string {
    const loc = this.locations.find((l: any) => l.id === locationId);
    return loc ? loc.nombre : 'No especificado';
  }

  async getData() {
    try {
      const res = await lastValueFrom(this.service.getProductosAll());
      this.data = (res || []).map((art: any) => {
        let photoUrl = 'assets/imagenes/no-image.png';
        if (art.imagenes && art.imagenes.length > 0 && art.imagenes[0].url) {
          photoUrl = `https://play-land-images.s3.us-east-1.amazonaws.com/${art.imagenes[0].url}`;
        }
        return {
          ...art,
          photo: photoUrl,
          img: photoUrl
        };
      });
      this.allData = [...this.data];
    } catch (e) {
      console.error('Error loading products with getProductosAll', e);
    }
  }

  get productos() {
    return this.form.get('productos') as FormArray;
  }

  private normalizeString(str: string): string {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  getProductStock(producto: any, locationId: string): number {
    let options: any[] = [];
    if (producto.stock_by_option) {
      if (Array.isArray(producto.stock_by_option)) {
        options = producto.stock_by_option;
      } else if (typeof producto.stock_by_option === 'string') {
        try {
          options = JSON.parse(producto.stock_by_option);
        } catch (e) {
          options = [];
        }
      }
    }

    if (options && options.length > 0) {
      return options
        .filter((opt: any) => {
          if (opt.ubicacionId) {
            return opt.ubicacionId === locationId;
          }
          // Backward compatibility fallback for Tienda Pasaje San Rafael ID:
          return locationId === 'e23f61c2-9025-4761-8a75-a5146de03473';
        })
        .reduce((sum, opt) => sum + (Number(opt.cantidad) || 0), 0);
    }

    // Fallback if the requested location matches our main tienda location ID
    if (locationId === 'e23f61c2-9025-4761-8a75-a5146de03473') {
      return Number(producto.cantidad) || 0;
    }
    return 0;
  }

  searchProduct(event: any) {
    const query = this.normalizeString(event.query);
    
    const availableProducts = this.allData.filter((producto: any) => {
      const stock = this.getProductStock(producto, this.tipoVenta);
      return stock > 0;
    });

    this.filteredProducts = availableProducts.filter((prod: any) => {
      const matchNombre = this.normalizeString(prod.nombre).includes(query);
      const matchShort = this.normalizeString(prod.nombre_corto).includes(query);
      const matchLote = this.normalizeString(prod.id_lote).includes(query);
      return matchNombre || matchShort || matchLote;
    });
  }

  onProductSearchSelect(event: any) {
    const product = event?.value || event;
    this.addProduct(product);
    setTimeout(() => {
      this.selectedProductSearch = null;
    }, 50);
  }

  addProduct(event: any) {
    const index = this.productos.length;

    let defaultOptionId = null;
    let defaultOptionLabel = '';
    
    let options: any[] = [];
    if (event?.stock_by_option) {
      if (Array.isArray(event.stock_by_option)) {
        options = event.stock_by_option;
      } else if (typeof event.stock_by_option === 'string') {
        try {
          options = JSON.parse(event.stock_by_option);
        } catch (e) {
          options = [];
        }
      }
    }

    if (options && options.length > 0) {
      const optionWithStock = options.find((opt: any) => {
        const isTargetLoc = opt.ubicacionId 
          ? opt.ubicacionId === this.tipoVenta 
          : this.tipoVenta === 'e23f61c2-9025-4761-8a75-a5146de03473';
        return isTargetLoc && (opt.cantidad || 0) > 0;
      });
      if (optionWithStock) {
        defaultOptionId = optionWithStock.id || optionWithStock.color;
        defaultOptionLabel = `${optionWithStock.color} (${optionWithStock.cantidad || 0})`;
      }
    }

    const group = this.fb.group({
      tipoVenta: [this.tipoVenta, Validators.required],
      nombre: [event?.nombre || '-', Validators.required],
      productoId: [event?.id || null, Validators.required],
      modelo: [defaultOptionId, Validators.required],
      modeloNombre: [defaultOptionLabel, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio: [event?.precio || 0, [Validators.required, Validators.min(0)]],
      tipoPago: ['efectivo', Validators.required],
      nota: [null]
    });

    group.get('cantidad')?.valueChanges.subscribe((val: any) => {
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
    this.autoCalcPayment();
  }

  addProductFromInitial(item: any, product: any) {
    const index = this.productos.length;
    const modeloId = item.modelo;
    let modeloNombre = 'No especificado';

    let options: any[] = [];
    if (product?.stock_by_option) {
      if (Array.isArray(product.stock_by_option)) {
        options = product.stock_by_option;
      } else if (typeof product.stock_by_option === 'string') {
        try {
          options = JSON.parse(product.stock_by_option);
        } catch (e) {}
      }
    }

    const opt = options.find((o: any) => o.id === modeloId || o.color === modeloId);
    if (opt) {
      modeloNombre = `${opt.color} (${opt.cantidad || 0})`;
    }

    const group = this.fb.group({
      tipoVenta: [item.tipoVenta || this.tipoVenta, Validators.required],
      nombre: [item.nombre || product?.nombre || '-', Validators.required],
      productoId: [item.productoId || product?.id || null, Validators.required],
      modelo: [modeloId, Validators.required],
      modeloNombre: [modeloNombre, Validators.required],
      cantidad: [item.cantidad || 1, [Validators.required, Validators.min(1)]],
      precio: [item.precio || 0, [Validators.required, Validators.min(0)]],
      tipoPago: [item.tipoPago || 'efectivo', Validators.required],
      nota: [item.nota || null]
    });

    group.get('cantidad')?.valueChanges.subscribe((val: any) => {
      const currentModeloId = group.get('modelo')?.value;
      const currentProductoId = group.get('productoId')?.value;

      if (currentModeloId && currentProductoId) {
        const stockDisponible = this.getStockDisponible(currentProductoId, currentModeloId, index);
        if (val > stockDisponible) {
          group.get('cantidad')?.setValue(stockDisponible, { emitEvent: false });
          alert(`No puedes superar el stock disponible (${stockDisponible})`);
        }
      }
    });

    this.productos.push(group);

    if (product) {
      this.cargarModelos(product, index);
    } else {
      this.modelosDisponibles[index] = [];
    }

    this.viewProduct = true;
  }

  adjustQuantity(index: number, delta: number) {
    const control = this.productos.at(index);
    const current = Number(control.get('cantidad')?.value) || 0;
    const next = current + delta;
    if (next >= 1) {
      control.get('cantidad')?.setValue(next);
      this.autoCalcPayment();
    }
  }

  cargarModelos(producto: any, index: number) {
    const catalog: any = [];
    let options: any[] = [];
    if (producto.stock_by_option) {
      if (Array.isArray(producto.stock_by_option)) {
        options = producto.stock_by_option;
      } else if (typeof producto.stock_by_option === 'string') {
        try {
          options = JSON.parse(producto.stock_by_option);
        } catch (e) {
          options = [];
        }
      }
    }

    const filteredOptions = options.filter((e: any) => {
      return e.ubicacionId 
        ? e.ubicacionId === this.tipoVenta 
        : this.tipoVenta === 'e23f61c2-9025-4761-8a75-a5146de03473';
    });

    filteredOptions.forEach((e: any) => {
      catalog.push({ value: e.id || e.color, label: `${e.color} (${e.cantidad || 0})` });
    });
    this.modelosDisponibles[index] = [...catalog, { value: '0001', label: 'No especificado' }];
  }

  getStockDisponible(productoId: string, modeloId: string, filaActual?: number): number {
    const producto: any = this.allData.find((p: any) => p.id === productoId);
    if (!producto) return 0;
    
    let options: any[] = [];
    if (producto.stock_by_option) {
      if (Array.isArray(producto.stock_by_option)) {
        options = producto.stock_by_option;
      } else if (typeof producto.stock_by_option === 'string') {
        try {
          options = JSON.parse(producto.stock_by_option);
        } catch (e) {
          options = [];
        }
      }
    }

    const option = options.find((o: any) => o.id === modeloId || o.color === modeloId);
    
    let stockOriginal = 0;
    if (option) {
      stockOriginal = Number(option.cantidad) || 0;
    } else {
      if (this.tipoVenta === 'e23f61c2-9025-4761-8a75-a5146de03473') {
        stockOriginal = Number(producto.cantidad) || 0;
      }
    }

    // Add back original quantity if editing the same variant of the same product
    const initialSale = this.dialogConfig.data?.initial;
    if (initialSale && initialSale.detail) {
      const initialItem = initialSale.detail.find((d: any) => d.productoId === productoId && d.modelo === modeloId);
      if (initialItem) {
        stockOriginal += Number(initialItem.cantidad) || 0;
      }
    }

    const cantidadAgregada = this.productos.controls.reduce((acc, control, idx) => {
      const pId = control.get('productoId')?.value;
      const mId = control.get('modelo')?.value;
      const cantidad = Number(control.get('cantidad')?.value) || 0;

      if (idx !== filaActual && pId === productoId && mId === modeloId) {
        return acc + cantidad;
      }
      return acc;
    }, 0);

    return (stockOriginal || 0) - cantidadAgregada;
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
      const modeloLabel = this.modelosDisponibles[index]?.find((m: any) => m.value === modeloId)?.label || '';
      control.get('modeloNombre')?.setValue(modeloLabel);
      this.autoCalcPayment();
    }
  }

  get totalCompra(): number {
    return this.productos.controls.reduce((acc, control) => {
      const cantidad = Number(control.get('cantidad')?.value) || 0;
      const precio = Number(control.get('precio')?.value) || 0;
      return acc + cantidad * precio;
    }, 0);
  }

  get totalPagado(): number {
    const efectivo = Number(this.form.get('pago_efectivo')?.value) || 0;
    const qr = Number(this.form.get('pago_qr')?.value) || 0;
    const tarjeta = Number(this.form.get('pago_tarjeta')?.value) || 0;
    return efectivo + qr + tarjeta;
  }

  get cambio(): number {
    const diff = this.totalPagado - this.totalCompra;
    return diff > 0 ? diff : 0;
  }

  get restante(): number {
    const diff = this.totalCompra - this.totalPagado;
    return diff > 0 ? diff : 0;
  }

  get isValidPago(): boolean {
    return this.totalPagado >= this.totalCompra && this.productos.length > 0 && this.form.valid;
  }

  setAllPayment(type: string) {
    const total = this.totalCompra;
    if (type === 'efectivo') {
      this.form.get('pago_efectivo')?.setValue(total);
      this.form.get('pago_qr')?.setValue(0);
      this.form.get('pago_tarjeta')?.setValue(0);
    } else if (type === 'qr') {
      this.form.get('pago_efectivo')?.setValue(0);
      this.form.get('pago_qr')?.setValue(total);
      this.form.get('pago_tarjeta')?.setValue(0);
    } else if (type === 'tarjeta') {
      this.form.get('pago_efectivo')?.setValue(0);
      this.form.get('pago_qr')?.setValue(0);
      this.form.get('pago_tarjeta')?.setValue(total);
    }
  }

  autoCalcPayment() {
    // Prefill Cash by default if payments are all zero
    if (this.totalPagado === 0 && this.totalCompra > 0) {
      this.form.get('pago_efectivo')?.setValue(this.totalCompra);
    }
  }

  onTipoVentaChange() {
    this.data = this.allData.filter((producto: any) => {
      const stock = this.getProductStock(producto, this.tipoVenta);
      return stock > 0;
    });

    this.productos.controls.forEach((control, index) => {
      const productoId = control.get('productoId')?.value;
      const producto = this.allData.find((p: any) => p.id === productoId);
      if (producto) {
        this.cargarModelos(producto, index);

        const modeloId = control.get('modelo')?.value;
        if (modeloId) {
          const stockDisponible = this.getStockDisponible(productoId, modeloId, index);
          const cantidad = control.get('cantidad')?.value || 0;
          if (cantidad > stockDisponible) {
            control.get('cantidad')?.setValue(stockDisponible);
            alert(`Stock ajustado: En ${this.tipoVenta} solo quedan ${stockDisponible} unidades de este modelo.`);
          }
        }
      }
    });
    this.autoCalcPayment();
  }

  save() {
    if (!this.isValidPago) {
      alert('El total pagado debe cubrir el total de la compra.');
      return;
    }
    const formData = this.form.value;
    formData.fecha = this.fechaVenta ? new Date(this.fechaVenta + 'T12:00:00') : new Date();
    this.ref.close(formData);
  }

  removeProduct(index: number) {
    this.productos.removeAt(index);
    this.modelosDisponibles.splice(index, 1);
    this.autoCalcPayment();
  }
}

