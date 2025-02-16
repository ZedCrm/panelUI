import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { baseResponse } from '../../DTO/baseResponse';
import { Domain } from '../../../utilities/Path';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = Domain;

  constructor(private http: HttpClient) { }

  getModelMetadata(modelName: string): Observable<{ [key: string]: any }> {
    return this.http.get<{ [key: string]: any }>(`${this.apiUrl}/GetModelMetadata/${modelName}`);
  }

  GetData(pageNumber: number, pageSize: number, sortBy: string, sortDirection: boolean): Observable<baseResponse<any>> {
    const requestPayload = { pageNumber, pageSize, sortBy, sortDirection };
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
    });

    return this.http.post<baseResponse<any>>(`${this.apiUrl}/GetAll`, requestPayload, { headers })
      .pipe(
        map(response => ({
          ...response,
          data: response.data ? response.data.map(product => this.convertKeysToLowerCase(product)) : []
        }))
      );
  }

  insertProduct(productData: any): Observable<baseResponse<any>> {
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
    });
    return this.http.post<baseResponse<any>>(`${this.apiUrl}/create`, productData, { headers });
  }

  deleteProducts(id: number): Observable<baseResponse<any>> {
    const headers = new HttpHeaders({
      'accept': '*/*'
    });
    return this.http.delete<baseResponse<any>>(`${this.apiUrl}/delete?id=${id}`, { headers });
  }

  private convertKeysToLowerCase(obj: any): any {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key.toLowerCase()] = obj[key];
      return acc;
    }, {} as any);
  }
}
