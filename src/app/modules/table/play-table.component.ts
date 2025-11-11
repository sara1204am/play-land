import {
  AfterViewInit,
  Component,
  effect,
  HostListener,
  inject,
  input,
  output,
  TemplateRef,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Table,
  TableModule,
  TableRowSelectEvent,
  TableService,
} from 'primeng/table';
import { Zn45TableColumnI, ZnCoreTableTags } from './play-table.interface';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { DateFnsModule } from 'ngx-date-fns';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { NgTemplateOutlet } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FilterFieldsPipe } from './filter-fields.pipe';
import { Zn4CoreTableService } from './play-table.service';
import { GetCatalogLabelPipe } from './get-catalog-label.pipe';
import { debounce } from 'lodash-es';
import { isDate } from 'date-fns';

interface Filters {
  global?: {
    value?: string;
  };
}

interface StoredData {
  filters?: Filters;
}

@Component({
  selector: 'play-table',
  imports: [
    TableModule,
    FormsModule,
    TranslateModule,
    DialogModule,
    CdkDropList,
    CdkDrag,
    DateFnsModule,
    MultiSelectModule,
    TooltipModule,
    NgTemplateOutlet,
    DropdownModule,
    FilterFieldsPipe,
    GetCatalogLabelPipe,
  ],
  providers: [Table, TableService],
  templateUrl: './play-table.component.html',
  styleUrl: './play-table.component.css',
})
export class PlayTableComponent implements AfterViewInit {
  data = input.required<unknown[]>();
  columns = input.required<Zn45TableColumnI[]>();
  catalogs = input<Record<string, any[]>>({});
  defaultImg = input<string>('/assets/img/no-image.jpg');
  selectItem = output<unknown>();
  uid = input.required<string>();
  rows = input<number>(10);
  rowsPerPageOptions = input<any>([10, 25, 50]);
  actionsTemplate = input<TemplateRef<unknown> | null>();
  saveState = input<boolean>(false);
  config = input<{
    globalSearch: boolean;
    resetButton: boolean;
    configColumns: boolean;
  }>({
    globalSearch: true,
    resetButton: true,
    configColumns: true,
  });
  selectedItem: Record<string, unknown> | null = null;
  loading = false;
  viewFields = false;
  searchValue = '';
  // get globalFilterFields() {
  //   console.log('globalFilterFields');
  //   return this.columns()
  //     .filter((c) => c.globalSearch)
  //     .map((c) => c.key);
  // }

  noDataTemplate = input<TemplateRef<unknown>>();

  isMobile = false;
  tableData: unknown[] = [];

  private service = inject(Zn4CoreTableService);
  constructor() {
    this.service.catalogs = signal(this.catalogs());
    // this.loading = true;
    effect(() => {
      if (this.data()) {
        this.filterDataBySearch();
      }
    });
  }

  ngAfterViewInit(): void {
    this.onResize();
    this.getState();
    // this.loading = false;
  }

  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.columns(), event.previousIndex, event.currentIndex);
  }

  onRowSelect(ev: TableRowSelectEvent<unknown>) {
    this.selectItem.emit(ev.data);
    setTimeout(() => {
      this.selectedItem = null;
    }, 200);
  }

  clear(table: Table) {
    this.searchValue = '';
    table.clear();
    this.filterData();
  }

  getState() {
    const d: StoredData = JSON.parse(localStorage.getItem(this.uid()) || '{}');
    setTimeout(() => {
      this.searchValue = d.filters?.global?.value ?? '';
      this.selectedItem = null;
    }, 200);
  }

  filterData = debounce(() => {
    this.filterDataBySearch();
  }, 500);

  private filterDataBySearch(): void {
    const filterableColumns = this.columns().filter((c) => c.globalSearch);

    if (!this.searchValue || !filterableColumns?.length) {
      this.tableData = this.data();
      return;
    }

    const tmpCatalogs: Record<string, any[]> = {};

    filterableColumns.forEach((c) => {
      if (c.type === 'select') {
        tmpCatalogs[c.key] = this.catalogs()[c.catalogCode]?.filter(
          (item: any) =>
            item.label
              ?.toString()
              .toString()
              .toLowerCase()
              .includes(this.searchValue.toLowerCase()),
        );
      }
    });

    this.tableData = this.data().filter((item) =>
      filterableColumns.some((c) => {
        const itemRecord = item as Record<string, unknown>;
        if (c.type === 'select') {
          return (
            tmpCatalogs[c.key] &&
            tmpCatalogs[c.key].some(
              (catalog: any) => itemRecord[c.key] === catalog.value,
            )
          );
        }

        const value = itemRecord[c.key];
        return (
          value != null &&
          typeof value === 'string' &&
          value.toLowerCase().includes(this.searchValue.toLowerCase())
        );
      }),
    );
  }

  gDate(d: Date | string | number) {
    return isDate(d) ? d : new Date(d);
  }

  @HostListener('window:resize', ['$event'])
  private onResize(): void {
    this.isMobile = window.innerWidth <= 720;
  }

  getTagClass(tags: ZnCoreTableTags[], val: string | number | boolean) {
    return tags.find((t: ZnCoreTableTags) => t.value === val)?.tailwindClass;
  }
}
