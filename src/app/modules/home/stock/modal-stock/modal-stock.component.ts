import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { SumQuantityPipe } from '../sum-quantity.pipe';

@Component({
  selector: 'app-modal-stock',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    FileUploadModule,
    FormsModule,
    DropdownModule,
    TagModule,
    SumQuantityPipe
  ],
  templateUrl: './modal-stock.component.html',
  styleUrl: './modal-stock.component.css'
})
export class ModalStockComponent implements OnInit, OnDestroy {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  uploadMethod: 'camera' | 'file' = 'camera';
  imagePreview: string | null = null;
  defaultImage = './assets/imagenes/default.png';
  public stream: MediaStream | null = null;


  public ref: DynamicDialogRef = inject(DynamicDialogRef);
  public dynamicDialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);

  public initial!: any;

  productForm: FormGroup;

  public tipoOptions = [
    { label: 'Juguete', value: 'juguete' },
    { label: 'Peluche', value: 'peluche' },
    { label: 'Bebés', value: 'bebes' },
    { label: 'Otro', value: 'otro' }
  ];


  constructor(private fb: FormBuilder) {

    this.productForm = this.fb.group({
      tipo: ['', Validators.required],
      nombre: ['', Validators.required],
      costo_unitario: [null],
      precio: [null],
      lote: [''],
      cantidad: [null],
      colores: this.fb.array([], minLengthArray(1))
    });

    if (this.dynamicDialogConfig.data?.id) {

      this.initial = this.dynamicDialogConfig.data;
      // Llenar formulario con valores iniciales
      this.productForm.patchValue({
        tipo: this.initial.type || '',
        nombre: this.initial.nombre || '',
        costo_unitario: this.initial.costo_unitario ?? null,
        precio: this.initial.precio ?? null,
        lote: this.initial.id_lote || ''
      });

      // Si hay colores, agregarlos al FormArray
      if (this.initial.stock_by_option?.length) {
        const coloresArray = this.productForm.get('colores') as FormArray;
        this.initial.stock_by_option.forEach((item: any) => {
          coloresArray.push(
            this.fb.group({
              color: [item.color, Validators.required],
              cantidad: [item.cantidad, [Validators.required, Validators.min(1)]]
            })
          );
        });
      }
    } else {
      // Por defecto, agregamos dos colores
      this.addItem();
    }
  }

  async ngOnInit(): Promise<void> {
    if (this.uploadMethod === 'camera') {
      this.initCamera();
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(
        { video: { facingMode: { exact: "environment" } } });

      if (this.videoRef?.nativeElement && this.stream) {
        this.videoRef.nativeElement.srcObject = this.stream;
      }
    } catch (err) {
      console.error('No se pudo acceder a la cámara:', err);
    }
  }

  async initCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (this.videoRef?.nativeElement && this.stream) {
        this.videoRef.nativeElement.srcObject = this.stream;
      }
    } catch (err) {
      console.error('No se pudo acceder a la cámara:', err);
    }
  }

  takePhoto(): void {
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.imagePreview = canvas.toDataURL('image/png');
    }
  }

  onImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  get colores(): FormArray {
    return this.productForm.get('colores') as FormArray;
  }
  createColorGroup(): FormGroup {
    return this.fb.group({
      color: ['', Validators.required],
      cantidad: [null, Validators.required]
    });
  }

  removeItem(index: number): void {
    this.colores.removeAt(index);
  }


  addItem() {
    this.colores.push(
      this.fb.group({
        id: new Date().getTime(),
        color: [''],
        cantidad: [0, [Validators.min(0)]]
      })
    );
  }



  public submitForm(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formData = this.productForm.value;
    const image = this.imagePreview;

    const fullData = {
      ...formData,
      imagen: image,
    };
    if (this.initial?.id) {
      fullData.id = this.initial.id;
    }
    this.ref.close(fullData);
  }

  async changeCamara(): Promise<void> {

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    const facingMode = this.stream?.getVideoTracks()[0].getSettings().facingMode === "user"
      ? "environment"
      : "user";

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });

      if (this.videoRef?.nativeElement) {
        this.videoRef.nativeElement.srcObject = this.stream;
      }
    } catch (err) {
      console.error("Error al cambiar de cámara:", err);
    }
  }


  ngOnDestroy(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      if (this.videoRef?.nativeElement) {
        this.videoRef.nativeElement.srcObject = null;
      }
      this.stream = null;

    }
  }

}


function minLengthArray(min: number): Validators {
  return (control: AbstractControl): ValidationErrors | null => {
    const formArray = control as FormArray;
    return formArray && formArray.length >= min ? null : { minLengthArray: true };
  };
}