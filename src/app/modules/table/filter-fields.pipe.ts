import { Pipe, PipeTransform } from '@angular/core';
import { Zn45TableColumnI } from './play-table.interface';

@Pipe({
  name: 'filterFields',
  standalone: true,
})
export class FilterFieldsPipe implements PipeTransform {
  transform(columns: Zn45TableColumnI[]): string[] {
    return columns.filter((c) => c.globalSearch).map((c) => c.key);
  }
}
