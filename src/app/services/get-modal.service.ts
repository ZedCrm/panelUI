import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { SelectDataService } from './select-data.service';

export interface MetadataField {
  name: string;
  type: string;
  label?: string;
  controlType?: string;
  selectSource?: string;
  required?: boolean;
  minLength?: number;
  inputType: 'text' | 'number' | 'boolean';
  maxLength?: number;
  options?: any[];
  displayName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GetModalService {
  private apiUrl = '/api/Metadata/GetModelMetadata';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private selectDataService: SelectDataService
  ) {}

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
        return of([]); // جلوگیری از قطع شدن برنامه
      })
    );
  }

  /** ساخت فرم براساس متادیتا */
  createForm(metadata: MetadataField[]): FormGroup {
    const formGroup: { [key: string]: FormControl } = {};

    metadata.forEach(field => {
      const validators = this.createValidators(field);
      let defaultValue: any = '';

      if (field.controlType === 'select') {
        defaultValue = null;
      } else if (field.inputType === 'boolean') {
        defaultValue = false;
      } else if (field.inputType === 'number') {
        defaultValue = null;
      }

      formGroup[field.name] = new FormControl(defaultValue, validators);
    });

    return this.fb.group(formGroup);
  }

  /** ساخت ولیداتورهای فرم */
  private createValidators(field: MetadataField): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (field.required) {
      validators.push(Validators.required);
    }
    if (field.minLength) {
      validators.push(Validators.minLength(field.minLength));
    }
    if (field.maxLength) {
      validators.push(Validators.maxLength(field.maxLength));
    }

    return validators;
  }

  /** بارگذاری آپشن‌های Select */
  loadSelectOptions(metadata: MetadataField[]): void {
    metadata.forEach(field => {
      if (field.controlType === 'select' && field.selectSource) {
        this.selectDataService.getSelectOptions(field.selectSource).subscribe({
          next: options => {
            field.options = options;
          },
          error: err => {
            console.error(`خطا در بارگذاری آپشن‌های ${field.name}:`, err);
          }
        });
      }
    });
  }
}
