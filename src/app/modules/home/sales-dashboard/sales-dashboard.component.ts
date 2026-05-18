import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeService } from '../home.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-sales-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full p-6 bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div class="max-w-6xl mx-auto">
        
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-black text-gray-800 dark:text-white">Dashboard de Ventas</h1>
          <div class="text-sm text-gray-500 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
             Última actualización: {{ today | date:'mediumTime' }}
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-4 mb-4 text-blue-600">
              <span class="material-symbols-outlined p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">payments</span>
              <span class="font-bold">Ventas Totales</span>
            </div>
            <div class="text-3xl font-black text-gray-800 dark:text-white">{{ totalSales | currency:'Bs. ':'symbol':'1.0-2' }}</div>
            <div class="text-sm text-gray-500 mt-1">Histórico acumulado</div>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-4 mb-4 text-green-600">
              <span class="material-symbols-outlined p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">trending_up</span>
              <span class="font-bold">Este Mes</span>
            </div>
            <div class="text-3xl font-black text-gray-800 dark:text-white">{{ currentMonthSales | currency:'Bs. ':'symbol':'1.0-2' }}</div>
            <div class="flex items-center gap-1 mt-1" [ngClass]="growth >= 0 ? 'text-green-500' : 'text-red-500'">
               <span class="material-symbols-outlined text-sm">{{ growth >= 0 ? 'arrow_upward' : 'arrow_downward' }}</span>
               <span class="text-sm font-bold">{{ growth | number:'1.1-1' }}%</span>
               <span class="text-xs text-gray-400 font-normal">vs mes anterior</span>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-4 mb-4 text-purple-600">
              <span class="material-symbols-outlined p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">shopping_bag</span>
              <span class="font-bold">Pedidos</span>
            </div>
            <div class="text-3xl font-black text-gray-800 dark:text-white">{{ totalOrders }}</div>
            <div class="text-sm text-gray-500 mt-1">Transacciones realizadas</div>
          </div>

        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
           <!-- Monthly Chart -->
           <div class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
              <div>
                 <h2 class="text-xl font-bold text-gray-800 dark:text-white">Rendimiento Mensual</h2>
                 <p class="text-gray-500 text-sm">Ventas brutas de los últimos meses</p>
              </div>
              
              <!-- Custom Monthly Progress List with Vertical Scroll -->
              <div class="space-y-4 mt-6 max-h-[250px] overflow-y-auto pr-2">
                 <div *ngFor="let month of monthlyStats" class="flex flex-col">
                    <div class="flex justify-between items-center mb-1">
                       <span class="font-bold text-xs text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                          {{ month.label }}
                          <span *ngIf="month.isCurrent" class="text-[8px] font-extrabold uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full border border-blue-200">Mes Actual</span>
                       </span>
                       <span class="font-black text-xs text-blue-600 dark:text-blue-400">
                          {{ month.total | currency:'Bs. ':'symbol':'1.0-2' }}
                       </span>
                    </div>
                    <div class="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                       <div 
                          class="h-full rounded-full transition-all duration-700 ease-out"
                          [ngClass]="month.isCurrent ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'"
                          [style.width.%]="(month.total / maxMonthlyTotal) * 100 || 0"
                       ></div>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Category Performance Chart -->
           <div class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
              <div>
                 <div class="flex justify-between items-center">
                    <h2 class="text-xl font-bold text-gray-800 dark:text-white">Ventas por Categoría</h2>
                    <span class="text-[9px] font-extrabold uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">Distribución</span>
                 </div>
                 <p class="text-gray-500 text-sm">¿Qué es lo que más se vende por categoría?</p>
              </div>
              
              <!-- Custom Horizontal Bar Chart -->
              <div class="space-y-4 mt-6">
                 <div *ngFor="let cat of categoryStats" class="flex flex-col">
                    <div class="flex justify-between items-center mb-1">
                       <span class="font-bold text-xs text-gray-700 dark:text-gray-200">{{ cat.label }}</span>
                       <span class="font-black text-xs" [ngClass]="cat.textClass">
                          {{ cat.total | currency:'Bs. ':'symbol':'1.0-2' }}
                       </span>
                    </div>
                    <div class="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                       <div 
                          class="h-full rounded-full transition-all duration-700 ease-out"
                          [ngClass]="cat.colorClass"
                          [style.width.%]="(cat.total / maxCategoryTotal) * 100 || 0"
                       ></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Top Products Preview -->
        <!-- Out of Stock Products Section -->
        <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div class="flex justify-between items-center mb-4">
                 <h3 class="font-bold text-gray-800 dark:text-white">Productos con Stock 0</h3>
                 <span class="text-[10px] font-extrabold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full animate-pulse border border-red-200">Reabastecer</span>
              </div>
              <div class="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                 <div *ngIf="outOfStockProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-slate-400">
                    <span class="text-3xl mb-2">🎉</span>
                    <span class="font-bold text-xs text-slate-500">¡Todo en orden!</span>
                    <p class="text-[10px] text-slate-400 text-center px-4 mt-1">No hay productos con stock 0 registrados actualmente.</p>
                 </div>
                 <div *ngFor="let prod of outOfStockProducts" class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div class="flex items-center gap-3">
                       <img [src]="prod.photo || 'assets/imagenes/no-image.png'" class="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-100" />
                       <div>
                          <div class="font-bold text-sm text-gray-800 dark:text-white">{{ prod.nombre }}</div>
                          <div class="flex items-center gap-1.5 mt-0.5">
                             <span class="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">Ref: {{ prod.nombre_corto || 'N/A' }}</span>
                             <span *ngIf="prod.recentlySold" class="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold border border-amber-100 flex items-center gap-0.5">
                                🔥 Demanda Reciente
                             </span>
                          </div>
                       </div>
                    </div>
                    <div class="text-right">
                       <div class="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100 inline-block">0 unidades</div>
                       <div class="text-[9px] text-slate-400 mt-0.5">Costo: Bs {{ prod.costo_unitario || 0 }}</div>
                    </div>
                 </div>
              </div>
           </div>

           <div class="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between">
              <div>
                 <span class="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Tip de Inventario</span>
                 <h3 class="text-2xl font-black mt-4 leading-tight">El 80% de tus ventas provienen del 20% de tus productos.</h3>
                 <p class="mt-4 text-blue-100 text-sm">Mantén siempre stock de tus productos más vendidos para no perder oportunidades.</p>
              </div>
              <div class="mt-8 flex gap-4">
                 <button class="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-50 transition" (click)="goToStock()">
                    Ver Stock Físico
                 </button>
              </div>
           </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class SalesDashboardComponent implements OnInit {
  private service = inject(HomeService);
  
  @Output() tabChange = new EventEmitter<string>();
  
  public today = new Date();
  public sales: any[] = [];
  public totalSales = 0;
  public totalOrders = 0;
  public currentMonthSales = 0;
  public lastMonthSales = 0;
  public growth = 0;
  public recentSales: any[] = [];
  public outOfStockProducts: any[] = [];
  public monthlyStats: any[] = [];
  public maxMonthlyTotal = 0;
  public categoryStats: any[] = [];
  public maxCategoryTotal = 0;

  ngOnInit(): void {
    this.loadData();
  }

  goToStock() {
    this.tabChange.emit('stock');
  }

  async loadData() {
    try {
      this.sales = await lastValueFrom(this.service.getVentas());
      const allProducts = await lastValueFrom(this.service.getProductosAll());
      this.processStats(allProducts);
    } catch (e) {
      console.error('Error loading sales data', e);
    }
  }

  private processStats(allProducts: any[] = []) {
    this.totalOrders = this.sales.length;
    this.totalSales = this.sales.reduce((acc, curr) => acc + (curr.total || 0), 0);
    this.recentSales = [...this.sales].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 5);

    // Calculate total stock helper
    const getProductStock = (prod: any) => {
      let options: any[] = [];
      if (prod.stock_by_option) {
        if (Array.isArray(prod.stock_by_option)) {
          options = prod.stock_by_option;
        } else if (typeof prod.stock_by_option === 'string') {
          try {
            options = JSON.parse(prod.stock_by_option);
          } catch (e) {
            options = [];
          }
        }
      }
      return options && options.length > 0
        ? options.reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0)
        : Number(prod.cantidad) || 0;
    };

    // Filter products with stock 0
    const zeroStockProducts = allProducts.filter(p => getProductStock(p) === 0);

    // Check recently sold products in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentlySoldIds = new Set<string>();
    
    this.sales.forEach(sale => {
      if (!sale.fecha) return;
      const saleDate = new Date(sale.fecha);
      if (saleDate >= oneWeekAgo) {
        let detailArr: any[] = [];
        if (sale.detail) {
          if (Array.isArray(sale.detail)) {
            detailArr = sale.detail;
          } else if (typeof sale.detail === 'string') {
            try {
              detailArr = JSON.parse(sale.detail);
            } catch (e) {}
          }
        }
        detailArr.forEach((item: any) => {
          if (item.productoId) {
            recentlySoldIds.add(item.productoId);
          }
        });
      }
    });

    // Mark recently sold on products and sort them
    zeroStockProducts.forEach((p: any) => {
      p.recentlySold = recentlySoldIds.has(p.id);
    });

    zeroStockProducts.sort((a: any, b: any) => {
      const aSold = a.recentlySold ? 1 : 0;
      const bSold = b.recentlySold ? 1 : 0;
      return bSold - aSold; // sold in last week comes first
    });

    this.outOfStockProducts = zeroStockProducts;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Group by month dynamically based on sales dates
    const months: { [key: string]: number } = {};
    const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    this.sales.forEach(s => {
      if (!s.fecha) return;
      const d = new Date(s.fecha);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (months[key] === undefined) {
        months[key] = 0;
      }
      months[key] += (s.total || 0);
    });

    // If no sales data, initialize with last 6 months
    if (Object.keys(months).length === 0) {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        months[key] = 0;
      }
    }

    this.monthlyStats = Object.keys(months)
      .sort((a, b) => {
        const [yearA, monthA] = a.split('-').map(Number);
        const [yearB, monthB] = b.split('-').map(Number);
        return new Date(yearB, monthB, 1).getTime() - new Date(yearA, monthA, 1).getTime();
      })
      .map(key => {
        const [year, month] = key.split('-').map(Number);
        return {
          label: monthLabels[month] + ' ' + (year % 100),
          total: months[key],
          isCurrent: year === currentYear && month === currentMonth
        };
      });

    this.maxMonthlyTotal = Math.max(...this.monthlyStats.map(m => m.total), 1);
    
    // Current vs Last month
    const currentKey = `${currentYear}-${currentMonth}`;
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastKey = `${lastMonthDate.getFullYear()}-${lastMonthDate.getMonth()}`;
    
    this.currentMonthSales = months[currentKey] || 0;
    this.lastMonthSales = months[lastKey] || 0;
    
    if (this.lastMonthSales > 0) {
      this.growth = ((this.currentMonthSales - this.lastMonthSales) / this.lastMonthSales) * 100;
    } else {
      this.growth = this.currentMonthSales > 0 ? 100 : 0;
    }

    // --- Calculate Category Stats ---
    const categorySales: { [key: string]: number } = {
      '1': 0, // Juguetes
      '2': 0, // Peluche
      '3': 0, // Bebes
      '4': 0, // Otros
      '5': 0  // Amigurumis
    };

    this.sales.forEach(sale => {
      let detailArr: any[] = [];
      if (sale.detail) {
        if (Array.isArray(sale.detail)) {
          detailArr = sale.detail;
        } else if (typeof sale.detail === 'string') {
          try {
            detailArr = JSON.parse(sale.detail);
          } catch (e) {}
        }
      }
      detailArr.forEach((item: any) => {
        if (item.productoId) {
          const prod = allProducts.find(p => p.id === item.productoId);
          if (prod) {
            const cat = prod.type || '4'; // fallback to Otros
            const itemTotal = (Number(item.cantidad) || 0) * (Number(item.precio) || 0);
            if (categorySales[cat] !== undefined) {
              categorySales[cat] += itemTotal;
            } else {
              categorySales[cat] = itemTotal;
            }
          }
        }
      });
    });

    const categoryLabels: { [key: string]: string } = {
      '1': '🎮 Juguetes',
      '2': '🧸 Peluches',
      '3': '🍼 Bebés',
      '4': '✨ Otros',
      '5': '🧶 Amigurumis'
    };

    const categoryColors: { [key: string]: string } = {
      '1': 'bg-indigo-500',
      '2': 'bg-pink-500',
      '3': 'bg-teal-500',
      '4': 'bg-slate-500',
      '5': 'bg-amber-500'
    };

    const categoryTextColors: { [key: string]: string } = {
      '1': 'text-indigo-600 dark:text-indigo-400',
      '2': 'text-pink-600 dark:text-pink-400',
      '3': 'text-teal-600 dark:text-teal-400',
      '4': 'text-slate-600 dark:text-slate-400',
      '5': 'text-amber-600 dark:text-amber-400'
    };

    this.categoryStats = Object.keys(categorySales).map(key => ({
      key,
      label: categoryLabels[key] || 'Otros',
      total: categorySales[key],
      colorClass: categoryColors[key] || 'bg-slate-500',
      textClass: categoryTextColors[key] || 'text-slate-600',
    }));

    // Sort by total sales descending
    this.categoryStats.sort((a, b) => b.total - a.total);

    this.maxCategoryTotal = Math.max(...this.categoryStats.map(c => c.total), 1);
  }
}
