import { TestBed } from '@angular/core/testing';

import { HeadlessVirtualScrollService } from './headless-virtual-scroll.service';

describe('HeadlessVirtualScrollService', () => {
  let service: HeadlessVirtualScrollService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeadlessVirtualScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
