import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MetadataField } from '../../DTO/MetadataField';
import { ActivatedRoute } from '@angular/router';
import { GetModalService } from 'src/app/services/get-modal.service';
import { ToastMessageComponent } from "../../utilities/toast-message/toast-message.component";


@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  templateUrl: './dynamic-table-component.component.html',
  styleUrls: ['./dynamic-table-component.component.css'],
  imports: [CommonModule, ReactiveFormsModule, ToastMessageComponent],
})
export class DynamicTableComponent implements OnInit {
  modelName: string = '';
  formModelName: string = '';
  tableModelName: string = '';
  dataService: any;

  editId: number | null = null;

  pageNumber: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  fieldToSort: string = 'Id';
  sortDesc: boolean = false;

  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  records: any[] = [];
  selectedIds: number[] = [];
  formMetadata: MetadataField[] = [];
  tableMetadata: MetadataField[] = [];

  dataForm: FormGroup = new FormGroup({});
  isLoading: boolean = false;
  isPopupVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private injector: Injector,
    private getModalService: GetModalService,
  ) {}

  ngOnInit(): void {
    this.modelName = this.route.snapshot.data['modelName'];
    console.log('Model name:', this.modelName); // لاگ برای بررسی مقدار مدل
  
    const serviceToken = this.route.snapshot.data['dataService'];
    this.dataService = this.injector.get(serviceToken);
  
    this.formModelName = this.modelName + 'Create';
    console.log('Form model name:', this.formModelName); // لاگ برای بررسی مدل فرم
  
    this.tableModelName = this.modelName + 'View';
  
    this.loadMetadata();
    this.loadSelectOptions();
    this.loadRecords();
  }

  loadMetadata(): void {
    this.getModalService.getMetadata(this.formModelName).subscribe({
      next: (metadata: MetadataField[]) => {
        this.formMetadata = metadata;
        this.initializeForm();
        this.loadSelectOptions(); // Ensure select options are loaded after metadata is populated
      },
      error: (err: any) => {
        console.error('Error loading form metadata:', err);
        this.showToast('خطا در بارگذاری فرم!', 'error');
      },
    });

    this.getModalService.getMetadata(this.tableModelName).subscribe({
      next: (metadata: MetadataField[]) => {
        this.tableMetadata = metadata;
      },
      error: (err: any) => {
        console.error('Error loading table metadata:', err);
        this.showToast('خطا در بارگذاری جدول!', 'error');
      },
    });
  }

  /**get by id and pop up form for update with old data */
  getRecordById(id: number): void {
    this.dataService.getRecordById(id).subscribe({
      next: (response: any) => {
        if (response.isSucceeded) {
          const record = response.singleData;
          this.dataForm.patchValue(record);
          this.editId = id; // ✅ ثبت آیدی برای آپدیت
          this.openPopup();
        } else {
          this.showToast(response.message, 'error');
        }
      },
      error: (err: any) => {
        console.error('خطا در دریافت رکورد:', err);
        this.showToast('خطا در دریافت اطلاعات', 'error');
      },
    });
  }
  

  /**update record   */
  updateRecord(): void {
    if (this.dataForm.valid) {
      const updatedRecord = this.dataForm.value;
      this.dataService.updateRecord(updatedRecord).subscribe({
        next: (response: any) => {
          const message = response?.message || 'پاسخی از سرور دریافت نشد';
          const isSucceeded = response?.isSucceeded ?? false;

          this.showToast(message, isSucceeded ? 'success' : 'error');
          if (isSucceeded) {
            this.loadRecords();
            this.closePopup();
            this.dataForm.reset();
          }
        },
        error: (err: any) => {
          console.error('خطا در ویرایش رکورد:', err);
          this.showToast('خطا در ویرایش اطلاعات', 'error');
        },
      });
    } else {
      this.showToast('فرم معتبر نیست', 'error');
    }



  }
    


  initializeForm(): void {
    const formControls: any = {};
    this.formMetadata.forEach((field) => {
      formControls[field.name] = [''];
    });
    this.dataForm = this.fb.group(formControls);
  }

  loadRecords(): void {
    this.isLoading = true;
    this.dataService
      .getRecords(this.pageNumber, this.pageSize, this.fieldToSort, this.sortDesc)
      .subscribe({
        next: (response: any) => {
          if (response.isSucceeded) {
            this.records = response.data;
            this.totalPages = response.totalPages || 1;
          } else {
            this.showToast(response.message, 'error');
          }
        },
        error: (err: any) => {
          console.error('Error fetching records:', err);
          this.showToast('خطا در دریافت اطلاعات', 'error');
        },
        complete: () => (this.isLoading = false),
      });
  }

  saveRecord(): void {
    if (this.dataForm.valid) {
      const record = this.dataForm.value;
  
      if (this.editId !== null) {
        // حالت ویرایش
        record.id = this.editId; // آیدی را به مدل بده
        this.dataService.updateRecord(record).subscribe({
          next: (response: any) => {
            const message = response?.message || 'پاسخی از سرور دریافت نشد';
            const isSucceeded = response?.isSucceeded ?? false;
  
            this.showToast(message, isSucceeded ? 'success' : 'error');
            if (isSucceeded) {
              this.loadRecords();
              this.closePopup();
              this.dataForm.reset();
              this.editId = null; // حالت ویرایش ریست شود
            }
          },
          error: (err: any) => {
            console.error('خطا در ویرایش رکورد:', err);
            this.showToast('خطا در ویرایش اطلاعات', 'error');
          },
        });
      } else {
        // حالت افزودن جدید
        this.dataService.insertRecord(record).subscribe({
          next: (response: any) => {
            const message = response?.message || 'پاسخی از سرور دریافت نشد';
            const isSucceeded = response?.isSucceeded ?? false;
  
            this.showToast(message, isSucceeded ? 'success' : 'error');
            if (isSucceeded) {
              this.loadRecords();
              this.closePopup();
              this.dataForm.reset();
            }
          },
          error: (err: any) => {
            console.error('خطا در افزودن رکورد:', err);
  
            if (err.status === 400 && err.error && err.error.errors) {
              const allErrors = err.error.errors;
              const messages = Object.values(allErrors).flat();
  
              messages.forEach(msg => {
                this.toastMessage = msg as string;
                this.toastType = 'error';
                setTimeout(() => this.toastMessage = '', 3000);
              });
            } else if (err.error?.message) {
              this.toastMessage = err.error.message;
              this.toastType = 'error';
            } else {
              this.toastMessage = 'خطایی رخ داده است.';
              this.toastType = 'error';
            }
          }
        });
      }
  
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
        console.log('response:', response); 
        const message = response?.message || 'پاسخی از سرور دریافت نشد';
        const isSucceeded = response?.isSucceeded ?? false;
  
        this.showToast(message, isSucceeded ? 'success' : 'error');
        if (isSucceeded) {
          this.loadRecords();
          this.selectedIds = [];
        }
      },
      error: (err: any) => {
        console.error('خطا در حذف:', err);
        this.showToast('خطا در حذف اطلاعات', 'error');
      }
    });
  }
  
  toggleSelection(recordId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedIds.push(recordId);
    } else {
      this.selectedIds = this.selectedIds.filter((id) => id !== recordId);
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

  selectOptions: { [key: string]: any[] } = {};

  loadSelectOptions(): void {
    console.log('Loading select options...');
    console.log('Form metadata:', this.formMetadata); // لاگ برای بررسی داده‌ها
  
    this.formMetadata.forEach(field => {
      if (field.controlType === 'select' && field.selectSource) {
        this.dataService.getSelectOptions(field.selectSource).subscribe((data: any[]) => {
          console.log('Select options for', field.name, ':', data); // 👀 این خط رو اضافه کن
          this.selectOptions[field.name] = data;
        });
      }
    });
  }
  



  
}
