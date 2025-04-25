import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-toast-message',
  templateUrl: './toast-message.component.html',
  styleUrls: ['./toast-message.component.css'],
  imports:[CommonModule]
})
export class ToastMessageComponent {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';
  visible: boolean = true;

  ngOnInit() {
    setTimeout(() => {
      this.visible = false;
    }, 3000); // بعد از 3 ثانیه مخفی میشه
  }
}
