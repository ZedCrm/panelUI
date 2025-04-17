import { Component, Injector, OnInit } from '@angular/core';
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
  formModelName: string = '';
  tableModelName: string = '';
  dataService: any;

  pageNumber: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  fieldToSort: string = 'Id';
  sortDesc: boolean = false;

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
    const serviceToken = this.route.snapshot.data['dataService'];
    this.dataService = this.injector.get(serviceToken);

    this.formModelName = this.modelName + 'Create';
    this.tableModelName = this.modelName + 'View';

    this.loadMetadata();
    this.loadRecords();
  }

  loadMetadata(): void {
    this.getModalService.getMetadata(this.formModelName).subscribe({
      next: (metadata: MetadataField[]) => {
        this.formMetadata = metadata;
        this.initializeForm();
      },
      error: (err: any) => console.error('Error loading form metadata:', err),
    });

    this.getModalService.getMetadata(this.tableModelName).subscribe({
      next: (metadata: MetadataField[]) => {
        this.tableMetadata = metadata;
      },
      error: (err: any) => console.error('Error loading table metadata:', err),
    });
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
            console.error('Failed to fetch records:', response.message);
          }
        },
        error: (err: any) => console.error('Error fetching records:', err),
        complete: () => (this.isLoading = false),
      });
  }

  saveRecord(): void {
    if (this.dataForm.valid) {
      const newRecord = this.dataForm.value;
      this.dataService.insertRecord(newRecord).subscribe({
        next: (response: any) => {
          console.log('Record added successfully:', response.data);
          this.loadRecords();
          this.closePopup();
        },
        error: (err: any) => console.error('Error adding record:', err),
      });
    } else {
      console.error('Form is invalid');
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

  toggleSelection(recordId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedIds.push(recordId);
    } else {
      this.selectedIds = this.selectedIds.filter((id) => id !== recordId);
    }
  }

  deleteSelectedRecords(): void {
    if (this.selectedIds.length === 0) {
      alert('لطفاً حداقل یک مورد را انتخاب کنید!');
      return;
    }
    this.selectedIds.forEach((id) => {
      this.dataService.deleteRecord(id).subscribe({
        next: () => this.loadRecords(),
        error: (err: any) => console.error('خطا در حذف:', err),
      });
    });
    this.selectedIds = [];
  }

  openPopup(): void {
    this.isPopupVisible = true;
  }

  closePopup(): void {
    this.isPopupVisible = false;
  }
}
