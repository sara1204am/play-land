import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { lastValueFrom, map, Observable } from 'rxjs';
import { deburr, includes } from 'lodash';

const API_PRODUCT_URL = `${environment.host}/articulo`;
const API_IMG_URL = `${environment.host}/imagenes`;
const API_SALES_URL = `${environment.host}/venta`;
const API_CLOUDINARY_URL = `${environment.host}/upload-cloudinary`;


const API_URL = `${environment.host}`;

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private http: HttpClient = inject(HttpClient);

  getProductos(): Observable<any> {
    const filter = {
      where: { active: true },
      include: {
        imagenes: true
      }
    }
    const obj = encodeURIComponent(JSON.stringify(filter))
    return this.http.get<any[]>(`${API_PRODUCT_URL}?filter=${obj}`).pipe(
      map(articulos => {
        return articulos.map(articulo => {
          if (articulo.imagenes && articulo.imagenes.length > 0) {
            if(articulo.imagenes[0].url){
                articulo.photo = articulo.imagenes[0].url_2;
            } else {
              const idImagen = articulo.imagenes[0].nombre;
              articulo.photo = `${API_URL}/uploads/art/download/${idImagen}?access_token=${this.getTokenId()}`;
            }
          } else {
            articulo.photo = null; // o imagen por defecto
          }
          return articulo;
        });
      })
    );
  }

  getProductosAll(): Observable<any> {
    const filter = {
      where: { active: true },
      include: {
        imagenes: true
      }
    }
    const obj = encodeURIComponent(JSON.stringify(filter))
    return this.http.get<any[]>(`${API_PRODUCT_URL}?filter=${obj}`).pipe(
      map(articulos => {
        return articulos.map(articulo => {
          if (articulo.imagenes && articulo.imagenes.length > 0) {
          /*   if(articulo.imagenes[0].url){
                articulo.photo = articulo.imagenes[0].url_2;
            } else {
              const idImagen = articulo.imagenes[0].nombre;
              articulo.photo = `${API_URL}/uploads/art/download/${idImagen}?access_token=${this.getTokenId()}`;
            } */
             articulo.photo = `https://play-land-images.s3.us-east-1.amazonaws.com/${articulo.imagenes[0].url}`;
          } else {
            articulo.photo = null; // o imagen por defecto
          }
          return articulo;
        });
      })
    );
  }

  getProductosByFilter(ids: string[]): Observable<any[]> {
    const filter = {
      where: {
        id: { in: ids } 
      }
    };

    const obj = encodeURIComponent(JSON.stringify(filter));
    return this.http.get<any[]>(`${API_PRODUCT_URL}?filter=${obj}`);
  }


  getSales(): Observable<any> {
    const filter = {};

    const obj = encodeURIComponent(JSON.stringify(filter))
    return this.http.get<any[]>(`${API_SALES_URL}?filter=${obj}`)
  }

  saveVenta(data: any): Observable<any> {
    return this.http.post(`${API_SALES_URL}`, data);
  }

  saveProduct(data: any): Observable<any> {
    return this.http.post(`${API_PRODUCT_URL}`, data);
  }

  saveImagen(data: any): Observable<any> {
    return this.http.post(`${API_IMG_URL}`, data);
  }

  editProduct(data: any,): Observable<any> {
    return this.http.patch(`${API_PRODUCT_URL}`, { ...data });
  }

  uploadImagen(fileOrBase64: File | string): any {
    let file: File;

    // Si es base64, convertir a File
    if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:image')) {
      const mimeType = fileOrBase64.match(/data:(.*?);base64/)?.[1] || 'image/png';
      const base64Data = fileOrBase64.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      file = new File([byteArray], `${Date.now()}.${mimeType.split('/')[1]}`, { type: mimeType });
    } else {
      file = fileOrBase64 as File;
    }

    // Armar FormData
    const fd = new FormData();
    fd.append('file', file);

    // Request con progreso
    const req = new HttpRequest('POST',API_CLOUDINARY_URL, fd, {
      reportProgress: true,
    });

    return  lastValueFrom(this.http.request(req));
  }

/* last  */
 /*  async uploadImagen(fileOrBase64: File | string) {
    let file: File;

    if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:image')) {
      // Si es base64 → convertir a File
      const mimeType = fileOrBase64.match(/data:(.*?);base64/)?.[1] || 'image/png';
      const base64Data = fileOrBase64.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      file = new File([byteArray], `${Date.now().toString()}.${mimeType.split('/')[1]}`, { type: mimeType });
    } else {
      // Si ya es un File
      file = fileOrBase64 as File;
    }

    // Limpiar nombre
    let finalFileName = file.name;
    if (finalFileName) {
      finalFileName = deburr(finalFileName);
      finalFileName = finalFileName.replace(
        /[!¡@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?¿]/gi,
        '',
      );
    }

    // Subir
    const resp = await this.uploadFile(file, finalFileName, 'uploads', 'art');
    return resp;
  } */

  public async uploadFile(
    file: File,
    fileName: string,
    container: string = 'uploads',
    folder: string,
  ): Promise<any> {
    container = encodeURIComponent(container);
    folder = encodeURIComponent(folder);

    const formData = new FormData();
    formData.append('file', file, fileName.toString());

    const token = this.getTokenId();
    const url = `${API_URL}/${container}/${folder}/upload?access_token=${token}`;

    await fetch(url, {
      method: 'POST',
      body: formData,
    });
    return fileName
  }

  public getTokenId(): string | null {
    return sessionStorage.getItem('play-land-sucre.id',
    );
  }


  getProductStore(type: string): Observable<any> {
    const filter = {
      where: { active:true , type },
      include: {
        imagenes: true
      }

    }
    const obj = encodeURIComponent(JSON.stringify(filter))
    return this.http.get(`${API_PRODUCT_URL}?filter=${obj}`, {})
    .pipe(
      map((articulos:any) => {
        return articulos.map((articulo:any) => {
          if (articulo.imagenes && articulo.imagenes.length > 0) {
             /*  if (articulo.imagenes[0].url) {
                articulo.img = articulo.imagenes[0].url_2;
              } else {
                const idImagen = articulo.imagenes[0].nombre;
                articulo.img = `${API_URL}/uploads/art/download/${idImagen}?access_token=${this.getTokenId()}`;
              } */
               articulo.img = `https://play-land-images.s3.us-east-1.amazonaws.com/${articulo.imagenes[0].url}`;
          } else {
            articulo.img = null;
          }
          return articulo;
        });
      })
    );
  }

    getProductStoreBySearch(search: string): Observable<any> {
    const filter = {
      where: {
        active: true,
        nombre: {
          contains: search,
        }
      },
      include: {
        imagenes: true
      }

    }
    const obj = encodeURIComponent(JSON.stringify(filter))
    return this.http.get(`${API_PRODUCT_URL}?filter=${obj}`, {})
      .pipe(
        map((articulos: any) => {
          return articulos.map((articulo: any) => {
            if (articulo.imagenes && articulo.imagenes.length > 0) {
              /*  if (articulo.imagenes[0].url) {
                 articulo.img = articulo.imagenes[0].url_2;
               } else {
                 const idImagen = articulo.imagenes[0].nombre;
                 articulo.img = `${API_URL}/uploads/art/download/${idImagen}?access_token=${this.getTokenId()}`;
               } */
                    articulo.img = `https://play-land-images.s3.us-east-1.amazonaws.com/${articulo.imagenes[0].url}`;
            } else {
              articulo.img = null;
            }
            return articulo;
          });
        })
      );
  }

  getAllCloudinary(): Observable<any> {
    return this.http.get(`${API_CLOUDINARY_URL}/all`, {});
  }

  backup(): Observable<any> {
    return this.http.get(`${API_CLOUDINARY_URL}/backup`, {});
  }
}
