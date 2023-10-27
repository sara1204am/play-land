import { Component } from '@angular/core';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent {
  app!: HTMLElement;
  img!: HTMLElement;
  pageNav1!: HTMLElement;
  pageNav2!: HTMLElement;
  animation: boolean = true;
  curSlide: number = 1;
  scrolledUp!: boolean;
  nextSlide!: number;

  ngOnInit() {
    this.app = document.querySelector('.app') as HTMLElement;
    this.img = document.querySelector('.app__img') as HTMLElement;
    this.pageNav1 = document.querySelector('.pages__item--1') as HTMLElement;
    this.pageNav2 = document.querySelector('.pages__item--2') as HTMLElement;

    setTimeout(() => {
      this.app.classList.add('initial');
    }, 1500);

    setTimeout(() => {
      this.animation = false;
    }, 4500);
    
    setInterval(() => {
     if(this.curSlide === 1){
      this.handlePageItemClick(2)
     } else {
      this.handlePageItemClick(1)
     } 

    }, 7000);
  }

  pagination(slide: number, target?: number): void {
    this.animation = true;
    if (target === undefined) {
      this.nextSlide = this.scrolledUp ? slide - 1 : slide + 1;
    } else {
      this.nextSlide = target;
    }

    document.querySelector('.pages__item--' + this.nextSlide)?.classList.add('page__item-active');
    document.querySelector('.pages__item--' + slide)?.classList.remove('page__item-active');

    this.app.classList.toggle('active');
    setTimeout(() => {
      this.animation = false;
    }, 3000);
  }

  navigateDown(): void {
    if (this.curSlide > 1) return;
    this.scrolledUp = false;
    this.pagination(this.curSlide);
    this.curSlide++;
  }

  navigateUp(): void {
    if (this.curSlide === 1) return;
    this.scrolledUp = true;
    this.pagination(this.curSlide);
    this.curSlide--;
  }

  handleMouseWheel(e: Event): void {
    const delta = (e as any).wheelDelta || -(e as any).detail;
    if (this.animation) return;
    if (delta > 0) {
      this.navigateUp();
    } else {
      this.navigateDown();
    }
  }

  handlePageItemClick(target: number): void {
    if (this.animation) return;
    this.pagination(this.curSlide, target);
    this.curSlide = target;
  }


  preventDefault(event: Event): void {
    event.preventDefault();
  }
}
