import { Component, ElementRef, inject, Signal, TemplateRef, viewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { HomeService } from '../../home.service';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-modal-sales-generico',
  imports: [
    RadioButtonModule,
    FormsModule,
    DropdownModule,
    ReactiveFormsModule,
    InputTextModule,
    DatePickerModule 
  ],
  templateUrl: './modal-sales-generico.component.html',
  styleUrl: './modal-sales-generico.component.css'
})
export class ModalSalesGenericoComponent {
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

  fecha:any;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      productos: this.fb.array([])
    });
  }

  get productos() {
    return this.form.get('productos') as FormArray;
  }

  addProduct() {
    const index = this.productos.length;

    const group = this.fb.group({
      tipoVenta: [this.tipoVenta || '-', Validators.required],
      nombre: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(1)]],
      precio: [null, [Validators.required, Validators.min(0)]],
      tipoPago: ['efectivo', Validators.required],
      nota: [null]
    });


    this.productos.push(group);
    this.viewProduct = true;
  }

  get totalCompra(): number {
    return this.productos.controls.reduce((acc, control) => {
      const cantidad = Number(control.get('cantidad')?.value) || 0;
      const precio = Number(control.get('precio')?.value) || 0;
      return acc + cantidad * precio;
    }, 0);
  }

  save() {
    const formData = this.form.value;
    this.ref.close({resp:formData, fecha: this.fecha});
  }

  removeProduct(index: number) {
    this.productos.removeAt(index);
    this.modelosDisponibles.splice(index, 1);
  }
}
