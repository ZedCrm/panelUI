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
    return this.http.get<{ [key: string]: MetadataField[] }>(`${this.apiUrl}/api/Metadata/GetModelMetadata/${modelName}`).pipe(
      map(response => response[modelName] || [])
    );
  }




  /** دریافت لیست داده‌ها */
  getRecords(pageNumber: number, pageSize: number, sortBy: string, sortDirection: boolean): Observable<baseResponse<any>> {
    const requestPayload = { pageNumber, pageSize, sortBy, sortDirection };
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
    });

    return this.http.post<baseResponse<any>>(`${this.apiUrl}/api/product/GetAll`, requestPayload, { headers })
      ;
  }

  /** افزودن محصول */
  insertRecord(productData: any): Observable<baseResponse<any>> {
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
      
    });
    return this.http.post<baseResponse<any>>(`${this.apiUrl}/api/product/create`, productData, { headers });
  }

  /** حذف محصول */
  deleteRecords(ids: number[]): Observable<baseResponse<any>> {
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
    });
    return this.http.post<baseResponse<any>>(`${this.apiUrl}/api/product/delete`, ids, { headers });
  }

  /** ویرایش محصول */
  updateRecord(productData: any): Observable<baseResponse<any>> {
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
    });
    return this.http.post<baseResponse<any>>(`${this.apiUrl}/api/product/update`, productData, { headers });
  }
  /** دریافت محصول بر اساس شناسه */
  getRecordById(id: number): Observable<baseResponse<any>> {
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
    });
    return this.http.get<baseResponse<any>>(`${this.apiUrl}/api/product/getById/?id=${id}`, { headers });
  }


  getSelectOptions(serviceName: string): Observable<any[]> {
    return this.http.get<any>(`${serviceName}`).pipe(
      map(response => Array.isArray(response) ? response : [])
    );
  }

}
