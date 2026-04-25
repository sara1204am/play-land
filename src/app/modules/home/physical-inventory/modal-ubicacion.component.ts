import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-ubicacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    CheckboxModule,
    ButtonModule
  ],
  template: `
    <div class="p-4">
      <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <label class="font-bold text-gray-700">Nombre de la Ubicación</label>
          <input pInputText formControlName="nombre" placeholder="Ej: Almacén Principal, Estante A-1" class="w-full" />
          @if(form.get('nombre')?.invalid && form.get('nombre')?.touched){
            <small class="text-red-500">El nombre es requerido</small>
          }
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold text-gray-700">Descripción</label>
          <textarea pInputTextarea formControlName="descripcion" placeholder="Detalles adicionales..." class="w-full p-2 border rounded-md" rows="3"></textarea>
        </div>

        <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
          <p-checkbox formControlName="activo" [binary]="true" inputId="activo"></p-checkbox>
          <label for="activo" class="font-semibold cursor-pointer">Ubicación Activa</label>
        </div>

        <div class="flex justify-end gap-3 mt-4 border-t pt-4">
          <button type="button" (click)="cancel()" class="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 transition">
            Cancelar
          </button>
          <button type="submit" [disabled]="form.invalid" class="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition">
            Guardar Ubicación
          </button>
        </div>
      </form>
    </div>
  `
})
export class ModalUbicacionComponent implements OnInit {
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private fb = inject(FormBuilder);

  public form!: FormGroup;

  ngOnInit(): void {
    const initial = this.config.data?.initial || {};
    this.form = this.fb.group({
      id: [initial.id],
      nombre: [initial.nombre || '', Validators.required],
      descripcion: [initial.descripcion || ''],
      activo: [initial.activo !== undefined ? initial.activo : true]
    });
  }

  save() {
    if (this.form.invalid) return;
    this.ref.close(this.form.value);
  }

  cancel() {
    this.ref.close();
  }
}
