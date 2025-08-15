import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Pipe({
  name: 'sumQuantity',
  pure: false
})
export class SumQuantityPipe implements PipeTransform {

  transform(controls: AbstractControl[] | null | undefined): any {
    
    if (!controls || !Array.isArray(controls)) return 0;

    return controls.reduce((acc, control) => {
      const cantidad = control.get('cantidad')?.value;
      return acc + (parseFloat(cantidad) || 0);
    }, 0);
  }

}
