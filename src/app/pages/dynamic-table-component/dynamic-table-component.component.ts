import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MetadataField } from '../../DTO/MetadataField';
import { ActivatedRoute } from '@angular/router';
import { GetModalService } from 'src/app/services/get-modal.service';
import { ToastMessageComponent } from "../../utilities/toast-message/toast-message.component";

/**
 * کامپوننت DynamicTableComponent - برای نمایش و مدیریت داده‌ها به صورت داینامیک
 * این کامپوننت قابلیت‌های زیر را ارائه می‌دهد:
 * - نمایش داده‌ها در جدول
 * - صفحه‌بندی
 * - مرتب‌سازی
 * - افزودن، ویرایش و حذف رکوردها
 * - نمایش فرم‌های داینامیک بر اساس متادیتا
 */
@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  templateUrl: './dynamic-table-component.component.html',
  styleUrls: ['./dynamic-table-component.component.css'],
  imports: [CommonModule, ReactiveFormsModule, ToastMessageComponent],
})
export class DynamicTableComponent implements OnInit {
  // نام مدل داده‌ای که باید نمایش داده شود
  modelName: string = '';
  
  // نام مدل برای فرم (معمولاً با پسوند Create به مدل اصلی اضافه می‌شود)
  formModelName: string = '';
  
  // نام مدل برای جدول (معمولاً با پسوند View به مدل اصلی اضافه می‌شود)
  tableModelName: string = '';
  
  // سرویس مربوط به مدل داده برای انجام عملیات CRUD
  dataService: any;

  // شناسه رکوردی که در حال ویرایش است (null به معنی حالت افزودن رکورد جدید)
  editId: number | null = null;

  // پارامترهای صفحه‌بندی
  pageNumber: number = 1;      // شماره صفحه فعلی
  pageSize: number = 5;        // تعداد رکوردها در هر صفحه
  totalPages: number = 1;      // تعداد کل صفحات
  fieldToSort: string = 'Id';  // فیلدی که بر اساس آن مرتب‌سازی انجام می‌شود
  sortDesc: boolean = false;   // جهت مرتب‌سازی (نزولی/صعودی)

  // پیام‌های toast
  toastMessage: string = '';           // متن پیام
  toastType: 'success' | 'error' = 'success'; // نوع پیام (موفقیت/خطا)

  // داده‌های جدول
  records: any[] = [];          // رکوردهای نمایش داده شده در جدول
  selectedIds: number[] = [];   // شناسه‌های رکوردهای انتخاب شده
  formMetadata: MetadataField[] = []; // متادیتای فیلدهای فرم
  tableMetadata: MetadataField[] = []; // متادیتای فیلدهای جدول

  // فرم داینامیک
  dataForm: FormGroup = new FormGroup({});
  
  // وضعیت‌های مختلف
  isLoading: boolean = false;    // در حال بارگذاری داده‌ها
  isPopupVisible: boolean = false; // وضعیت نمایش پاپ‌آپ فرم

  constructor(
    private fb: FormBuilder,          // برای ایجاد فرم‌های واکنش‌گرا
    private route: ActivatedRoute,    // برای دسترسی به پارامترهای مسیر
    private injector: Injector,       // برای تزریق سرویس‌های داینامیک
    private getModalService: GetModalService, // سرویس دریافت متادیتا
  ) {}

  /**
   * متد ngOnInit - زمانی که کامپوننت مقداردهی اولیه می‌شود اجرا می‌شود
   * این متد موارد زیر را انجام می‌دهد:
   * - دریافت نام مدل از route
   * - ایجاد نام مدل‌های فرم و جدول
   * - دریافت سرویس مربوط به مدل
   * - بارگذاری متادیتا و داده‌ها
   */
  ngOnInit(): void {
    // دریافت نام مدل از route
    this.modelName = this.route.snapshot.data['modelName'];
    console.log('Model name:', this.modelName);
  
    // دریافت سرویس مربوط به مدل از طریق injector
    const serviceToken = this.route.snapshot.data['dataService'];
    this.dataService = this.injector.get(serviceToken);
  
    // ایجاد نام مدل‌های فرم و جدول
    this.formModelName = this.modelName + 'Create';
    console.log('Form model name:', this.formModelName);
    this.tableModelName = this.modelName + 'View';
  
    // بارگذاری متادیتا، گزینه‌های select و داده‌ها
    this.loadMetadata();
    this.loadSelectOptions();
    this.loadRecords();
  }

  /**
   * بارگذاری متادیتای فرم و جدول از سرور
   */
  loadMetadata(): void {
    // دریافت متادیتای فرم
    this.getModalService.getMetadata(this.formModelName).subscribe({
      next: (metadata: MetadataField[]) => {
        this.formMetadata = metadata;
        this.initializeForm(); // مقداردهی اولیه فرم بر اساس متادیتا
        this.loadSelectOptions(); // بارگذاری گزینه‌های select
      },
      error: (err: any) => {
        console.error('Error loading form metadata:', err);
        this.showToast('خطا در بارگذاری فرم!', 'error');
      },
    });

    // دریافت متادیتای جدول
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

  /**
   * دریافت یک رکورد بر اساس شناسه و نمایش آن در فرم برای ویرایش
   * @param id شناسه رکوردی که باید ویرایش شود
   */
  getRecordById(id: number): void {
    this.dataService.getRecordById(id).subscribe({
      next: (response: any) => {
        if (response.isSucceeded) {
          const record = response.singleData;
          this.dataForm.patchValue(record); // پر کردن فرم با مقادیر رکورد
          this.editId = id; // ذخیره شناسه برای حالت ویرایش
          this.openPopup(); // نمایش فرم در پاپ‌آپ
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
  
  /**
   * بروزرسانی یک رکورد موجود
   */
  updateRecord(): void {
    if (this.dataForm.valid) {
      const updatedRecord = this.dataForm.value;
      this.dataService.updateRecord(updatedRecord).subscribe({
        next: (response: any) => {
          const message = response?.message || 'پاسخی از سرور دریافت نشد';
          const isSucceeded = response?.isSucceeded ?? false;

          this.showToast(message, isSucceeded ? 'success' : 'error');
          if (isSucceeded) {
            this.loadRecords(); // بارگذاری مجدد داده‌ها
            this.closePopup(); // بستن پاپ‌آپ
            this.dataForm.reset(); // ریست فرم
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

  /**
   * مقداردهی اولیه فرم بر اساس متادیتا
   */
  initializeForm(): void {
    const formControls: any = {};
    // ایجاد کنترل‌های فرم برای هر فیلد متادیتا
    this.formMetadata.forEach((field) => {
      formControls[field.name] = [''];
    });
    this.dataForm = this.fb.group(formControls);
  }

  /**
   * بارگذاری رکوردها از سرور با اعمال پارامترهای صفحه‌بندی و مرتب‌سازی
   */
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

  /**
   * ذخیره رکورد - برای هر دو حالت افزودن جدید و ویرایش موجود
   */
  saveRecord(): void {
    if (this.dataForm.valid) {
      const record = this.dataForm.value;
  
      if (this.editId !== null) {
        // حالت ویرایش رکورد موجود
        record.id = this.editId;
        this.dataService.updateRecord(record).subscribe({
          next: (response: any) => {
            const message = response?.message || 'پاسخی از سرور دریافت نشد';
            const isSucceeded = response?.isSucceeded ?? false;
  
            this.showToast(message, isSucceeded ? 'success' : 'error');
            if (isSucceeded) {
              this.loadRecords();
              this.closePopup();
              this.dataForm.reset();
              this.editId = null; // خروج از حالت ویرایش
            }
          },
          error: (err: any) => {
            console.error('خطا در ویرایش رکورد:', err);
            this.showToast('خطا در ویرایش اطلاعات', 'error');
          },
        });
      } else {
        // حالت افزودن رکورد جدید
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
  
            // مدیریت خطاهای اعتبارسنجی
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
  
  /**
   * حذف رکوردهای انتخاب شده
   * @param ids آرایه شناسه‌های رکوردهایی که باید حذف شوند
   */
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
          this.loadRecords(); // بارگذاری مجدد داده‌ها
          this.selectedIds = []; // پاک کردن لیست انتخاب‌ها
        }
      },
      error: (err: any) => {
        console.error('خطا در حذف:', err);
        this.showToast('خطا در حذف اطلاعات', 'error');
      }
    });
  }
  
  /**
   * تغییر وضعیت انتخاب یک رکورد
   * @param recordId شناسه رکورد
   * @param event رویداد تغییر وضعیت checkbox
   */
  toggleSelection(recordId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedIds.push(recordId);
    } else {
      this.selectedIds = this.selectedIds.filter((id) => id !== recordId);
    }
  }

  /**
   * تغییر فیلد و جهت مرتب‌سازی
   * @param column نام فیلدی که باید بر اساس آن مرتب‌سازی انجام شود
   */
  changeSort(column: string): void {
    this.sortDesc = this.fieldToSort === column ? !this.sortDesc : false;
    this.fieldToSort = column;
    this.loadRecords(); // بارگذاری مجدد داده‌ها با مرتب‌سازی جدید
  }

  /**
   * تغییر صفحه
   * @param newPage شماره صفحه جدید
   */
  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNumber = newPage;
      this.loadRecords(); // بارگذاری داده‌های صفحه جدید
    }
  }

  /**
   * نمایش پاپ‌آپ فرم
   */
  openPopup(): void {
    this.isPopupVisible = true;
  }

  /**
   * بستن پاپ‌آپ فرم
   */
  closePopup(): void {
    this.isPopupVisible = false;
    this.editId = null; // خروج از حالت ویرایش
  }

  /**
   * نمایش پیام toast
   * @param message متن پیام
   * @param type نوع پیام (success/error)
   */
  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }

  // ذخیره گزینه‌های select برای فیلدهای فرم
  selectOptions: { [key: string]: any[] } = {};

  /**
   * بارگذاری گزینه‌های select برای فیلدهای فرم
   */
  loadSelectOptions(): void {
    console.log('Loading select options...');
    console.log('Form metadata:', this.formMetadata);
  
    this.formMetadata.forEach(field => {
      if (field.controlType === 'select' && field.selectSource) {
        console.log(`Fetching options for ${field.name} from ${field.selectSource}`);
        
        this.dataService.getSelectOptions(field.selectSource).subscribe({
          next: (data: any[]) => {
            console.log('Received options for', field.name, ':', data);
            this.selectOptions[field.name] = data;
          },
          error: (err: any) => {
            console.error(`Error loading options for ${field.name}:`, err);
            this.selectOptions[field.name] = [];
          }
        });
      }
    });
  }
}