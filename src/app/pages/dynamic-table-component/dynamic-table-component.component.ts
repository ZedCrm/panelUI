import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MetadataField } from '../../DTO/MetadataField';
import { ActivatedRoute } from '@angular/router';
import { GetModalService } from 'src/app/services/get-modal.service';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  templateUrl: './dynamic-table-component.component.html',
  styleUrls: ['./dynamic-table-component.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class DynamicTableComponent implements OnInit {
  modelName: string = ''; 
  dataService: any; 

  pageNumber: number = 1;
  pageSize: number = 5;
  fieldToSort: string = 'Id';
  sortDesc: boolean = true;
  records: any[] = [];
  selectedIds: number[] = [];
  formMetadata: MetadataField[] = [];
  tableMetadata: MetadataField[] = [];
  dataForm: FormGroup = new FormGroup({});
  isLoading: boolean = true;
  isPopupVisible: boolean = false;

  constructor(private fb: FormBuilder ,
    private route: ActivatedRoute ,
     private getModalService : GetModalService 
  ) {}

  ngOnInit(): void {
    this.modelName = this.route.snapshot.data['modelName'];
    this.dataService = this.route.snapshot.data['dataService'];

    console.log('DynamicTableComponent Initialized');
    console.log('modelName:', this.modelName);
    console.log('dataService:', this.dataService);

    if (!this.modelName || !this.dataService) {
      console.error('modelName یا dataService مقداردهی نشده است.');
      return;
    }

    this.loadMetadata();
    this.loadRecords();
  
  }

  /** دریافت متادیتای مدل */
  loadMetadata(): void {
    this.getModalService.getMetadata(this.modelName).subscribe({
      next: (metadata: MetadataField[]) => {
        this.formMetadata = metadata;
        this.tableMetadata = metadata;
        this.initializeForm();
      },
      error: (err: any) => console.error('Error loading metadata:', err),
    });
  }

  /** مقداردهی اولیه فرم */
  initializeForm(): void {
    let formControls: any = {};
    this.formMetadata.forEach(field => {
      formControls[field.name] = [''];
    });
    this.dataForm = this.fb.group(formControls);
  }

  /** دریافت لیست رکوردها */
  loadRecords(): void {
    this.isLoading = true;
    this.dataService.getRecords(this.pageNumber, this.pageSize, this.fieldToSort, this.sortDesc).subscribe({
      next: (response: any) => {
        if (response.isSucceeded) {
          this.records = response.data || [];
        } else {
          console.error('Failed to fetch records:', response.message);
        }
      },
      error: (err: any) => console.error('Error fetching records:', err),
      complete: () => (this.isLoading = false),
    });
  }

  /** ذخیره یک رکورد جدید */
  saveRecord(): void {
    if (this.dataForm.valid) {
      const newRecord = this.dataForm.value;
      this.dataService.insertRecord(newRecord).subscribe({
        next: (response: any) => {
          console.log('Record added successfully:', response.data);
          this.records.push(newRecord);
          this.closePopup();
        },
        error: (err: any) => console.error('Error adding record:', err),
      });
    } else {
      console.error('Form is invalid');
    }
  }

  /** تغییر ترتیب */
  changeSort(column: string): void {
    this.sortDesc = this.fieldToSort === column ? !this.sortDesc : false;
    this.fieldToSort = column;
    this.loadRecords();
  }

  /** انتخاب/عدم انتخاب رکورد */
  toggleSelection(recordId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedIds.push(recordId);
    } else {
      this.selectedIds = this.selectedIds.filter(id => id !== recordId);
    }
  }

  /** حذف رکوردهای انتخاب‌شده */
  deleteSelectedRecords(): void {
    if (this.selectedIds.length === 0) {
      alert('لطفاً حداقل یک مورد را انتخاب کنید!');
      return;
    }
    this.selectedIds.forEach(id => {
      this.dataService.deleteRecord(id).subscribe({
        next: () => this.loadRecords(),
        error: (err: any) => console.error('خطا در حذف:', err),
      });
    });
    this.selectedIds = [];
  }

  /** باز کردن و بستن پاپ‌آپ */
  openPopup(): void {
    this.isPopupVisible = true;
  }
  closePopup(): void {
    this.isPopupVisible = false;
  }
}
