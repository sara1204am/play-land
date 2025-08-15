import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Zn4CoreTableService {
  catalogs = signal<Record<string, any[]> | undefined>(undefined);
}
