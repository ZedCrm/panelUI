import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';

export interface MetadataField {
  name: string;
  type: string;
  required: boolean;
  maxLength?: number;
  minLength?: number;
  displayName?: string; 
}

@Injectable({
  providedIn: 'root',
})
export class GetModalService {
  private apiUrl = 'http://localhost:90/api/Metadata/GetModelMetadata';

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  getDynamicForm(modelName: string): Observable<{ formGroup: FormGroup, metadata: MetadataField[] }> {
    return this.http.get<{ [key: string]: MetadataField[] }>(`${this.apiUrl}/${modelName}`).pipe(
      map(response => {
        const metadata = response[modelName];
  
        if (!metadata) {
          throw new Error(`Metadata for model '${modelName}' not found.`);
        }
  
        let formGroup: { [key: string]: FormControl } = {};
        metadata.forEach(field => {
          const validators = this.createValidators(field);
          formGroup[field.name] = new FormControl('', validators);
        });
  
        return {
          formGroup: this.fb.group(formGroup),
          metadata: metadata // بازگرداندن متادیتا برای استفاده در کامپوننت
        };
      }),
      catchError(err => {
        console.error('Error fetching dynamic form metadata:', err);
        throw err;
      })
    );
  }
  private createValidators(field: MetadataField): ValidatorFn[] {
    const validators = [];
    
    if (field.required) {
      validators.push(Validators.required);
    }
    if (field.maxLength) {
      validators.push(Validators.maxLength(field.maxLength));
    }
    if (field.minLength) {
      validators.push(Validators.minLength(field.minLength));
    }

    return validators;
  }
}
