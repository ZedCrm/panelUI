import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectDataService {
  constructor(private http: HttpClient) {}

  /** دریافت داده‌ها برای فیلد select */
  getSelectOptions(url: string): Observable<any> {
    return this.http.get<any[]>(url);
  }
}
