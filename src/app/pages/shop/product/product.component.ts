import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/shop/product.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetadataField } from '../../../DTO/MetadataField';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ProductComponent implements OnInit {
  // پارامترها
  pageNumber: number = 1;
  pageSize: number = 5;
  fieldToSort: string = "Id";
  sortDesc: boolean = true;
  products: any[] = [];
  selectedProductIds: number[] = [];
  formMetadata: MetadataField[] = []; 
  tableMetadata: MetadataField[] = [];
  productForm: FormGroup = new FormGroup({});
  isLoading: boolean = true;
  isPopupVisible: boolean = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadFormMetadata('ProductCreate');
    this.loadTableMetadata('ProductView');
    this.loadProducts();
  }



  getInputType(fieldType: string): string {
    switch (fieldType.toLowerCase()) {
      case 'number':
      case 'int':
      case 'float':
        return 'number';
      case 'email':
        return 'email';
      case 'password':
        return 'password';
      default:
        return 'text';
    }
  }

  initializeProductForm(): void {
    const controls: { [key: string]: any } = {};
  
    this.formMetadata.forEach(field => {
      const validators = [];
      if (field.required) validators.push(Validators.required);
      if (field.maxLength) validators.push(Validators.maxLength(field.maxLength));
      if (field.minLength) validators.push(Validators.minLength(field.minLength));
  
      controls[field.name] = new FormControl('', validators);
    });
  
    this.productForm = new FormGroup(controls);
  }


  /** دریافت متادیتای فرم */
  loadFormMetadata(modelName: string): void {
    this.productService.getModelMetadata(modelName).subscribe({
      next: (metadata) => {
        this.formMetadata = metadata;
        this.initializeProductForm(); // ⚠️ این خط جدید اضافه شد
        console.log('Form Metadata loaded:', this.formMetadata);
      },
      error: (err) => console.error('Error loading form metadata:', err),
    });
  }
  

  
  /** دریافت متادیتای جدول */
  loadTableMetadata(modelName: string): void {
    this.productService.getModelMetadata(modelName).subscribe({
      next: (metadata) => {
        this.tableMetadata = metadata; 
        console.log('Table Metadata loaded:', this.tableMetadata);
      },
      error: (err) => console.error('Error loading table metadata:', err),
    });
  }

  /** دریافت لیست محصولات */
  loadProducts(): void {
    this.isLoading = true;
    this.productService.getRecords(this.pageNumber, this.pageSize, this.fieldToSort, this.sortDesc).subscribe({
      next: (response) => {
        if (response.isSucceeded) {
          this.products = response.data || [];
          console.log('Products loaded:', this.products);
        } else {
          console.error('Failed to fetch products:', response.message);
        }
      },
      error: (err) => console.error('Error fetching products:', err),
      complete: () => { this.isLoading = false; },
    });
  }

  /** ذخیره محصول جدید */
  saveProduct(): void {
    if (this.productForm.valid) {
      const newProduct = this.productForm.value;
      this.productService.insertRecord(newProduct).subscribe({
        next: (response) => {
          console.log('Product added successfully:', response.data);
          this.products.push(newProduct);
          this.closePopup();
        },
        error: (err) => console.error('Error adding product:', err),
      });
    } else {
      console.error('Form is invalid');
    }
  }

  /** باز کردن و بستن پاپ‌آپ */
  openPopup(): void { this.isPopupVisible = true; }
  closePopup(): void { this.isPopupVisible = false; }

  /** تغییر صفحه */
  ChangePage(nextPageNumber: number): void {
    this.pageNumber = nextPageNumber;
    this.loadProducts();
  }

  /** تغییر تعداد آیتم‌های صفحه */
  ChangePageSize(event: any): void {
    this.pageSize = parseInt(event.target.value, 10);
    this.loadProducts();
  }

  /** تغییر ترتیب نمایش */
  changeSort(column: string): void {
    this.sortDesc = this.fieldToSort === column ? !this.sortDesc : false;
    this.fieldToSort = column;
    this.loadProducts();
  }

  /** انتخاب/عدم انتخاب محصول */
  toggleSelection(productId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedProductIds.push(productId);
    } else {
      this.selectedProductIds = this.selectedProductIds.filter(id => id !== productId);
    }
  }

  /** حذف محصولات انتخاب‌شده */
  deleteSelectedProducts(): void {
    if (this.selectedProductIds.length === 0) {
      alert('لطفاً حداقل یک محصول را انتخاب کنید!');
      return;
    }
    this.selectedProductIds.forEach(id => {
      this.productService.deleteRecord(id).subscribe({
        next: () => this.loadProducts(),
        error: (err) => console.error('خطا در حذف محصول:', err),
      });
    });
    this.selectedProductIds = [];
  }
}
