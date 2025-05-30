import { Component, OnInit } from '@angular/core';
interface DeliveryOption {
  title: string;
  subtitle: string;
  address?: string;
  price: string;
}

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {
  listProductToBuy: Array<any> = [{},{}];
  deliveryOptions: DeliveryOption[] = [
    {
      title: 'Recojo de la tienda',
      subtitle: 'Horarios (14:00 20:00)',
      address: 'Calle Aniceto Arce #489',
      price: 'Gratis'
    },
    {
      title: 'Envío en Sucre',
      subtitle: 'Recargo por entrega a domicilio',
      price: '5bs'
    },
    {
      title: 'Envío Departamental y Provincial',
      subtitle: 'Envio por pagar en transportadora o flota de preferencia',
      price: '7bs'
    }
  ];

  selectedOption!: DeliveryOption;
  
  ngOnInit(): void {
   this.getData(); 
  }

  getData(){
    const data:any = sessionStorage.getItem('playLandCart');
    this.listProductToBuy = this.listProductToBuy ? JSON.parse(data): [];
    console.log(this.listProductToBuy);

  }

}
