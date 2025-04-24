import { TestBed } from '@angular/core/testing';

import { CountTypeService } from './count-type.service';

describe('CountTypeService', () => {
  let service: CountTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CountTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
