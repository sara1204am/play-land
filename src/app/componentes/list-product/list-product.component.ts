import { AfterViewChecked, Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ListProductService } from './list-product.service';

@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.scss']
})
export class ListProductComponent implements AfterViewChecked {
  
  public isMobile: boolean = false;
  private isThereCard = false;
  public textSearch: string = '';

  public error: any;


  public viewHeart: boolean= false;

  public quantity:number= 1;

  public selectId: any= null;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isMobile = window.innerWidth <= 800;
  }


  listProductos: Array<any> = [];
  constructor(
    private renderer: Renderer2, 
    private el: ElementRef,
    private listProductService: ListProductService
    ) {}

  ngOnInit() {
    this.isMobile = window?.innerWidth <= 800; 
    this.getData()
  }

  ngAfterViewChecked(): void {
    const cards = this.el.nativeElement.querySelectorAll('.card');
    if (cards.length > 0 && !this.isThereCard){
      this.isThereCard = true;
      let zindex = 10;

      cards.forEach((card: any) => {
        this.renderer.listen(card, 'click', (event) => {
          event.preventDefault();
          let isShowing = false;
          if (card.classList.contains('show')) {
            isShowing = true;
          }
  
          const cardsContainer = this.el.nativeElement.querySelector('.cards');
          if (cardsContainer.classList.contains('showing')) {
            const showingCard = this.el.nativeElement.querySelector('.card.show');
            this.renderer.removeClass(showingCard, 'show');
  
            if (isShowing) {
              this.renderer.removeClass(cardsContainer, 'showing');
            } else {
              this.renderer.setStyle(card, 'z-index', zindex);
              this.renderer.addClass(card, 'show');
            }
  
            zindex++;
          } else {
            this.renderer.addClass(cardsContainer, 'showing');
            this.renderer.setStyle(card, 'z-index', zindex);
            this.renderer.addClass(card, 'show');
            zindex++;
          }
        });
      });
    }
    
  }

  updateListCards(){
    const cards = this.el.nativeElement.querySelectorAll('.card');
    this.isThereCard = true;
    let zindex = 10;
    cards.forEach((card: any) => {
      this.renderer.listen(card, 'click', (event) => {
        console.log(event)
        event.preventDefault();
        console.log('event', event)
        let isShowing = false;
        console.log( (card.classList.contains('show')) )
        if (card.classList.contains('show')) {
          isShowing = true;
        }

        const cardsContainer = this.el.nativeElement.querySelector('.cards');
        if (cardsContainer.classList.contains('showing')) {
          const showingCard = this.el.nativeElement.querySelector('.card.show');
          this.renderer.removeClass(showingCard, 'show');

          if (isShowing) {
            this.renderer.removeClass(cardsContainer, 'showing');
          } else {
            this.renderer.setStyle(card, 'z-index', zindex);
            this.renderer.addClass(card, 'show');
          }

          zindex++;
        } else {
          this.renderer.addClass(cardsContainer, 'showing');
          this.renderer.setStyle(card, 'z-index', zindex);
          this.renderer.addClass(card, 'show');
          zindex++;
        }
      });
    });
  }

  async getData() {
    try {
      this.listProductos = await lastValueFrom(this.listProductService.getProductos())
    } catch(e) {
       console.log(e)
    }


  }

  async orderPrice(type: string){
    this.listProductos = await lastValueFrom(this.listProductService.orderProductosPrecio(type))
  }

  async search(){
    if(this.textSearch.length > 1){
      this.listProductos = await lastValueFrom( this.listProductService.getSearch(this.textSearch))
      this.isThereCard = false;
    } else {
      this.listProductos = await lastValueFrom(this.listProductService.getProductos())
      this.isThereCard = false;
    }

  }


  buildImg(e:any){
    return `../../../assets/imagenes/tienda/${e.id}-1.jpg`
  }

  appearHeart(e:any) {
    this.viewHeart = true;
    setTimeout(() => {
      this.viewHeart = false;
    }, 1000);
  }

  addCart(e:any){
    e.quantityBuy = e.quantityBuy ? e.quantityBuy : 1;
    let listProduct: any = sessionStorage.getItem('playLandCart');
    listProduct = listProduct ? JSON.parse(listProduct): [];
    listProduct.push(e);

    sessionStorage.setItem('playLandCart', JSON.stringify(listProduct) );
    e.quantityBuy = 1;
    this.selectId = null;
    this.listProductService.emitEvent(listProduct);

  }

}
