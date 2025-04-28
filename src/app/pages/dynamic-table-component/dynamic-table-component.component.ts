import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MetadataField } from '../../DTO/MetadataField';
import { ActivatedRoute } from '@angular/router';
import { GetModalService } from 'src/app/services/get-modal.service';
import { ToastMessageComponent } from "../../utilities/toast-message/toast-message.component";
import { SelectDataService } from 'src/app/services/select-data.service'; 
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FilterPipe } from "../../pipes/filter.pipe";

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  templateUrl: './dynamic-table-component.component.html',
  styleUrls: ['./dynamic-table-component.component.css'],
  imports: [CommonModule, ReactiveFormsModule, ToastMessageComponent, NgxMatSelectSearchModule, MatFormFieldModule,
    MatSelectModule, MatOptionModule, NgxMatSelectSearchModule, FilterPipe, MatSelectModule ],
})
export class DynamicTableComponent implements OnInit {
  selectOptions: { [key: string]: any[] } = {};
  searchControl: FormControl = new FormControl(''); 
  
  modelName = '';
  formModelName = '';
  tableModelName = '';
  dataService: any;
  selectDataService: SelectDataService; // اضافه کردن سرویس selectDataService
  editId: number | null = null;

  pageNumber = 1;
  pageSize = 5;
  totalPages = 1;
  fieldToSort = 'Id';
  sortDesc = false;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  records: any[] = [];
  selectedIds: number[] = [];
  formMetadata: MetadataField[] = [];
  tableMetadata: MetadataField[] = [];

  dataForm: FormGroup = new FormGroup({});
  


  isLoading = false;
  isPopupVisible = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private injector: Injector,
    private getModalService: GetModalService,
    selectDataService: SelectDataService, // وارد کردن سرویس selectDataService
  ) {
    this.selectDataService = selectDataService;
  }

  ngOnInit(): void {
    this.modelName = this.route.snapshot.data['modelName'];
    const serviceToken = this.route.snapshot.data['dataService'];
    this.dataService = this.injector.get(serviceToken);

    this.formModelName = this.modelName + 'Create';
    this.tableModelName = this.modelName + 'View';

    this.loadMetadata();
    this.loadRecords();
  }

  loadMetadata(): void {
    this.getModalService.getMetadata(this.formModelName).subscribe({
      next: (metadata) => {
        this.formMetadata = metadata;
        this.initializeForm();
        this.loadSelectOptions(); // فراخوانی متد لود گزینه‌های select پس از بارگذاری متادیتا
      },
      error: (err) => {
        console.error('Error loading form metadata:', err);
        this.showToast('خطا در بارگذاری فرم!', 'error');
      },
    });

    this.getModalService.getMetadata(this.tableModelName).subscribe({
      next: (metadata) => {
        this.tableMetadata = metadata;
      },
      error: (err) => {
        console.error('Error loading table metadata:', err);
        this.showToast('خطا در بارگذاری جدول!', 'error');
      },
    });
  }

  initializeForm(): void {
    const formControls: any = {};
    this.formMetadata.forEach((field) => {
      formControls[field.name] = [''];
    });
    this.dataForm = this.fb.group(formControls);
  }

  loadSelectOptions(): void {
    // بارگذاری گزینه‌ها برای فیلدهای select
    this.formMetadata.forEach((field) => {
      if (field.controlType === 'select' && field.selectSource) {
        this.selectDataService.getSelectOptions(field.selectSource).subscribe({
          next: (options) => {
            const realOptions = options?.result?.data ?? [];
            this.selectOptions[field.name] = realOptions.map((opt: any) => ({
              id: opt.id,
              name: opt.name
            }));
          },
          error: (err) => {
            console.error(`خطا در لود گزینه‌های ${field.name}`, err);
            this.selectOptions[field.name] = [];
          }
        });
      }
    });
  }

  loadRecords(): void {
    this.isLoading = true;
    this.dataService.getRecords(this.pageNumber, this.pageSize, this.fieldToSort, this.sortDesc).subscribe({
      next: (response: any) => {
        if (response.isSucceeded) {
          this.records = response.data;
          this.totalPages = response.totalPages || 1;
        } else {
          this.showToast(response.message, 'error');
        }
      },
      error: (err:[]) => {
        console.error('Error fetching records:', err);
        this.showToast('خطا در دریافت اطلاعات', 'error');
      },
      complete: () => (this.isLoading = false),
    });
  }

  getRecordById(id: number): void {
    this.dataService.getRecordById(id).subscribe({
      next: (response: any) => {
        if (response.isSucceeded) {
          this.dataForm.patchValue(response.singleData);
          this.editId = id;
          this.openPopup();
        } else {
          this.showToast(response.message, 'error');
        }
      },
      error: (err:any[]) => {
        console.error('خطا در دریافت رکورد:', err);
        this.showToast('خطا در دریافت اطلاعات', 'error');
      },
    });
  }

  saveRecord(): void {
    if (!this.dataForm.valid) {
      this.showToast('فرم معتبر نیست', 'error');
      return;
    }

    const record = this.dataForm.value;

    if (this.editId !== null) {
      record.id = this.editId;
      this.dataService.updateRecord(record).subscribe(this.getSaveResponseHandler());
    } else {
      this.dataService.insertRecord(record).subscribe(this.getSaveResponseHandler());
    }
  }

  updateRecord(): void {
    if (this.dataForm.valid) {
      const updatedRecord = this.dataForm.value;
      this.dataService.updateRecord(updatedRecord).subscribe(this.getSaveResponseHandler());
    } else {
      this.showToast('فرم معتبر نیست', 'error');
    }
  }

  deleteSelectedRecords(ids: number[]): void {
    if (ids.length === 0) {
      this.showToast('لطفاً حداقل یک مورد را انتخاب کنید!', 'error');
      return;
    }

    this.dataService.deleteRecords(ids).subscribe({
      next: (response: any) => {
        this.showToast(response?.message || 'پاسخی از سرور دریافت نشد', response?.isSucceeded ? 'success' : 'error');
        if (response.isSucceeded) {
          this.loadRecords();
          this.selectedIds = [];
        }
      },
      error: (err:any[]) => {
        console.error('خطا در حذف:', err);
        this.showToast('خطا در حذف اطلاعات', 'error');
      },
    });
  }

  toggleSelection(recordId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedIds.push(recordId);
    } else {
      this.selectedIds = this.selectedIds.filter(id => id !== recordId);
    }
  }

  changeSort(column: string): void {
    this.sortDesc = this.fieldToSort === column ? !this.sortDesc : false;
    this.fieldToSort = column;
    this.loadRecords();
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNumber = newPage;
      this.loadRecords();
    }
  }

  openPopup(): void {
    this.isPopupVisible = true;
  }

  closePopup(): void {
    this.isPopupVisible = false;
    this.editId = null;
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }

  private getSaveResponseHandler() {
    return {
      next: (response: any) => {
        const message = response?.message || 'پاسخی از سرور دریافت نشد';
        const isSucceeded = response?.isSucceeded ?? false;

        this.showToast(message, isSucceeded ? 'success' : 'error');
        if (isSucceeded) {
          this.loadRecords();
          this.closePopup();
          this.dataForm.reset();
          this.editId = null;
        }
      },
      error: (err: any) => {
        console.error('خطا در ذخیره:', err);

        if (err.status === 400 && err.error?.errors) {
          const messages = Object.values(err.error.errors).flat();
          messages.forEach(msg => {
            this.showToast(msg as string, 'error');
          });
        } else if (err.error?.message) {
          this.showToast(err.error.message, 'error');
        } else {
          this.showToast('خطایی رخ داده است.', 'error');
        }
      }
    };
  }
}
