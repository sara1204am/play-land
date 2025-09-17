import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-modal-view',
  imports: [ DatePipe],
  templateUrl: './modal-view.component.html',
  styleUrl: './modal-view.component.css'
})
export class ModalViewComponent {
  public ref: DynamicDialogRef = inject(DynamicDialogRef);
  public dynamicDialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);
  public sale: any;

  ngOnInit(): void {
    this.sale = this.dynamicDialogConfig.data.initial;
  }
}
