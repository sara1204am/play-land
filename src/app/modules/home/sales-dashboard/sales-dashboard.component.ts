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

        <!-- Chart Section -->
        <div class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div class="flex justify-between items-center mb-10">
             <div>
                <h2 class="text-xl font-bold text-gray-800 dark:text-white">Rendimiento Mensual</h2>
                <p class="text-gray-500 text-sm">Ventas brutas de los últimos meses</p>
             </div>
          </div>

          <!-- Custom Bar Chart (CSS Based for zero dependencies) -->
          <div class="flex items-end gap-2 md:gap-4 h-80 border-b border-gray-100 dark:border-gray-700 pb-2 overflow-x-auto pt-10">
             <div *ngFor="let month of monthlyStats" class="flex-1 flex flex-col items-center group">
                <div class="relative w-full flex flex-col items-center">
                   <!-- Amount badge always visible -->
                   <div class="absolute -top-7 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap z-10">
                      {{ month.total | currency:'Bs. ':'symbol':'1.0-0' }}
                   </div>
                   
                   <!-- Bar -->
                   <div 
                      class="w-full max-w-[40px] rounded-t-lg transition-all duration-500 ease-out cursor-pointer hover:brightness-110"
                      [style.height.px]="(month.total / maxMonthlyTotal) * 200 + 10"
                      [ngClass]="month.isCurrent ? 'bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-none' : 'bg-blue-500 hover:bg-blue-600'"
                   ></div>
                </div>
                <div class="mt-4 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-tighter">
                   {{ month.label }}
                </div>
             </div>
          </div>
        </div>

        <!-- Top Products Preview -->
        <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 class="font-bold text-gray-800 dark:text-white mb-4">Últimas Ventas</h3>
              <div class="space-y-4">
                 <div *ngFor="let sale of recentSales" class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div class="flex items-center gap-3">
                       <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                          <span class="material-symbols-outlined text-sm">person</span>
                       </div>
                       <div>
                          <div class="font-bold text-sm text-gray-800 dark:text-white">{{ sale.nota || 'Venta General' }}</div>
                          <div class="text-[10px] text-gray-500">{{ sale.fecha | date:'dd MMM, HH:mm' }}</div>
                       </div>
                    </div>
                    <div class="font-black text-blue-600">{{ sale.total | currency:'Bs. ' }}</div>
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
  public monthlyStats: any[] = [];
  public maxMonthlyTotal = 0;

  ngOnInit(): void {
    this.loadData();
  }

  goToStock() {
    this.tabChange.emit('stock');
  }

  async loadData() {
    try {
      this.sales = await lastValueFrom(this.service.getVentas());
      this.processStats();
    } catch (e) {
      console.error('Error loading sales data', e);
    }
  }

  private processStats() {
    this.totalOrders = this.sales.length;
    this.totalSales = this.sales.reduce((acc, curr) => acc + (curr.total || 0), 0);
    this.recentSales = [...this.sales].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 5);

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
        return new Date(yearA, monthA, 1).getTime() - new Date(yearB, monthB, 1).getTime();
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
  }
}
