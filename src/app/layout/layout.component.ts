import { Component, OnDestroy } from '@angular/core';
import { ListProductService } from '../componentes/list-product/list-product.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent  implements OnDestroy {
  private subscription: Subscription;
  listProductToBuy:any = [];
  onDestroy$ = new Subject();
  routePage: string = '';

  constructor( 
      private listProductService: ListProductService,
      private router: Router
    ) {
    this.listProductToBuy = sessionStorage.getItem('playLandCart');
    this.listProductToBuy = this.listProductToBuy ? JSON.parse(this.listProductToBuy): [];

    this.subscription = this.listProductService.getEvent().subscribe(data => {
      this.listProductToBuy = data;
    });
    
    this.router.events.pipe(takeUntil(this.onDestroy$)).subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.routePage = event.url;
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  openCart(){
    this.router.navigate(['shopping']);
  }
}
