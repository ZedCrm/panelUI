import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { baseResponse } from '../../DTO/baseResponse';
import { Domain } from '../../../utilities/Path';
import { MetadataField } from '../../DTO/MetadataField';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = Domain;

  constructor(private http: HttpClient) { }

  /** دریافت متادیتا برای مدل */
  getModelMetadata(modelName: string): Observable<MetadataField[]> {
    return this.http.get<{ [key: string]: MetadataField[] }>(`${this.apiUrl}/api/GetModelMetadata/${modelName}`).pipe(
      map(response => response[modelName] || [])
    );
  }




  /** دریافت لیست داده‌ها */
  getProducts(pageNumber: number, pageSize: number, sortBy: string, sortDirection: boolean): Observable<baseResponse<any>> {
    const requestPayload = { pageNumber, pageSize, sortBy, sortDirection };
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
    });

    return this.http.post<baseResponse<any>>(`${this.apiUrl}/api/GetAll`, requestPayload, { headers })
      ;
  }

  /** افزودن محصول */
  insertProduct(productData: any): Observable<baseResponse<any>> {
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
    });
    return this.http.post<baseResponse<any>>(`${this.apiUrl}/api/create`, productData, { headers });
  }

  /** حذف محصول */
  deleteProduct(id: number): Observable<baseResponse<any>> {
    const headers = new HttpHeaders({ 'accept': '*/*' });
    return this.http.delete<baseResponse<any>>(`${this.apiUrl}/api/delete?id=${id}`, { headers });
  }

  /** تبدیل کلیدهای آبجکت به حروف کوچک */
  private convertKeysToLowerCase(obj: any): any {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key.toLowerCase()] = obj[key];
      return acc;
    }, {} as any);
  }
}
