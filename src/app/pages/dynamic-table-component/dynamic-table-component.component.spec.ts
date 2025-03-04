import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicTableComponentComponent } from './dynamic-table-component.component';

describe('DynamicTableComponentComponent', () => {
  let component: DynamicTableComponentComponent;
  let fixture: ComponentFixture<DynamicTableComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicTableComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicTableComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
