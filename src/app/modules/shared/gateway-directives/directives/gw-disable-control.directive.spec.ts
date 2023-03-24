import { GwDisableControlDirective } from './gw-disable-control.directive';
import { async, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, NgControl } from '@angular/forms';

fdescribe('GwDisableControlDirective', () => {
  let mockNgControl: any;

  beforeEach(async(() => {
    mockNgControl = jasmine.createSpyObj('ngControl', ['value', /* mock other methods required here */]);
    TestBed.configureTestingModule({
      providers: [
        { provide: NgControl, useValue: mockNgControl }
      ],
      imports: [FormsModule, ReactiveFormsModule]
    }).compileComponents();
  }));
  it('should create an instance', () => {
    const directive = new GwDisableControlDirective(mockNgControl);
    expect(directive).toBeTruthy();
  });
});
