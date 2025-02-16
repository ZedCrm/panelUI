import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/shop/product.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GetModalService, MetadataField } from '../../../services/get-modal.service'; // Import MetadataField

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ProductComponent implements OnInit {
  pageNumber: number = 1;
  pageSize: number = 2;
  objectKeys = Object.keys;
  fieldToSort: string = "Id";
  sortDesc: boolean = true;

  products: any[] = [];
  selectedProductIds: number[] = [];
  metadata: MetadataField[] = []; // تغییر نوع متادیتا به آرایه‌ای از MetadataField
  public productForm: FormGroup = new FormGroup({}); // Initialize with an empty FormGroup
  isLoading: boolean = true;
  isPopupVisible: boolean = false;

  constructor(
    private getModalService: GetModalService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadMetadata('ProductView');
    this.loadProducts();
  }

  loadMetadata(modelName: string): void {
    this.getModalService.getDynamicForm(modelName).subscribe({
      next: (response) => {
        if (response.metadata && response.metadata.length > 0) {
          this.metadata = response.metadata; // ذخیره متادیتا
          this.productForm = response.formGroup; // ذخیره فرم
          console.log('Metadata loaded:', this.metadata);
        } else {
          console.error('Metadata is empty or not loaded correctly.');
        }
      },
      error: (err) => console.error('Error loading metadata:', err),
    });
  }

  openPopup(): void {
    this.isPopupVisible = true;
  }

  closePopup(): void {
    this.isPopupVisible = false;
  }

  saveProduct(): void {
    if (this.productForm.valid) {
      const newProduct = this.productForm.value;
      this.productService.insertProduct(newProduct).subscribe({
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
<<<<<<< HEAD

  loadProducts(): void {
    this.isLoading = true;
    this.productService.GetData(this.pageNumber, this.pageSize, this.fieldToSort, this.sortDesc).subscribe({
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

  ChangePage(nextPageNumber: number): void {
    this.pageNumber = nextPageNumber;
    this.loadProducts();
  }

  ChangePageSize(event: any): void {
    this.pageSize = parseInt(event.target.value, 10);
    this.loadProducts();
  }

  changeSort(column: string): void {
    this.sortDesc = this.fieldToSort === column ? !this.sortDesc : false;
    this.fieldToSort = column;
    this.loadProducts();
  }

  toggleSelection(productId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedProductIds.push(productId);
=======
  
 loadProducts(): void {  
  
  
  this.productservice.GetData(this.pageNumber, this.pageSize, this.fieldToSort, 
                                this.sortDesc).subscribe({
  next: (response) => {
    if (response.isSucceeded) {
      
      this.responseData = response;
>>>>>>> b40afab (form pagination complate2)
    } else {
      this.selectedProductIds = this.selectedProductIds.filter(id => id !== productId);
    }
  }

  deleteSelectedProducts(): void {
    if (this.selectedProductIds.length === 0) {
      alert('لطفاً حداقل یک محصول را انتخاب کنید!');
      return;
    }
    this.selectedProductIds.forEach(id => {
      this.productService.deleteProducts(id).subscribe({
        next: () => this.loadProducts(),
        error: (err) => console.error('خطا در حذف محصول:', err),
      });
    });
    this.selectedProductIds = [];
  }



  getInputType(fieldType: string): string {
    switch (fieldType.toLowerCase()) {
      case 'int32':
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'boolean':
        return 'checkbox';
      default:
        return 'text';
    }
  }
}