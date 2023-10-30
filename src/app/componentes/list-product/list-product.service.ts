import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroment/environment';
import { HttpClient } from "@angular/common/http";

const API_PRODUCT_URL = `${environment.host}/articulo`;

@Injectable({
  providedIn: 'root'
})
export class ListProductService {

  constructor(private http: HttpClient) { }

  getProductos(): Observable<any> {
    const filter = {
      where: {active:true}
    }
    const obj = encodeURIComponent(JSON.stringify(filter))
    return this.http.get(`${API_PRODUCT_URL}?filter=${obj}`, {});
  }


  orderProductosPrecio(type: string): Observable<any> {
    const filter = {
      where: { active:true },
      orderBy: [
        {
          precio_maximo: type,
        }
      ],

    }
    const obj = encodeURIComponent(JSON.stringify(filter))
    return this.http.get(`${API_PRODUCT_URL}?filter=${obj}`, {});
  }

  getSearch(
    text: string
  ): Observable<any[]> {
    const filter = {
      where: {
            nombre_corto: {
              contains: text
            },
      },
    };    
    const obj = encodeURIComponent(JSON.stringify(filter));
    return this.http.get<any[]>(
      `${API_PRODUCT_URL}?filter=${obj}`
    );
  }

}
