import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';

export interface MetadataField {
  name: string;
  type: string;
  required: boolean;
  maxLength?: number;
  minLength?: number;
  displayName?: string;
  label?: string; 
}

@Injectable({
  providedIn: 'root',
})
export class GetModalService {
  private apiUrl = 'http://141.11.37.220:90/api/Metadata/GetModelMetadata';

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  /** دریافت متادیتا از API */
  getMetadata(modelName: string): Observable<MetadataField[]> {
    return this.http.get<{ [key: string]: MetadataField[] }>(`${this.apiUrl}/${modelName}`).pipe(
      map(response => {
        const metadata = response[modelName];
        if (!metadata) {
          throw new Error(`Metadata for model '${modelName}' not found.`);
        }
        return metadata;
      }),
      catchError(err => {
        console.error('Error fetching metadata:', err);
        throw err;
      })
    );
  }

  /** ساخت فرم بر اساس متادیتا */
  createForm(metadata: MetadataField[]): FormGroup {
    let formGroup: { [key: string]: FormControl } = {};

    metadata.forEach(field => {
      const validators = this.createValidators(field);
      formGroup[field.name] = new FormControl('', validators);
    });

    return this.fb.group(formGroup);
  }

  /** ایجاد ولیدیشن‌ها بر اساس متادیتا */
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
