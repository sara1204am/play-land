import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sum',
  pure: false
})
export class SumPipe implements PipeTransform {

  transform(value: Array<any>): number {
    let sum = 0
    value.forEach(item => {
      sum = sum + (item.precio_maximo * item.quantityBuy);
    });
    return sum;
  }

}
