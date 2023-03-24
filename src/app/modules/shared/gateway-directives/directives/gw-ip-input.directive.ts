import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';


@Directive({
  selector: '[gw-ip-input]'
})
export class GwIpInputDirective {
  
 // Allow only positive integers
 private regex: RegExp = new RegExp(/^\d+$/g);
 // Allow key codes for special events Backspace, tab, end, home
 private specialKeys = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
 // Copy 
 private keys = ['Ctrl', 'a', 'c', 'v', 'x'];

 constructor(private el: ElementRef) { }
 @HostListener('keydown', ['$event'])
 onKeyDown(event: KeyboardEvent) {
 
   if (this.specialKeys.indexOf(event.key) !== -1 || 
       event.key === 'a' && event.ctrlKey === true || 
       event.key === 'c' && event.ctrlKey === true || 
       event.key === 'v' && event.ctrlKey === true ||
       event.key === 'x' && event.ctrlKey === true) {
     return;
   }
   let current: string = this.el.nativeElement.value;
   let next: string = current.concat(event.key);
   if (next && !String(next).match(this.regex)) {
     event.preventDefault();
   }
 }
}
