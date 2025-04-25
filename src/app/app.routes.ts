import { Routes } from '@angular/router';
import { DynamicTableComponent } from './pages/dynamic-table-component/dynamic-table-component.component';
import { ProductService } from './services/shop/product.service';
import { CountTypeService } from './services/shop/count-type.service';

export const routes: Routes = [
  {
    path: 'dynamic-table',
    component: DynamicTableComponent,
    data: { modelName: 'Product', dataService: ProductService },
    providers: [ProductService],
  },

  {
    path: 'count-type',
    component: DynamicTableComponent,
    data: { modelName: 'CountType', dataService: CountTypeService },
    providers: [CountTypeService],
  },
];
