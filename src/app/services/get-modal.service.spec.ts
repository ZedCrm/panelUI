import { TestBed } from '@angular/core/testing';

import { GetModalService } from './get-modal.service';

describe('GetModalService', () => {
  let service: GetModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
