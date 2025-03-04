import { Routes } from '@angular/router';
import { ProductComponent } from './pages/shop/product/product.component';
import { DynamicTableComponent } from './pages/dynamic-table-component/dynamic-table-component.component';
import { ProductService } from './services/shop/product.service';

export const routes: Routes = [

    {path:'product',component:ProductComponent},
    {
        path: 'dynamic-table',
        component: DynamicTableComponent,
        data: { modelName: 'Product', dataService: ProductService }, 
        providers: [ProductService],
      }
    
];
