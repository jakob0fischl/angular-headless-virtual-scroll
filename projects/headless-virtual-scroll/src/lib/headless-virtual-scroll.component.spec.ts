import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadlessVirtualScrollComponent } from './headless-virtual-scroll.component';

describe('HeadlessVirtualScrollComponent', () => {
  let component: HeadlessVirtualScrollComponent;
  let fixture: ComponentFixture<HeadlessVirtualScrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadlessVirtualScrollComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeadlessVirtualScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
