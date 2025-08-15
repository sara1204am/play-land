import { Pipe, PipeTransform } from '@angular/core';
import { isDate } from 'date-fns';

@Pipe({
  name: 'getInputDate',
  standalone: true,
})
export class GetInputDatePipe implements PipeTransform {

  transform(
    value: Date | string | number,
    // format: string = 'MMM d y',
    // defaultValue: string = '-',
  ): string {
    if (!value) {
      return '-';
    }

    value = isDate(value) ? value : new Date(value);

    return (value as Date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
