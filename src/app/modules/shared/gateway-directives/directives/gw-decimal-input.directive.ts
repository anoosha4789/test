import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[gw-decimal-input]'
})
export class GwDecimalInputDirective {

 // Allow only positive integers
 private regex: RegExp = new RegExp(/^[-+]?\d*\.?\d{0,9}$/g);
 // Allow key codes for special events Backspace, tab, end, home
 private specialKeys = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
 // Select All, Copy & Paste Feature Suport  
 private keys = ['Ctrl', 'a', 'c', 'v', 'x'];

 constructor(private el: ElementRef) { }
 @HostListener('keydown', ['$event'])
 onKeyDown(event: KeyboardEvent) {

   if (this.specialKeys.indexOf(event.key) !== -1 ||
       event.key === 'a' && event.ctrlKey === true || 
       event.key === 'c' && event.ctrlKey === true ||
       event.key === 'v' && event.ctrlKey === true ||
       event.key === 'x' && event.ctrlKey === true ) {
     return;
   }
   const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
 }

}
