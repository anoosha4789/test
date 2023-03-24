import { ElementRef } from '@angular/core';
import { GwNumberInputDirective } from './gw-number-input.directive';
import { async, TestBed } from '@angular/core/testing';


class MockElementRef extends ElementRef { }

fdescribe('GwNumberInputDirective', () => {
  let elRef: ElementRef;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ElementRef, useValue: MockElementRef }
      ]
    }).compileComponents();
    elRef = TestBed.inject(ElementRef);
  }));

  it('should create an instance', () => {
    const directive = new GwNumberInputDirective(elRef);
    expect(directive).toBeTruthy();
  });
});
