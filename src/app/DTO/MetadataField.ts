export interface MetadataField {
    name: string;        // نام فیلد
    type: string;        // نوع داده (string, number, boolean, ...)
    required: boolean;   // آیا فیلد اجباری است؟
    label?: string;        // لیبل نمایشی
    options?: any[];     // گزینه‌ها (برای dropdown یا select)
    displayName : string ;
    
  }
  