import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-addproduct',
  templateUrl: './addproduct.component.html',
  styleUrls: ['./addproduct.component.css'],
  imports:[FormsModule,CommonModule]
})
export class AddproductComponent {
  productName: string = '';
  productPrice: number = 0;
  isVisible: boolean = false;

  @Output() productAdded = new EventEmitter<{ name: string, price: number }>();

  open() {
    this.isVisible = true;
  }

  close() {
    this.isVisible = false;
  }

  onSubmit() {
    this.productAdded.emit({ name: this.productName, price: this.productPrice });
    this.close();
  }
}
