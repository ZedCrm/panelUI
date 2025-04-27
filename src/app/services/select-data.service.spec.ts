import { TestBed } from '@angular/core/testing';

import { SelectDataService } from './select-data.service';

describe('SelectDataService', () => {
  let service: SelectDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
