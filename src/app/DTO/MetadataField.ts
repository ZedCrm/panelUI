export interface MetadataField {
  name: string;
  type: string;
  label?: string;
  controlType?: string; // این خط باید اضافه بشه
  selectSource?: string; // برای فیلدهای select
  required?: boolean;
  inputType: 'text' | 'number' | 'boolean';
  minLength?: number;
  maxLength?: number;
  options?: any[];     
  displayName? : string ;  
  // هر چیز دیگه‌ای که لازمه...
}


  