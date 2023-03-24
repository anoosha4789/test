import { GwDecimalInputDirective } from './gw-decimal-input.directive';
import { ElementRef } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';

class MockElementRef extends ElementRef { }
fdescribe('GwDecimalInputDirective', () => {
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
    const directive = new GwDecimalInputDirective(elRef);
    expect(directive).toBeTruthy();
  });
});
