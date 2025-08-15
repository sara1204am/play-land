import { inject, Pipe, PipeTransform } from '@angular/core';
import { Zn4CoreTableService } from './play-table.service';

@Pipe({
  name: 'getCatalogLabel',
  standalone: true,
})
export class GetCatalogLabelPipe implements PipeTransform {
  private service = inject(Zn4CoreTableService);

  transform(
    value: string | number | boolean,
    catalogCode: string,
    defaultValue = '-',
  ): string | number {
    if (!value || !catalogCode) {
      return defaultValue;
    }

    const catalog: any[] = this.service.catalogs()?.[catalogCode] || [];

    if (!catalog?.length) {
      return defaultValue;
    }

    if (Array.isArray(value)) {
      return (
        value
          .map((v) => catalog.find((c: any) => c.value === v)?.label)
          .filter(Boolean)
          .join(', ') || defaultValue
      );
    }

    return (
      catalog.find((c: any) => c.value === value)?.label ||
      defaultValue
    );
  }
}
