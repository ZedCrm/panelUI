import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { baseResponse } from '../../DTO/baseResponse';
import { Domain } from '../../../utilities/Path';
import { MetadataField } from '../../DTO/MetadataField';

@Injectable({
  providedIn: 'root'
})
export class CountTypeService {
  private apiUrl = Domain;
  constructor(private http: HttpClient) { }


    /** دریافت لیست داده‌ها */
    getRecords(pageNumber: number, pageSize: number, sortBy: string, sortDirection: boolean): Observable<baseResponse<any>> {
      const requestPayload = { pageNumber, pageSize, sortBy, sortDirection };
      const headers = new HttpHeaders({
        'accept': 'application/json',
        'Content-Type': 'application/json'
      });
  
      return this.http.post<baseResponse<any>>(`${this.apiUrl}/api/CountType/GetAll`, requestPayload, { headers })
        ;
    }

      /** افزودن  */
  insertRecord(productData: any): Observable<baseResponse<any>> {
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
      
    });
    return this.http.post<baseResponse<any>>(`${this.apiUrl}/api/CountType/create`, productData, { headers });
  }


  /** حذف  */
  deleteRecords(ids: number[]): Observable<baseResponse<any>> {
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
    });
    return this.http.post<baseResponse<any>>(`${this.apiUrl}/api/CountType/delete`, ids, { headers });
  }
  
  /** ویرایش  */
  updateRecord(productData: any): Observable<baseResponse<any>> {
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
    });
    return this.http.post<baseResponse<any>>(`${this.apiUrl}/api/CountType/update`, productData, { headers });
  }
  /**get by id */
  getRecordById(id: number): Observable<baseResponse<any>> {
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Content-Type': 'application/json'
    });
    return this.http.get<baseResponse<any>>(`${this.apiUrl}/api/CountType/getById/?id=${id}`, { headers });
  }


}
